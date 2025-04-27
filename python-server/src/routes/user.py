# src/routes/user.py
from fastapi import APIRouter, HTTPException, Depends
from db.database import db
from utils.jwt_handler import get_current_user
from models.user import UserProfile
from logger.logger import logger

router = APIRouter()

@router.get("/user/me", response_model=UserProfile)
async def get_user_profile(current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("sub")

    # Fetch basic user info
    user_record = await db.fetchrow(
        """
        SELECT id, username
        FROM user
        WHERE id = $1
        """,
        user_id
    )
    if not user_record:
        raise HTTPException(status_code=404, detail="User not found")

    # Fetch problems solved by difficulty
    easy_solved = await db.fetchval(
        """
        SELECT COUNT(*) FROM submissions s
        JOIN problems p ON s.problem_id = p.id
        WHERE s.user_id = $1 AND s.status = 'Accepted' AND p.difficulty = 'Easy'
        """,
        user_id
    ) or 0

    medium_solved = await db.fetchval(
        """
        SELECT COUNT(*) FROM submissions s
        JOIN problems p ON s.problem_id = p.id
        WHERE s.user_id = $1 AND s.status = 'Accepted' AND p.difficulty = 'Medium'
        """,
        user_id
    ) or 0

    hard_solved = await db.fetchval(
        """
        SELECT COUNT(*) FROM submissions s
        JOIN problems p ON s.problem_id = p.id
        WHERE s.user_id = $1 AND s.status = 'Accepted' AND p.difficulty = 'Hard'
        """,
        user_id
    ) or 0

    # Fetch list of problems solved
    solved_problems = await db.fetch(
        """
        SELECT DISTINCT p.id, p.title
        FROM submissions s
        JOIN problems p ON s.problem_id = p.id
        WHERE s.user_id = $1 AND s.status = 'Accepted'
        """,
        user_id
    )
    solved_list = [{"id": r["id"], "title": r["title"]} for r in solved_problems]

    logger.info(f"Fetched profile for user {user_record['username']}")
    return UserProfile(
        id=user_record["id"],
        username=user_record["username"],
        easy_solved=easy_solved,
        medium_solved=medium_solved,
        hard_solved=hard_solved,
        solved_problems=solved_list
    )
