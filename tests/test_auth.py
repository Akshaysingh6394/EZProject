import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import get_db, Base
from app.core.config import settings

# Test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
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

class TestAuth:
    def test_signup_success(self):
        response = client.post(
            "/api/auth/signup",
            json={"email": "test@example.com", "password": "testpass123"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "encrypted_url" in data
        assert data["message"] == "Verification email sent successfully"

    def test_signup_duplicate_email(self):
        # First signup
        client.post(
            "/api/auth/signup",
            json={"email": "duplicate@example.com", "password": "testpass123"}
        )
        
        # Second signup with same email
        response = client.post(
            "/api/auth/signup",
            json={"email": "duplicate@example.com", "password": "testpass123"}
        )
        assert response.status_code == 400
        assert "Email already registered" in response.json()["detail"]

    def test_login_invalid_credentials(self):
        response = client.post(
            "/api/auth/login",
            json={
                "email": "nonexistent@example.com",
                "password": "wrongpass",
                "user_type": "client"
            }
        )
        assert response.status_code == 401
        assert "Incorrect email, password, or user type" in response.json()["detail"]

    def test_verify_email_invalid_token(self):
        response = client.post(
            "/api/auth/verify-email",
            json={"token": "invalid_token"}
        )
        assert response.status_code == 400
        assert "Invalid verification token" in response.json()["detail"]