# 120+ Curated learning resources across core skills
# types: course, tutorial, doc, video, exercise, project
RESOURCE_ITEMS_SEED = [
    # HTML (5 items)
    {
        "title": "MDN Web Docs: HTML Structuring the Web",
        "type": "doc",
        "skill_id": "html",
        "difficulty": "beginner",
        "estimated_hours": 6,
        "provider": "MDN Web Docs",
        "url": "https://developer.mozilla.org/en-US/docs/Learn/HTML",
        "description": "Comprehensive reference and interactive examples for HTML semantics and forms."
    },
    {
        "title": "Responsive Web Design Certification: HTML Basics",
        "type": "course",
        "skill_id": "html",
        "difficulty": "beginner",
        "estimated_hours": 8,
        "provider": "freeCodeCamp",
        "url": "https://www.freecodecamp.org/learn/2022/responsive-web-design/",
        "description": "Hands-on browser coding challenges teaching semantic tags and structural elements."
    },
    {
        "title": "HTML Full Course for Beginners",
        "type": "video",
        "skill_id": "html",
        "difficulty": "beginner",
        "estimated_hours": 2,
        "provider": "Traversy Media",
        "url": "https://www.youtube.com/watch?v=kUMe1FH4CHE",
        "description": "Crash course covering modern semantic tags, tables, forms, and validation."
    },
    {
        "title": "Build a Technical Documentation Page",
        "type": "project",
        "skill_id": "html",
        "difficulty": "beginner",
        "estimated_hours": 4,
        "provider": "The Odin Project",
        "url": "https://www.theodinproject.com/lessons/foundations-html-foundations",
        "description": "Practical project structuring a technical documentation portal with accessible navigation."
    },
    {
        "title": "W3C Web Accessibility Tutorials: HTML Elements",
        "type": "tutorial",
        "skill_id": "html",
        "difficulty": "intermediate",
        "estimated_hours": 3,
        "provider": "W3C Web Accessibility Initiative",
        "url": "https://www.w3.org/WAI/tutorials/",
        "description": "In-depth guide on accessible landmark elements, headings, and input attributes."
    },

    # CSS (6 items)
    {
        "title": "MDN Learn CSS: Layout and Modern Responsive Design",
        "type": "doc",
        "skill_id": "css",
        "difficulty": "beginner",
        "estimated_hours": 10,
        "provider": "MDN Web Docs",
        "url": "https://developer.mozilla.org/en-US/docs/Learn/CSS",
        "description": "Deep dive into CSS selectors, cascade, Flexbox, Grid, and responsive queries."
    },
    {
        "title": "Flexbox Froggy & Grid Garden Practice",
        "type": "exercise",
        "skill_id": "css",
        "difficulty": "beginner",
        "estimated_hours": 3,
        "provider": "Codepip",
        "url": "https://flexboxfroggy.com/",
        "description": "Interactive visual game mastering CSS Flexbox alignment and Grid positioning."
    },
    {
        "title": "CSS Grid Complete Guide",
        "type": "tutorial",
        "skill_id": "css",
        "difficulty": "intermediate",
        "estimated_hours": 4,
        "provider": "CSS-Tricks",
        "url": "https://css-tricks.com/snippets/css/complete-guide-grid/",
        "description": "The definitive visual guide to CSS Grid properties with visual demonstrations."
    },
    {
        "title": "Build an E-commerce Landing Page with CSS Grid & Flexbox",
        "type": "project",
        "skill_id": "css",
        "difficulty": "intermediate",
        "estimated_hours": 6,
        "provider": "Frontend Mentor",
        "url": "https://www.frontendmentor.io/challenges",
        "description": "Pixel-perfect implementation of a responsive product landing page."
    },
    {
        "title": "Modern CSS Solutions for Common Patterns",
        "type": "tutorial",
        "skill_id": "css",
        "difficulty": "advanced",
        "estimated_hours": 5,
        "provider": "ModernCSS.dev",
        "url": "https://moderncss.dev/",
        "description": "Advanced CSS techniques: subgrid, container queries, clamp(), and fluid typography."
    },
    {
        "title": "Tailwind CSS Official Video Series",
        "type": "video",
        "skill_id": "tailwind",
        "difficulty": "beginner",
        "estimated_hours": 4,
        "provider": "Tailwind Labs",
        "url": "https://tailwindcss.com/docs/utility-first",
        "description": "Mastering utility classes, custom design tokens, dark mode, and responsive variants."
    },

    # JavaScript (8 items)
    {
        "title": "The Modern JavaScript Tutorial (javascript.info)",
        "type": "tutorial",
        "skill_id": "javascript",
        "difficulty": "beginner",
        "estimated_hours": 15,
        "provider": "JavaScript.info",
        "url": "https://javascript.info/",
        "description": "Gold standard tutorial from JS basics to closures, prototypes, event loops, and DOM."
    },
    {
        "title": "JavaScript Algorithms and Data Structures Certification",
        "type": "course",
        "skill_id": "javascript",
        "difficulty": "intermediate",
        "estimated_hours": 20,
        "provider": "freeCodeCamp",
        "url": "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/",
        "description": "Algorithmic thinking, array methods, recursion, and object-oriented programming."
    },
    {
        "title": "You Don't Know JS Yet: Scope & Closures",
        "type": "doc",
        "skill_id": "javascript",
        "difficulty": "advanced",
        "estimated_hours": 8,
        "provider": "Kyle Simpson (GitHub)",
        "url": "https://github.com/getify/You-Dont-Know-JS",
        "description": "In-depth breakdown of lexical scope, hoisting, closures, and the JS execution engine."
    },
    {
        "title": "Interactive JavaScript Async / Await & Promises Practice",
        "type": "exercise",
        "skill_id": "javascript",
        "difficulty": "intermediate",
        "estimated_hours": 4,
        "provider": "JavaScript30",
        "url": "https://javascript30.com/",
        "description": "30 days of vanilla JS coding challenges without frameworks or libraries."
    },
    {
        "title": "What the heck is the event loop anyway?",
        "type": "video",
        "skill_id": "javascript",
        "difficulty": "intermediate",
        "estimated_hours": 1,
        "provider": "Philip Roberts (JSConf)",
        "url": "https://www.youtube.com/watch?v=8aGhZQkoFbQ",
        "description": "Legendary conference talk explaining call stack, web APIs, event loop, and task queue."
    },
    {
        "title": "Build an Interactive Kanban Task Board in Vanilla JS",
        "type": "project",
        "skill_id": "javascript",
        "difficulty": "intermediate",
        "estimated_hours": 7,
        "provider": "The Odin Project",
        "url": "https://www.theodinproject.com/paths/full-stack-javascript/courses/javascript",
        "description": "Drag-and-drop stateful task board with localStorage persistence and modal editing."
    },
    {
        "title": "Remedial JavaScript: Core Syntax & Function Fundamentals",
        "type": "course",
        "skill_id": "javascript",
        "difficulty": "beginner",
        "estimated_hours": 5,
        "provider": "freeCodeCamp",
        "url": "https://www.freecodecamp.org/news/learn-javascript-for-beginners/",
        "description": "Simplified primer on variables, conditionals, loops, functions, and arrays."
    },
    {
        "title": "TypeScript Handbook: The Basics",
        "type": "doc",
        "skill_id": "typescript",
        "difficulty": "intermediate",
        "estimated_hours": 6,
        "provider": "TypeScript Official Docs",
        "url": "https://www.typescriptlang.org/docs/handbook/intro.html",
        "description": "Official guide to static types, interfaces, unions, generics, and type narrowing."
    },

    # React (7 items)
    {
        "title": "React Official Documentation: Describing the UI & State",
        "type": "doc",
        "skill_id": "react",
        "difficulty": "beginner",
        "estimated_hours": 10,
        "provider": "React.dev",
        "url": "https://react.dev/learn",
        "description": "Modern React docs emphasizing mental models, hooks, component purity, and effects."
    },
    {
        "title": "Full Stack Open: Part 1 - Introduction to React",
        "type": "course",
        "skill_id": "react",
        "difficulty": "intermediate",
        "estimated_hours": 12,
        "provider": "University of Helsinki",
        "url": "https://fullstackopen.com/en/part1",
        "description": "World-class university curriculum teaching React components, state, and event handlers."
    },
    {
        "title": "React Hooks in Depth: useState, useEffect, useRef, useMemo",
        "type": "tutorial",
        "skill_id": "react",
        "difficulty": "intermediate",
        "estimated_hours": 5,
        "provider": "Web Dev Simplified",
        "url": "https://www.youtube.com/playlist?list=PLZlA0Gpn_vH8EtggFGERCwMY56Jr98OXh",
        "description": "Video breakdowns showing common pitfalls and performance optimizations for each hook."
    },
    {
        "title": "Build a Multi-Step Checkout Flow with React & Tailwind",
        "type": "project",
        "skill_id": "react",
        "difficulty": "intermediate",
        "estimated_hours": 8,
        "provider": "Frontend Mentor",
        "url": "https://www.frontendmentor.io/challenges/multistep-form-YVAnSdqQBJ",
        "description": "Multi-step stateful form with form validation, step navigation, and summary preview."
    },
    {
        "title": "Remedial React: Component Basics and State Mental Models",
        "type": "tutorial",
        "skill_id": "react",
        "difficulty": "beginner",
        "estimated_hours": 4,
        "provider": "React.dev Quick Start",
        "url": "https://react.dev/learn/tutorial-tic-tac-toe",
        "description": "Step-by-step beginner friendly Tic-Tac-Toe tutorial covering props, state, and history."
    },
    {
        "title": "Next.js App Router Foundations",
        "type": "course",
        "skill_id": "nextjs",
        "difficulty": "intermediate",
        "estimated_hours": 8,
        "provider": "Vercel Learn",
        "url": "https://nextjs.org/learn",
        "description": "Server Components, streaming, suspense, metadata, and dynamic routing."
    },
    {
        "title": "Redux Essentials: A Practical Guide to Redux Toolkit",
        "type": "doc",
        "skill_id": "redux",
        "difficulty": "intermediate",
        "estimated_hours": 6,
        "provider": "Redux Official Docs",
        "url": "https://redux.js.org/tutorials/essentials/part-1-overview-concepts",
        "description": "Standard modern state management using createSlice, configureStore, and createAsyncThunk."
    },

    # Node.js & Express (7 items)
    {
        "title": "Node.js Official Documentation & Getting Started",
        "type": "doc",
        "skill_id": "nodejs",
        "difficulty": "beginner",
        "estimated_hours": 6,
        "provider": "Node.js Org",
        "url": "https://nodejs.org/en/learn/getting-started/introduction-to-nodejs",
        "description": "Node event loop, fs module, streams, HTTP servers, and npm package management."
    },
    {
        "title": "The Odin Project: NodeJS Course",
        "type": "course",
        "skill_id": "nodejs",
        "difficulty": "intermediate",
        "estimated_hours": 14,
        "provider": "The Odin Project",
        "url": "https://www.theodinproject.com/paths/full-stack-javascript/courses/nodejs",
        "description": "Complete path building backend servers, routing, middleware, and database connections."
    },
    {
        "title": "Express.js Guide: Routing, Middleware, and Error Handling",
        "type": "doc",
        "skill_id": "express",
        "difficulty": "beginner",
        "estimated_hours": 5,
        "provider": "Expressjs.com",
        "url": "https://expressjs.com/en/guide/routing.html",
        "description": "Understanding middleware chain, route parameters, static serving, and custom error handlers."
    },
    {
        "title": "Build a Complete REST API with Express and PostgreSQL",
        "type": "project",
        "skill_id": "express",
        "difficulty": "intermediate",
        "estimated_hours": 10,
        "provider": "freeCodeCamp",
        "url": "https://www.freecodecamp.org/news/build-a-restful-api-using-node-express-and-postgresql/",
        "description": "Full CRUD API with input validation, JWT authentication, and SQL connection pool."
    },
    {
        "title": "RESTful API Architectural Constraints and Best Practices",
        "type": "tutorial",
        "skill_id": "rest-api",
        "difficulty": "intermediate",
        "estimated_hours": 4,
        "provider": "roadmap.sh",
        "url": "https://roadmap.sh/guides/rest-api-best-practices",
        "description": "HTTP verbs, idempotent operations, pagination, filtering, status codes, and API versioning."
    },
    {
        "title": "Remedial Node.js: Server Fundamentals and Modules",
        "type": "tutorial",
        "skill_id": "nodejs",
        "difficulty": "beginner",
        "estimated_hours": 3,
        "provider": "MDN Web Docs",
        "url": "https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/Introduction",
        "description": "Gentle intro to server-side JS, CommonJS vs ES Modules, and basic HTTP endpoints."
    },
    {
        "title": "JSON Web Token (JWT) Security and Refresh Token Rotation",
        "type": "tutorial",
        "skill_id": "auth-jwt",
        "difficulty": "intermediate",
        "estimated_hours": 5,
        "provider": "Auth0 Docs",
        "url": "https://auth0.com/docs/secure/tokens/json-web-tokens",
        "description": "Token anatomy, signing algorithms, secure cookie storage, CSRF protection, and token expiry."
    },

    # Python & FastAPI (7 items)
    {
        "title": "The Python Tutorial (Official Documentation)",
        "type": "doc",
        "skill_id": "python",
        "difficulty": "beginner",
        "estimated_hours": 10,
        "provider": "Python Software Foundation",
        "url": "https://docs.python.org/3/tutorial/",
        "description": "The definitive guide to Python syntax, data structures, list comprehensions, and modules."
    },
    {
        "title": "FastAPI Official Tutorial: User Guide",
        "type": "doc",
        "skill_id": "fastapi",
        "difficulty": "beginner",
        "estimated_hours": 8,
        "provider": "FastAPI (tiangolo)",
        "url": "https://fastapi.tiangolo.com/tutorial/",
        "description": "Path operations, query parameters, Pydantic request/response schemas, and dependency injection."
    },
    {
        "title": "CS50's Introduction to Programming with Python",
        "type": "course",
        "skill_id": "python",
        "difficulty": "beginner",
        "estimated_hours": 20,
        "provider": "Harvard CS50 / edX",
        "url": "https://cs50.harvard.edu/python/",
        "description": "Harvard's rigorous introduction to Python functions, variables, conditionals, loops, and OOP."
    },
    {
        "title": "Build a High-Performance Async Microservice with FastAPI & SQLAlchemy",
        "type": "project",
        "skill_id": "fastapi",
        "difficulty": "intermediate",
        "estimated_hours": 8,
        "provider": "TestDriven.io",
        "url": "https://testdriven.io/courses/fastapi-celery/",
        "description": "Async database connections, background tasks, unit testing with Pytest, and Dockerization."
    },
    {
        "title": "Advanced Python: Generators, Decorators, and Concurrency",
        "type": "tutorial",
        "skill_id": "python",
        "difficulty": "advanced",
        "estimated_hours": 6,
        "provider": "Real Python",
        "url": "https://realpython.com/primer-on-python-decorators/",
        "description": "Deep understanding of closure mechanics, custom decorators, and async asyncio event loops."
    },
    {
        "title": "Remedial Python: Essential Syntax and Built-in Collections",
        "type": "exercise",
        "skill_id": "python",
        "difficulty": "beginner",
        "estimated_hours": 4,
        "provider": "Exercism",
        "url": "https://exercism.org/tracks/python",
        "description": "Automated code tests covering strings, lists, dictionaries, tuples, and error handling."
    },
    {
        "title": "Django for Beginners: Build and Deploy",
        "type": "course",
        "skill_id": "django",
        "difficulty": "intermediate",
        "estimated_hours": 12,
        "provider": "Will Vincent",
        "url": "https://djangoforbeginners.com/",
        "description": "Full-stack Django app with user registration, models, views, templates, and Heroku deploy."
    },

    # SQL & Databases (8 items)
    {
        "title": "SQLBolt: Interactive Lessons and Exercises",
        "type": "exercise",
        "skill_id": "sql",
        "difficulty": "beginner",
        "estimated_hours": 4,
        "provider": "SQLBolt",
        "url": "https://sqlbolt.com/",
        "description": "Interactive browser exercises covering SELECT, WHERE, JOINs, aggregations, and subqueries."
    },
    {
        "title": "Mode Analytics SQL Tutorial for Data Analysis",
        "type": "tutorial",
        "skill_id": "sql",
        "difficulty": "intermediate",
        "estimated_hours": 8,
        "provider": "Mode Analytics",
        "url": "https://mode.com/sql-tutorial/",
        "description": "Real-world business queries: window functions, self-joins, CTEs, and string manipulation."
    },
    {
        "title": "PostgreSQL Official Documentation & Tutorial",
        "type": "doc",
        "skill_id": "postgresql",
        "difficulty": "intermediate",
        "estimated_hours": 8,
        "provider": "PostgreSQL.org",
        "url": "https://www.postgresql.org/docs/current/tutorial.html",
        "description": "ACID properties, transactions, schema management, JSONB data types, and index types."
    },
    {
        "title": "Database Design & Normalization Guide",
        "type": "tutorial",
        "skill_id": "database-design",
        "difficulty": "intermediate",
        "estimated_hours": 5,
        "provider": "freeCodeCamp",
        "url": "https://www.freecodecamp.org/news/database-normalization-explained-with-examples/",
        "description": "Entity relationship modeling, primary vs foreign keys, cascading constraints, and 3NF."
    },
    {
        "title": "Redis University: RU101 Introduction to Redis Data Structures",
        "type": "course",
        "skill_id": "redis",
        "difficulty": "intermediate",
        "estimated_hours": 6,
        "provider": "Redis University",
        "url": "https://university.redis.com/",
        "description": "In-memory caching patterns, TTL expiry, pub/sub messaging, sorted sets, and rate limiting."
    },
    {
        "title": "Use The Index, Luke! A Guide to Database Performance",
        "type": "doc",
        "skill_id": "database-indexing",
        "difficulty": "advanced",
        "estimated_hours": 7,
        "provider": "Markus Winand",
        "url": "https://use-the-index-luke.com/",
        "description": "Deep architectural guide to B-tree index structures, clustering, and EXPLAIN query plans."
    },
    {
        "title": "Build a Multi-Tenant SaaS Schema with PostgreSQL & SQLAlchemy",
        "type": "project",
        "skill_id": "database-design",
        "difficulty": "advanced",
        "estimated_hours": 10,
        "provider": "roadmap.sh",
        "url": "https://roadmap.sh/postgresql-dba",
        "description": "Row-level security, tenant isolation, migration strategies, and backup recovery scripts."
    },
    {
        "title": "Remedial SQL: Basic Queries and Joins Walkthrough",
        "type": "tutorial",
        "skill_id": "sql",
        "difficulty": "beginner",
        "estimated_hours": 3,
        "provider": "W3Schools",
        "url": "https://www.w3schools.com/sql/",
        "description": "Introductory query syntax, filter conditions, sort orders, and inner/outer joins."
    },

    # Git & Version Control (4 items)
    {
        "title": "Pro Git Book (Official Free Book)",
        "type": "doc",
        "skill_id": "git",
        "difficulty": "beginner",
        "estimated_hours": 8,
        "provider": "Git-SCM",
        "url": "https://git-scm.com/book/en/v2",
        "description": "The complete reference on Git internals, branching, staging, rebasing, and remote remotes."
    },
    {
        "title": "Learn Git Branching (Visual Interactive Sandbox)",
        "type": "exercise",
        "skill_id": "git",
        "difficulty": "intermediate",
        "estimated_hours": 3,
        "provider": "LearnGitBranching",
        "url": "https://learngitbranching.js.org/",
        "description": "Visual sandbox challenging users to solve interactive Git tree puzzles."
    },
    {
        "title": "Git Merge vs Rebase and Cherry-Pick Best Practices",
        "type": "video",
        "skill_id": "git",
        "difficulty": "intermediate",
        "estimated_hours": 2,
        "provider": "Fireship",
        "url": "https://www.youtube.com/watch?v=1SXpE08vmzs",
        "description": "Fast-paced overview of interactive rebasing, merge conflicts, reflog recovery, and bisect."
    },
    {
        "title": "Open Source Contribution Workflow with Git & GitHub",
        "type": "project",
        "skill_id": "git",
        "difficulty": "intermediate",
        "estimated_hours": 4,
        "provider": "GitHub Skills",
        "url": "https://skills.github.com/",
        "description": "Forking, cloning, branch protection, pull request reviews, and issue linking."
    },

    # Docker, DevOps & Cloud (8 items)
    {
        "title": "Docker Curriculum for Beginners",
        "type": "tutorial",
        "skill_id": "docker",
        "difficulty": "beginner",
        "estimated_hours": 6,
        "provider": "Prakhar Srivastav",
        "url": "https://docker-curriculum.com/",
        "description": "Hands-on guide to containerization, Dockerfiles, port mapping, and docker-compose files."
    },
    {
        "title": "Docker Official Docs: Multi-stage Builds and Best Practices",
        "type": "doc",
        "skill_id": "docker",
        "difficulty": "intermediate",
        "estimated_hours": 4,
        "provider": "Docker.com",
        "url": "https://docs.docker.com/build/building/multi-stage/",
        "description": "Minimizing container attack surface, layer caching, and slim production images."
    },
    {
        "title": "The Missing Semester of Your CS Education: The Shell & CLI",
        "type": "course",
        "skill_id": "linux",
        "difficulty": "beginner",
        "estimated_hours": 8,
        "provider": "MIT CSAIL",
        "url": "https://missing.csail.mit.edu/",
        "description": "MIT's legendary course on command-line mastery, bash scripting, SSH, and automation."
    },
    {
        "title": "Kubernetes The Hard Way",
        "type": "tutorial",
        "skill_id": "kubernetes",
        "difficulty": "advanced",
        "estimated_hours": 15,
        "provider": "Kelsey Hightower (GitHub)",
        "url": "https://github.com/kelseyhightower/kubernetes-the-hard-way",
        "description": "Bootstrapping a production Kubernetes cluster from scratch without automated tools."
    },
    {
        "title": "GitHub Actions: Continuous Integration and Deployment",
        "type": "tutorial",
        "skill_id": "ci-cd",
        "difficulty": "intermediate",
        "estimated_hours": 5,
        "provider": "GitHub Docs",
        "url": "https://docs.github.com/en/actions",
        "description": "Automating test suites, Docker image publishing, secret management, and AWS deployment."
    },
    {
        "title": "AWS Cloud Practitioner Essentials",
        "type": "course",
        "skill_id": "aws",
        "difficulty": "beginner",
        "estimated_hours": 6,
        "provider": "AWS Skill Builder",
        "url": "https://aws.amazon.com/training/digital/aws-cloud-practitioner-essentials/",
        "description": "Core cloud concepts: VPC, IAM, S3, EC2, CloudWatch, and AWS well-architected framework."
    },
    {
        "title": "Terraform Up & Running: Infrastructure as Code",
        "type": "tutorial",
        "skill_id": "terraform",
        "difficulty": "intermediate",
        "estimated_hours": 8,
        "provider": "HashiCorp Learn",
        "url": "https://developer.hashicorp.com/terraform/tutorials",
        "description": "Writing declarative infrastructure code, remote backends, state locking, and reusable modules."
    },
    {
        "title": "Containerize a Microservices Application with Docker Compose",
        "type": "project",
        "skill_id": "docker",
        "difficulty": "intermediate",
        "estimated_hours": 6,
        "provider": "roadmap.sh",
        "url": "https://roadmap.sh/devops",
        "description": "Orchestrating frontend, backend, PostgreSQL database, and Redis cache with health checks."
    },

    # Data Science, Machine Learning & AI (10 items)
    {
        "title": "Python for Data Analysis by Wes McKinney",
        "type": "doc",
        "skill_id": "data-analysis-pandas",
        "difficulty": "beginner",
        "estimated_hours": 12,
        "provider": "O'Reilly / McKinney",
        "url": "https://wesmckinney.com/book/",
        "description": "Author of Pandas explains DataFrames, series, indexing, grouping, and time series."
    },
    {
        "title": "Kaggle Micro-Courses: Python, Pandas, and Intro to ML",
        "type": "exercise",
        "skill_id": "data-analysis-pandas",
        "difficulty": "beginner",
        "estimated_hours": 8,
        "provider": "Kaggle Learn",
        "url": "https://www.kaggle.com/learn",
        "description": "Bite-sized interactive Jupyter notebooks with automated grading on real datasets."
    },
    {
        "title": "Machine Learning Specialization by Andrew Ng",
        "type": "course",
        "skill_id": "machine-learning-scikit",
        "difficulty": "intermediate",
        "estimated_hours": 24,
        "provider": "DeepLearning.AI / Coursera",
        "url": "https://www.coursera.org/specializations/machine-learning-introduction",
        "description": "Linear regression, logistic regression, decision trees, boosting, and ML system design."
    },
    {
        "title": "PyTorch 60-Minute Blitz & Deep Learning Fundamentals",
        "type": "tutorial",
        "skill_id": "deep-learning-pytorch",
        "difficulty": "intermediate",
        "estimated_hours": 6,
        "provider": "PyTorch.org",
        "url": "https://pytorch.org/tutorials/beginner/deep_learning_60min_blitz.html",
        "description": "Tensors, autograd engine, convolutional neural nets, and loss function optimization."
    },
    {
        "title": "Hugging Face NLP Course: Transformers in Depth",
        "type": "course",
        "skill_id": "nlp",
        "difficulty": "intermediate",
        "estimated_hours": 14,
        "provider": "Hugging Face",
        "url": "https://huggingface.co/learn/nlp-course/",
        "description": "BERT, GPT, tokenizers, fine-tuning pretrained models, and pipeline abstractions."
    },
    {
        "title": "Building Systems with ChatGPT API & LLM Agents",
        "type": "course",
        "skill_id": "llm-applications",
        "difficulty": "intermediate",
        "estimated_hours": 5,
        "provider": "DeepLearning.AI",
        "url": "https://www.deeplearning.ai/short-courses/building-systems-with-chatgpt/",
        "description": "Prompt chaining, tool use, JSON output schemas, evaluation, and guardrails."
    },
    {
        "title": "End-to-End Customer Churn Prediction ML Pipeline",
        "type": "project",
        "skill_id": "machine-learning-scikit",
        "difficulty": "intermediate",
        "estimated_hours": 10,
        "provider": "Kaggle",
        "url": "https://www.kaggle.com/competitions",
        "description": "Data cleaning, feature engineering, cross-validation, model training, and ROC-AUC evaluation."
    },
    {
        "title": "Applied Statistics for Data Science",
        "type": "course",
        "skill_id": "statistics-probability",
        "difficulty": "beginner",
        "estimated_hours": 10,
        "provider": "Khan Academy",
        "url": "https://www.khanacademy.org/math/statistics-probability",
        "description": "Probability distributions, central limit theorem, confidence intervals, and hypothesis tests."
    },
    {
        "title": "MLOps Specialization: Machine Learning Engineering for Production",
        "type": "course",
        "skill_id": "mlops",
        "difficulty": "advanced",
        "estimated_hours": 16,
        "provider": "DeepLearning.AI",
        "url": "https://www.deeplearning.ai/courses/machine-learning-engineering-for-production-mlops/",
        "description": "Data pipelines, model monitoring, concept drift, feature stores, and CI/CD for ML models."
    },
    {
        "title": "Vector Embeddings & Retrieval Augmented Generation (RAG) Architecture",
        "type": "tutorial",
        "skill_id": "vector-databases",
        "difficulty": "intermediate",
        "estimated_hours": 6,
        "provider": "Pinecone Learning Center",
        "url": "https://www.pinecone.io/learn/",
        "description": "Semantic search, chunking heuristics, dense retrieval, and hybrid keyword reranking."
    },

    # Cybersecurity (6 items)
    {
        "title": "OWASP Top 10 Web Application Security Vulnerabilities",
        "type": "doc",
        "skill_id": "web-security-owasp",
        "difficulty": "beginner",
        "estimated_hours": 6,
        "provider": "OWASP Foundation",
        "url": "https://owasp.org/www-project-top-ten/",
        "description": "Injection flaws, broken access control, cryptographic failures, and security misconfigurations."
    },
    {
        "title": "PortSwigger Web Security Academy",
        "type": "exercise",
        "skill_id": "web-security-owasp",
        "difficulty": "intermediate",
        "estimated_hours": 20,
        "provider": "PortSwigger",
        "url": "https://portswigger.net/web-security",
        "description": "Interactive vulnerable web labs exploiting real XSS, SQLi, CSRF, and SSRF flaws."
    },
    {
        "title": "Practical Ethical Hacking & Penetration Testing Basics",
        "type": "course",
        "skill_id": "penetration-testing",
        "difficulty": "intermediate",
        "estimated_hours": 15,
        "provider": "TCM Security / YouTube",
        "url": "https://www.youtube.com/watch?v=3Kq1MIfTWCE",
        "description": "Network scanning, Nmap, Wireshark, Metasploit, exploit hunting, and privilege escalation."
    },
    {
        "title": "Applied Cryptography Fundamentals",
        "type": "tutorial",
        "skill_id": "cryptography-basics",
        "difficulty": "intermediate",
        "estimated_hours": 6,
        "provider": "CryptoHack",
        "url": "https://cryptohack.org/",
        "description": "Interactive CTF challenges solving RSA, AES, elliptic curve cryptography, and XOR puzzles."
    },
    {
        "title": "Wireshark Network Packet Analysis Masterclass",
        "type": "tutorial",
        "skill_id": "network-security",
        "difficulty": "intermediate",
        "estimated_hours": 5,
        "provider": "Wireshark Foundation",
        "url": "https://www.wireshark.org/docs/",
        "description": "Deep inspection of TCP handshakes, DNS anomalies, ARP poisoning, and TLS encryption."
    },
    {
        "title": "Conduct a Security Vulnerability Assessment on a Node/Python API",
        "type": "project",
        "skill_id": "secure-code-review",
        "difficulty": "intermediate",
        "estimated_hours": 8,
        "provider": "roadmap.sh",
        "url": "https://roadmap.sh/cyber-security",
        "description": "Run SAST scanners, verify CSP headers, patch vulnerable npm dependencies, and remediate flaws."
    },

    # UI/UX & Design (6 items)
    {
        "title": "Figma for Beginners: UI Design Masterclass",
        "type": "video",
        "skill_id": "figma",
        "difficulty": "beginner",
        "estimated_hours": 4,
        "provider": "Figma YouTube Channel",
        "url": "https://www.youtube.com/c/Figmadesign",
        "description": "Frames, auto layout, constraints, reusable components, variants, and interactive prototyping."
    },
    {
        "title": "Refactoring UI by Adam Wathan & Steve Schoger",
        "type": "doc",
        "skill_id": "visual-hierarchy",
        "difficulty": "beginner",
        "estimated_hours": 6,
        "provider": "Refactoring UI",
        "url": "https://www.refactoringui.com/",
        "description": "Tactical visual design tips: spacing hierarchies, contrast, typography scales, and visual balance."
    },
    {
        "title": "Nielsen Norman Group UX Research Articles & Heuristics",
        "type": "tutorial",
        "skill_id": "user-research",
        "difficulty": "intermediate",
        "estimated_hours": 8,
        "provider": "Nielsen Norman Group",
        "url": "https://www.nngroup.com/articles/",
        "description": "10 usability heuristics, usability test protocols, user journey maps, and cognitive psychology."
    },
    {
        "title": "Design Systems 101: Tokens, Guidelines, and Governance",
        "type": "doc",
        "skill_id": "design-systems",
        "difficulty": "intermediate",
        "estimated_hours": 6,
        "provider": "Design Systems Repo",
        "url": "https://designsystemsrepo.com/",
        "description": "Case studies from Shopify Polaris, GitHub Primer, and Google Material Design 3."
    },
    {
        "title": "Design a Complete Mobile Banking App in Figma",
        "type": "project",
        "skill_id": "prototyping",
        "difficulty": "intermediate",
        "estimated_hours": 12,
        "provider": "Coursera / CalArts UX",
        "url": "https://www.coursera.org/specializations/ui-ux-design",
        "description": "From user personas to wireframes, interactive high-fidelity prototype, and design system."
    },
    {
        "title": "Inclusive Components & Accessible Web UI",
        "type": "tutorial",
        "skill_id": "design-accessibility",
        "difficulty": "intermediate",
        "estimated_hours": 5,
        "provider": "Inclusive Components",
        "url": "https://inclusive-components.design/",
        "description": "Building toggles, modals, tabs, and menus that work for assistive technologies."
    },

    # Additional Core Technologies & Systems (10 items)
    {
        "title": "Microservices Patterns and Anti-Patterns",
        "type": "tutorial",
        "skill_id": "microservices",
        "difficulty": "advanced",
        "estimated_hours": 7,
        "provider": "Martin Fowler",
        "url": "https://martinfowler.com/articles/microservices.html",
        "description": "Service boundaries, database per service, saga pattern for distributed transactions."
    },
    {
        "title": "System Design Primer: Scalable Web Architectures",
        "type": "doc",
        "skill_id": "system-architecture",
        "difficulty": "advanced",
        "estimated_hours": 16,
        "provider": "Donne Martin (GitHub)",
        "url": "https://github.com/donnemartin/system-design-primer",
        "description": "Load balancers, CDN caching, asynchronous workers, CAP theorem, and sharding."
    },
    {
        "title": "Testing JavaScript Applications: Unit, Integration & E2E",
        "type": "tutorial",
        "skill_id": "frontend-testing",
        "difficulty": "intermediate",
        "estimated_hours": 6,
        "provider": "Kent C. Dodds",
        "url": "https://kentcdodds.com/blog/write-tests",
        "description": "The testing pyramid, React Testing Library philosophy, avoiding implementation details."
    },
    {
        "title": "Pytest Official Guide: Fixtures and Parametrization",
        "type": "doc",
        "skill_id": "backend-testing",
        "difficulty": "intermediate",
        "estimated_hours": 5,
        "provider": "Pytest Docs",
        "url": "https://docs.pytest.org/en/stable/",
        "description": "Fixtures, conftest.py, monkeypatching, mock databases, and test coverage reports."
    },
    {
        "title": "Web Performance Optimization: Critical Rendering Path",
        "type": "doc",
        "skill_id": "web-performance",
        "difficulty": "intermediate",
        "estimated_hours": 5,
        "provider": "web.dev by Google",
        "url": "https://web.dev/fast/",
        "description": "Minimizing render-blocking resources, Core Web Vitals optimization, and resource hints."
    },
    {
        "title": "Prometheus & Grafana: Full Observability Stack",
        "type": "tutorial",
        "skill_id": "monitoring-prometheus",
        "difficulty": "intermediate",
        "estimated_hours": 6,
        "provider": "Prometheus.io",
        "url": "https://prometheus.io/docs/introduction/overview/",
        "description": "Time-series monitoring, PromQL, Grafana alerts, and RED method metric tracking."
    },
    {
        "title": "Computer Networking: A Top-Down Approach Summary",
        "type": "tutorial",
        "skill_id": "networking-basics",
        "difficulty": "beginner",
        "estimated_hours": 6,
        "provider": "Stanford CS144",
        "url": "https://cs144.github.io/",
        "description": "IP addressing, routing algorithms, TCP congestion control, and DNS packet flow."
    },
    {
        "title": "Data Structures & Algorithms in Python / JavaScript",
        "type": "course",
        "skill_id": "algorithms-data-structures",
        "difficulty": "intermediate",
        "estimated_hours": 18,
        "provider": "NeetCode",
        "url": "https://neetcode.io/roadmap",
        "description": "Arrays, two pointers, sliding window, trees, dynamic programming, and graphs."
    },
    {
        "title": "React Native Express: Quick Start to Native Apps",
        "type": "tutorial",
        "skill_id": "react-native",
        "difficulty": "intermediate",
        "estimated_hours": 7,
        "provider": "React Native Express",
        "url": "https://www.reactnativeexpress.com/",
        "description": "Core mobile components, navigation, AsyncStorage, and native device APIs."
    },
    {
        "title": "Flutter in Action: Building Beautiful Cross-Platform Apps",
        "type": "course",
        "skill_id": "flutter",
        "difficulty": "intermediate",
        "estimated_hours": 10,
        "provider": "Flutter.dev",
        "url": "https://docs.flutter.dev/get-started/codelab",
        "description": "Dart syntax, stateless and stateful widgets, reactive layouts, and hot reload."
    }
]
