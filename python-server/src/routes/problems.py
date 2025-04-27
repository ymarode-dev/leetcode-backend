# src/routes/problems.py
from fastapi import APIRouter, Query, HTTPException
from typing import List, Optional
from models.problem import Problem, ProblemDetail
from db.database import db  
from utils.redis_cache import redis_cache

router = APIRouter()

@router.get("/problems", response_model=List[Problem])
async def get_problems(
    topic: Optional[str] = None,
    difficulty: Optional[str] = None,
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    cache_key = f"problems:{topic}:{difficulty}:{limit}:{offset}"
    cached_problems = await redis_cache.get(cache_key)

    if cached_problems:
        return cached_problems

    query = "SELECT id, title, difficulty, topic FROM problems"
    conditions = []
    values = []

    if topic:
        conditions.append("topic = $%d" % (len(values) + 1))
        values.append(topic)

    if difficulty:
        conditions.append("difficulty = $%d" % (len(values) + 1))
        values.append(difficulty)

    if conditions:
        query += " WHERE " + " AND ".join(conditions)

    query += " LIMIT $%d OFFSET $%d" % (len(values) + 1, len(values) + 2)
    values.extend([limit, offset])

    rows = await db.fetch(query, *values)
    problems = [Problem(**row) for row in rows]

    await redis_cache.set(cache_key, [problem.dict() for problem in problems], expire_seconds=600)

    return problems

@router.get("/problems/{problem_id}", response_model=ProblemDetail)
async def get_problem(problem_id: int):
    cache_key = f"problem:{problem_id}"
    cached_problem = await redis_cache.get(cache_key)

    if cached_problem:
        return cached_problem

    problem = await db.fetchrow(
        "SELECT id, title, description, difficulty, topic, testcases FROM problems WHERE id = $1",
        problem_id
    )
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    problem["testcases"] = problem["testcases"] if isinstance(problem["testcases"], list) else []
    problem_detail = ProblemDetail(**problem)

    await redis_cache.set(cache_key, problem_detail.dict(), expire_seconds=600)

    return problem_detail
