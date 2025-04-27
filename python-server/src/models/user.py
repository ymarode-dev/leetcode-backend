# src/models/user.py
from pydantic import BaseModel
from typing import List

class ProblemSolved(BaseModel):
    id: int
    title: str

class UserProfile(BaseModel):
    id: int
    username: str
    easy_solved: int
    medium_solved: int
    hard_solved: int
    solved_problems: List[ProblemSolved]
