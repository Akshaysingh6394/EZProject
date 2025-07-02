#!/usr/bin/env python3
"""
Production-ready runner for the Secure File Sharing System
"""
import uvicorn
import os
from app.main import app

if __name__ == "__main__":
    # Production configuration
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    workers = int(os.getenv("WORKERS", 1))
    
    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        workers=workers,
        reload=False,  # Set to False in production
        access_log=True,
        log_level="info"
    )