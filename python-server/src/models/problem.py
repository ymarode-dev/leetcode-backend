# src/models/problem.py
from pydantic import BaseModel
from typing import List, Dict


class Problem(BaseModel):
    id: int
    title: str
    difficulty: str
    topic: str

class Testcase(BaseModel):
    input: Dict[str, str] 
    output: str

class ProblemDetail(BaseModel):
    id: int
    title: str
    description: str
    difficulty: str
    topic: str
    testcases: List[Testcase]
