# src/db/database.py
import asyncpg
from config.settings import settings
from fastapi import HTTPException
from logger.logger import logger


class Database:
    def __init__(self):
        self.pool = None

    async def connect(self):
        try:
            self.pool = await asyncpg.create_pool(
                dsn=settings.DATABASE_URL
            )
            logger.info("Database connection pool created successfully.")
        except Exception as e:
            logger.error(f"Error connecting to the database: {e}")
            raise HTTPException(status_code=500, detail="Failed to connect to the database")

    async def fetch(self, query, *args):
        async with self.pool.acquire() as conn:
            return await conn.fetch(query, *args)

    async def fetchrow(self, query, *args):
        async with self.pool.acquire() as conn:
            return await conn.fetchrow(query, *args)

    async def execute(self, query, *args):
        async with self.pool.acquire() as conn:
            return await conn.execute(query, *args)
        
    async def executemany(self, query, *args):
        async with self.pool.acquire() as conn:
            return await conn.executemany(query, *args)
        
    async def close(self):
        if self.pool:
            await self.pool.close()
            logger.info("Database connection pool closed.")

db = Database()

