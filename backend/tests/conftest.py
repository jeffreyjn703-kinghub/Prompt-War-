import os
import sys

# Ensure backend directory is in sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

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
