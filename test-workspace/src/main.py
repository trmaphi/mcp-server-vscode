"""Simple FastAPI application for testing debug configuration."""

import os
from fastapi import FastAPI

app = FastAPI(title="Test API", version="1.0.0")


@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "Hello World", "status": "ok"}


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy"}


@app.get("/env")
async def check_env():
    """Check environment variables from debug config."""
    env_vars = {
        "LOG_LEVEL": os.getenv("LOG_LEVEL"),
        "UVICORN_PORT": os.getenv("UVICORN_PORT"),
    }
    return {"environment": env_vars}


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("UVICORN_PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)
