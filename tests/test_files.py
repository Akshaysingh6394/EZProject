import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import get_db, Base
from app.models import User
from app.core.security import get_password_hash, create_access_token
import io

# Test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_files.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

class TestFiles:
    def setup_method(self):
        # Create test users
        db = TestingSessionLocal()
        
        # Create ops user
        ops_user = User(
            email="ops@example.com",
            hashed_password=get_password_hash("opspass123"),
            user_type="ops",
            is_verified=True
        )
        db.add(ops_user)
        
        # Create client user
        client_user = User(
            email="client@example.com",
            hashed_password=get_password_hash("clientpass123"),
            user_type="client",
            is_verified=True
        )
        db.add(client_user)
        
        db.commit()
        db.close()
        
        # Generate tokens
        self.ops_token = create_access_token(data={"sub": "ops@example.com"})
        self.client_token = create_access_token(data={"sub": "client@example.com"})

    def test_upload_file_success(self):
        # Create a test file
        test_file = io.BytesIO(b"test file content")
        test_file.name = "test.docx"
        
        response = client.post(
            "/api/files/upload",
            files={"file": ("test.docx", test_file, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")},
            headers={"Authorization": f"Bearer {self.ops_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["filename"] == "test.docx"
        assert data["message"] == "File uploaded successfully"

    def test_upload_file_client_forbidden(self):
        test_file = io.BytesIO(b"test file content")
        test_file.name = "test.docx"
        
        response = client.post(
            "/api/files/upload",
            files={"file": ("test.docx", test_file, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")},
            headers={"Authorization": f"Bearer {self.client_token}"}
        )
        assert response.status_code == 403
        assert "Only operations users can upload files" in response.json()["detail"]

    def test_upload_invalid_file_type(self):
        test_file = io.BytesIO(b"test file content")
        test_file.name = "test.txt"
        
        response = client.post(
            "/api/files/upload",
            files={"file": ("test.txt", test_file, "text/plain")},
            headers={"Authorization": f"Bearer {self.ops_token}"}
        )
        assert response.status_code == 400
        assert "File type not allowed" in response.json()["detail"]

    def test_list_files_client_success(self):
        response = client.get(
            "/api/files/list",
            headers={"Authorization": f"Bearer {self.client_token}"}
        )
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_list_files_ops_forbidden(self):
        response = client.get(
            "/api/files/list",
            headers={"Authorization": f"Bearer {self.ops_token}"}
        )
        assert response.status_code == 403
        assert "Only client users can list files" in response.json()["detail"]