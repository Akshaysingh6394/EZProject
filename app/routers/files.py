from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List
import os
import shutil
from pathlib import Path
from datetime import datetime, timedelta
import uuid

from app.database import get_db
from app.models import User, FileRecord, DownloadRecord
from app.schemas import FileUploadResponse, FileInfo, DownloadResponse, DownloadHistoryItem
from app.routers.auth import get_current_user
from app.core.security import generate_download_token
from app.core.config import settings

router = APIRouter()

def save_upload_file(upload_file: UploadFile, destination: Path) -> None:
    try:
        with destination.open("wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer)
    finally:
        upload_file.file.close()

def is_allowed_file(filename: str) -> bool:
    return any(filename.lower().endswith(ext) for ext in settings.ALLOWED_EXTENSIONS)

def get_file_type(filename: str) -> str:
    for ext in settings.ALLOWED_EXTENSIONS:
        if filename.lower().endswith(ext):
            return ext[1:]  # Remove the dot
    return "unknown"

@router.post("/upload", response_model=FileUploadResponse)
async def upload_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if user is ops
    if current_user.user_type != "ops":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only operations users can upload files"
        )
    
    # Validate file type
    if not is_allowed_file(file.filename):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Only {', '.join(settings.ALLOWED_EXTENSIONS)} files are permitted"
        )
    
    # Check file size
    if file.size > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size is {settings.MAX_FILE_SIZE / (1024*1024)}MB"
        )
    
    # Generate unique filename
    file_extension = Path(file.filename).suffix
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = Path(settings.UPLOAD_DIR) / unique_filename
    
    # Save file
    save_upload_file(file, file_path)
    
    # Save to database
    db_file = FileRecord(
        filename=unique_filename,
        original_filename=file.filename,
        file_path=str(file_path),
        file_type=get_file_type(file.filename),
        file_size=file.size,
        uploaded_by=current_user.id
    )
    db.add(db_file)
    db.commit()
    db.refresh(db_file)
    
    return FileUploadResponse(
        id=db_file.id,
        filename=file.filename,
        file_type=db_file.file_type,
        file_size=file.size,
        message="File uploaded successfully"
    )

@router.get("/list", response_model=List[FileInfo])
async def list_files(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Only client users can list files
    if current_user.user_type != "client":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only client users can list files"
        )
    
    files = db.query(FileRecord).all()
    file_list = []
    
    for file in files:
        uploader = db.query(User).filter(User.id == file.uploaded_by).first()
        file_list.append(FileInfo(
            id=file.id,
            filename=file.original_filename,
            original_filename=file.original_filename,
            file_type=file.file_type,
            file_size=file.file_size,
            uploaded_by=uploader.email if uploader else "Unknown",
            uploaded_at=file.uploaded_at
        ))
    
    return file_list

@router.get("/download-file/{file_id}", response_model=DownloadResponse)
async def generate_download_link(
    file_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Only client users can download files
    if current_user.user_type != "client":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only client users can download files"
        )
    
    # Check if file exists
    file_record = db.query(FileRecord).filter(FileRecord.id == file_id).first()
    if not file_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    # Generate download token
    download_token = generate_download_token()
    expires_at = datetime.utcnow() + timedelta(hours=24)  # 24 hour expiry
    
    # Save download record
    download_record = DownloadRecord(
        user_id=current_user.id,
        file_id=file_id,
        download_token=download_token,
        expires_at=expires_at
    )
    db.add(download_record)
    db.commit()
    
    download_link = f"http://localhost:8000/api/files/secure-download/{download_token}"
    
    return DownloadResponse(
        download_link=download_link,
        message="Secure download link generated successfully"
    )

@router.get("/secure-download/{token}")
async def secure_download(
    token: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Only client users can access download links
    if current_user.user_type != "client":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Only client users can download files"
        )
    
    # Find download record
    download_record = db.query(DownloadRecord).filter(
        DownloadRecord.download_token == token,
        DownloadRecord.user_id == current_user.id
    ).first()
    
    if not download_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid download link or access denied"
        )
    
    # Check if expired
    if download_record.expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="Download link has expired"
        )
    
    # Get file record
    file_record = db.query(FileRecord).filter(FileRecord.id == download_record.file_id).first()
    if not file_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    # Check if file exists on disk
    if not os.path.exists(file_record.file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found on server"
        )
    
    # Mark as used
    download_record.is_used = True
    db.commit()
    
    return FileResponse(
        path=file_record.file_path,
        filename=file_record.original_filename,
        media_type='application/octet-stream'
    )

@router.get("/download-history", response_model=List[DownloadHistoryItem])
async def get_download_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Only client users can view download history
    if current_user.user_type != "client":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only client users can view download history"
        )
    
    downloads = db.query(DownloadRecord).filter(
        DownloadRecord.user_id == current_user.id
    ).order_by(DownloadRecord.downloaded_at.desc()).all()
    
    history = []
    for download in downloads:
        file_record = db.query(FileRecord).filter(FileRecord.id == download.file_id).first()
        if file_record:
            status_text = "expired" if download.expires_at < datetime.utcnow() else "completed"
            history.append(DownloadHistoryItem(
                id=download.id,
                filename=file_record.original_filename,
                file_type=file_record.file_type,
                downloaded_at=download.downloaded_at,
                download_url=f"http://localhost:8000/api/files/secure-download/{download.download_token}",
                status=status_text
            ))
    
    return history

@router.get("/uploaded", response_model=List[FileInfo])
async def get_uploaded_files(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Only ops users can view uploaded files
    if current_user.user_type != "ops":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only operations users can view uploaded files"
        )
    
    files = db.query(FileRecord).filter(FileRecord.uploaded_by == current_user.id).all()
    file_list = []
    
    for file in files:
        file_list.append(FileInfo(
            id=file.id,
            filename=file.original_filename,
            original_filename=file.original_filename,
            file_type=file.file_type,
            file_size=file.file_size,
            uploaded_by=current_user.email,
            uploaded_at=file.uploaded_at
        ))
    
    return file_list