import json
import logging
from typing import Any, AsyncGenerator, Dict, Optional, Type
import httpx
from pydantic import BaseModel
from app.config import settings

logger = logging.getLogger("skillpath.llm")

class LLMClient:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model = settings.GEMINI_MODEL
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models"

    @property
    def is_available(self) -> bool:
        return bool(self.api_key and len(self.api_key.strip()) > 5)

    async def generate_json(
        self,
        system_prompt: str,
        user_prompt: str,
        schema_cls: Optional[Type[BaseModel]] = None,
        retries: int = 1
    ) -> Optional[Dict[str, Any]]:
        """
        Calls Gemini API with structured JSON output expectation.
        Retries once on invalid structured output.
        Returns dict or None (signaling fallback).
        """
        if not self.is_available:
            logger.info("GEMINI_API_KEY not configured. Using rule-based fallback engine.")
            return None

        endpoint = f"{self.base_url}/{self.model}:generateContent?key={self.api_key}"

        payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": f"{user_prompt}"}]
                }
            ],
            "system_instruction": {
                "parts": [{"text": system_prompt}]
            },
            "generationConfig": {
                "response_mime_type": "application/json",
                "temperature": 0.2
            }
        }

        attempts = 0
        max_attempts = 1 + retries

        while attempts < max_attempts:
            attempts += 1
            try:
                async with httpx.AsyncClient(timeout=30.0) as client:
                    response = await client.post(endpoint, json=payload)
                    if response.status_code != 200:
                        logger.warning(f"Gemini API returned status {response.status_code}: {response.text}")
                        continue
                    
                    data = response.json()
                    candidates = data.get("candidates", [])
                    if not candidates:
                        logger.warning("Gemini returned no candidates.")
                        continue
                    
                    parts = candidates[0].get("content", {}).get("parts", [])
                    if not parts:
                        continue
                    
                    raw_text = parts[0].get("text", "").strip()
                    parsed = json.loads(raw_text)

                    if schema_cls:
                        # Validate with Pydantic model
                        validated = schema_cls.model_validate(parsed)
                        return validated.model_dump()
                    
                    return parsed
            except Exception as e:
                logger.warning(f"LLM call attempt {attempts} failed: {e}")
                if attempts < max_attempts:
                    logger.info("Retrying LLM call once before fallback...")
        
        logger.warning("All LLM attempts failed. Delegating to deterministic fallback.")
        return None

    async def stream_chat(
        self,
        system_prompt: str,
        user_prompt: str
    ) -> AsyncGenerator[str, None]:
        """
        Streams chat responses. If Gemini is available, uses streamGenerateContent.
        """
        if not self.is_available:
            return

        endpoint = f"{self.base_url}/{self.model}:streamGenerateContent?key={self.api_key}&alt=sse"

        payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": user_prompt}]
                }
            ],
            "system_instruction": {
                "parts": [{"text": system_prompt}]
            },
            "generationConfig": {
                "temperature": 0.7
            }
        }

        try:
            async with httpx.AsyncClient(timeout=45.0) as client:
                async with client.stream("POST", endpoint, json=payload) as response:
                    async for line in response.aiter_lines():
                        if line.startswith("data: "):
                            data_str = line[6:].strip()
                            if data_str == "[DONE]":
                                break
                            try:
                                chunk_json = json.loads(data_str)
                                candidates = chunk_json.get("candidates", [])
                                if candidates:
                                    parts = candidates[0].get("content", {}).get("parts", [])
                                    for p in parts:
                                        text = p.get("text", "")
                                        if text:
                                            yield text
                            except Exception:
                                continue
        except Exception as e:
            logger.warning(f"Gemini streaming failed: {e}")

llm_client = LLMClient()
