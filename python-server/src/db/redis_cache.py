# src/utils/redis_cache.py
import aioredis
import json
from logger.logger import logger
from config.settings import settings


class RedisCache:
    def __init__(self, url: str):
        self._url = url
        self.redis = None

    async def connect(self):
        self.redis = await aioredis.from_url(self._url, encoding="utf-8", decode_responses=True)
        logger.info("Connected to Redis.")

    async def get(self, key: str):
        if self.redis:
            data = await self.redis.get(key)
            if data:
                return json.loads(data)
        return None

    async def set(self, key: str, value: dict, expire: int = 300):
        if self.redis:
            await self.redis.set(key, json.dumps(value), ex=expire)

    async def delete(self, key: str):
        if self.redis:
            await self.redis.delete(key)

    async def exists(self, key: str) -> bool:
        if self.redis:
            exists = await self.redis.exists(key)
            return exists > 0
        return False
    
    async def clear(self):
        if self.redis:
            await self.redis.flushdb()
            logger.info("Redis cache cleared.")

    async def close(self):
        if self.redis:
            await self.redis.close()
            logger.info("Disconnected to Redis.")

redis_cache = RedisCache(url=settings.REDIS_URL)
