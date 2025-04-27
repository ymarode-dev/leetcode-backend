# src/routes/routes.py
from fastapi import APIRouter, HTTPException
from models.auth import UserCreate, UserLogin
from utils.password_handler import hash_password, verify_password
from utils.jwt_handler import create_access_token
from db.database import db
from logger.logger import logger

router = APIRouter()

@router.post("/signup")
async def signup(user: UserCreate):
    hashed_pw = hash_password(user.password)
    record = await db.fetchrow(
        "INSERT INTO user (username, password) VALUES ($1, $2) RETURNING id",
        user.username, hashed_pw
    )
    if not record:
        logger.error(f"Failed to create user {user.username}.")
        raise HTTPException(status_code=500, detail="Failed to create user")

    token = create_access_token({"sub": record["id"]})
    
    logger.info(f"User {user.username} signed up.")
    return {
        "message": "Signup successful",
        "access_token": token
    }

@router.post("/login")
async def login(user: UserLogin):
    record = await db.fetchrow(
        "SELECT * FROM user WHERE username = $1",
        user.username
    )
    if not record or not verify_password(user.password, record['password']):
        logger.error(f"Failed to login user {user.username}.")
        raise HTTPException(status_code=401, detail="Invalid credentials")

    expires_in = 60 * 24 * 7 if user.remember_me else 60
    token = create_access_token({"sub": record['id']}, expires_in_minutes=expires_in)

    logger.info(f"User {user.username} logged in.")
    return {"access_token": token}

