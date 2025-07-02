from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    user_type: str

class User(UserBase):
    id: int
    user_type: str
    is_verified: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class TokenData(BaseModel):
    email: Optional[str] = None

# File schemas
class FileUploadResponse(BaseModel):
    id: int
    filename: str
    file_type: str
    file_size: int
    message: str

class FileInfo(BaseModel):
    id: int
    filename: str
    original_filename: str
    file_type: str
    file_size: int
    uploaded_by: str
    uploaded_at: datetime
    
    class Config:
        from_attributes = True

class DownloadResponse(BaseModel):
    download_link: str
    message: str

class DownloadHistoryItem(BaseModel):
    id: int
    filename: str
    file_type: str
    downloaded_at: datetime
    download_url: str
    status: str
    
    class Config:
        from_attributes = True

# Email verification
class EmailVerificationResponse(BaseModel):
    encrypted_url: str
    message: str

class VerifyEmailRequest(BaseModel):
    token: str