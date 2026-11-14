import os
import pytest
from app.llm.client import llm_client

# Explicitly disable external LLM API calls during tests
llm_client.api_key = ""

@pytest.fixture(autouse=True, scope="session")
def disable_llm_for_tests():
    old_key = llm_client.api_key
    llm_client.api_key = ""
    yield
    llm_client.api_key = old_key
