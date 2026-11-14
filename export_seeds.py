import os
import json
import sys

# Add backend to path
sys.path.insert(0, os.path.abspath("backend"))

from app.data.seed.roles import ROLE_TAXONOMY_SEED
from app.data.seed.skills import SKILL_TAXONOMY_SEED
from app.data.seed.resources import RESOURCE_ITEMS_SEED
from app.data.seed.questions import QUESTION_BANK_SEED

out_dir = os.path.join("frontend", "src", "data", "seed")
os.makedirs(out_dir, exist_ok=True)

# 1. roles.json
with open(os.path.join(out_dir, "roles.json"), "w", encoding="utf-8") as f:
    json.dump(ROLE_TAXONOMY_SEED, f, indent=2)

# 2. skills.json
with open(os.path.join(out_dir, "skills.json"), "w", encoding="utf-8") as f:
    json.dump(SKILL_TAXONOMY_SEED, f, indent=2)

# 3. resources.json
with open(os.path.join(out_dir, "resources.json"), "w", encoding="utf-8") as f:
    json.dump(RESOURCE_ITEMS_SEED, f, indent=2)

# 4. questions.json
with open(os.path.join(out_dir, "questions.json"), "w", encoding="utf-8") as f:
    json.dump(QUESTION_BANK_SEED, f, indent=2)

# 5. topicNotes.json (Curated offline mentor knowledge notes)
topic_notes = {
    "javascript": {
        "title": "JavaScript (ES6+) Fundamentals & Asynchronous Execution",
        "summary": "JavaScript is a single-threaded, event-driven runtime using an execution stack and event loop.",
        "key_concepts": [
            "Closures: Functions retain references to their outer lexical environment even after the parent returns.",
            "Event Loop: Synchronous call stack clears first, then the microtask queue (Promises), then macrotasks (setTimeout).",
            "Prototypes: Objects inherit methods and properties via __proto__ delegation chains.",
            "Immutability: Use const, Object.freeze, and spread operators (...obj) to avoid unintended mutations."
        ],
        "common_pitfalls": "Confusing == with === (loose vs strict equality) and neglecting to handle rejected Promises."
    },
    "react": {
        "title": "React 19 Component Architecture & Reactive State",
        "summary": "React builds declarative user interfaces with component functions and unidirectional data flow.",
        "key_concepts": [
            "Hooks: useState for local values, useEffect for synchronization side-effects, useMemo/useCallback for stability.",
            "Reconciliation: Virtual DOM diffing determines minimal actual browser DOM updates.",
            "State Lifting: Move shared state to the closest common ancestor or use state libraries like Zustand."
        ],
        "common_pitfalls": "Mutating state directly instead of passing new immutable values to setters."
    },
    "nodejs": {
        "title": "Node.js Server Runtime & Async I/O",
        "summary": "V8-powered asynchronous runtime using libuv for non-blocking disk and network I/O operations.",
        "key_concepts": [
            "Event Loop phases: timers, pending callbacks, idle/prepare, poll, check (setImmediate), close.",
            "Streams: Buffer and pipe chunks of data efficiently without loading entire files into RAM.",
            "REST APIs: Clean routing, standard HTTP verbs, status codes, and input validation middlewares."
        ],
        "common_pitfalls": "Blocking the single thread with heavy synchronous computations or sync file system operations."
    },
    "sql": {
        "title": "Relational Databases, Schema Modeling & SQL Querying",
        "summary": "Declarative language for querying and managing structured data with ACID guarantees.",
        "key_concepts": [
            "ACID: Atomicity, Consistency, Isolation, Durability ensure transaction safety.",
            "Indexing: B-tree indexes speed up WHERE filters and JOIN lookups at the expense of write overhead.",
            "Normal Form: 3NF eliminates redundant column dependencies and anomalies."
        ],
        "common_pitfalls": "Running N+1 queries in loops instead of batch JOINs or IN(...) aggregations."
    },
    "python": {
        "title": "Python Language Primitives & Backend Systems",
        "summary": "High-level, expressive language with robust object-oriented, functional, and asynchronous paradigms.",
        "key_concepts": [
            "Data structures: dict (hash map), list (dynamic array), set (hash table), tuple (immutable).",
            "Asyncio: Async/await event loop for concurrent network requests and FastAPI endpoints.",
            "Type hints: Pydantic schemas validate runtime payloads and generate OpenAPI documentation."
        ],
        "common_pitfalls": "Mutable default arguments (def f(x=[])) and Global Interpreter Lock (GIL) misconceptions."
    },
    "docker": {
        "title": "Containerization & Docker Orchestration",
        "summary": "Packages software into isolated containers sharing the host OS kernel for reproducible deployment.",
        "key_concepts": [
            "Images vs Containers: Images are immutable layered blueprints; containers are running instances.",
            "Multi-stage builds: Separate compile/build tools from runtime artifacts to minimize image size.",
            "Docker Compose: Declarative multi-container network definition for local development."
        ],
        "common_pitfalls": "Running containers as root user in production or forgetting .dockerignore."
    },
    "git": {
        "title": "Git Version Control & Branch Workflows",
        "summary": "Distributed content-addressable directed acyclic graph (DAG) tracking code changes over time.",
        "key_concepts": [
            "Commits: SHA-1/SHA-256 snapshots pointing to parent trees and author metadata.",
            "Branching: Lightweight movable pointers to specific commit nodes.",
            "Rebase vs Merge: Merge preserves history topography; rebase creates linear history."
        ],
        "common_pitfalls": "Force-pushing to shared branches or committing large binary files."
    },
    "html": {
        "title": "Semantic HTML5 & Accessibility (A11y)",
        "summary": "Standard markup language providing structural semantics and accessibility hooks for web clients.",
        "key_concepts": [
            "Semantic elements: header, main, nav, article, section, footer improve accessibility and SEO.",
            "ARIA: Landmark roles and attributes (aria-live, aria-expanded) for assistive screen readers."
        ],
        "common_pitfalls": "Overusing generic div elements instead of semantic buttons, inputs, and headings."
    },
    "css": {
        "title": "Modern CSS Layouts, Grid & Design Tokens",
        "summary": "Styling rules engine providing Flexbox, Grid, CSS custom properties, and fluid typography.",
        "key_concepts": [
            "Flexbox: One-dimensional layout axis (row or column) for component interiors.",
            "CSS Grid: Two-dimensional layout system with template areas and fractional units.",
            "Variables: Custom properties (--primary-color) enabling dynamic runtime theming."
        ],
        "common_pitfalls": "Over-relying on absolute positioning or !important overrides."
    }
}

with open(os.path.join(out_dir, "topicNotes.json"), "w", encoding="utf-8") as f:
    json.dump(topic_notes, f, indent=2)

print(f"Exported seed bundles successfully to {out_dir}")
