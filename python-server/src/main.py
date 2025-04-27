# src/main.py
from fastapi import FastAPI
from routes import auth, problems, user
from logger.logger import logger
from db.database import db, setup_db  
from db.redis_cache import redis_cache


app = FastAPI()

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(problems.router, prefix="/problems", tags=["Problems"])
app.include_router(user.router, prefix="/user", tags=["User"])

setup_db(app)

@app.on_event("startup")
async def startup_event():
    await db.connect()
    await redis_cache.connect()
    logger.info("Python HTTP Server started successfully!")


@app.on_event("shutdown")
async def shutdown_event():
    await db.close()
    await redis_cache.close()
    logger.info("Python HTTP Server stopped!")


@app.get("/")
def root():
    return {"message": "Python HTTP Server is running!"}
