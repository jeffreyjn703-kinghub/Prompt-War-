# 80+ Skill taxonomy with categories and prerequisite graph edges
SKILL_TAXONOMY_SEED = [
    # Frontend (15 skills)
    {
        "skill_id": "html",
        "name": "HTML5",
        "category": "Frontend",
        "description": "Semantic markup, modern document structure, accessibility (a11y), and web forms.",
        "prerequisites": []
    },
    {
        "skill_id": "css",
        "name": "CSS3 & Modern Layouts",
        "category": "Frontend",
        "description": "Flexbox, CSS Grid, media queries, animations, and responsive web design.",
        "prerequisites": ["html"]
    },
    {
        "skill_id": "javascript",
        "name": "JavaScript (ES6+)",
        "category": "Frontend",
        "description": "Core language, closures, promises, async/await, DOM manipulation, event loop.",
        "prerequisites": ["html", "css"]
    },
    {
        "skill_id": "typescript",
        "name": "TypeScript",
        "category": "Frontend",
        "description": "Static typing, interfaces, generics, utility types, and modern compiler options.",
        "prerequisites": ["javascript"]
    },
    {
        "skill_id": "react",
        "name": "React",
        "category": "Frontend",
        "description": "Component lifecycle, hooks, state management, synthetic events, and JSX.",
        "prerequisites": ["javascript"]
    },
    {
        "skill_id": "nextjs",
        "name": "Next.js",
        "category": "Frontend",
        "description": "Server-side rendering (SSR), static site generation (SSG), app router, API routes.",
        "prerequisites": ["react"]
    },
    {
        "skill_id": "vue",
        "name": "Vue.js",
        "category": "Frontend",
        "description": "Reactivity system, Composition API, Pinia state, and Vue Router.",
        "prerequisites": ["javascript"]
    },
    {
        "skill_id": "tailwind",
        "name": "Tailwind CSS",
        "category": "Frontend",
        "description": "Utility-first CSS, responsive modifiers, themes, and design tokens.",
        "prerequisites": ["css"]
    },
    {
        "skill_id": "redux",
        "name": "Redux Toolkit & State Management",
        "category": "Frontend",
        "description": "Global state, reducers, slices, async thunks, and predictable state containers.",
        "prerequisites": ["react"]
    },
    {
        "skill_id": "web-performance",
        "name": "Web Performance & Core Web Vitals",
        "category": "Frontend",
        "description": "LCP, FID, CLS, lazy loading, asset bundling, and browser rendering lifecycle.",
        "prerequisites": ["javascript", "css"]
    },
    {
        "skill_id": "frontend-testing",
        "name": "Frontend Testing (Jest/Vitest & RTL)",
        "category": "Frontend",
        "description": "Unit testing components, mocking API requests, end-to-end testing with Playwright.",
        "prerequisites": ["react"]
    },
    {
        "skill_id": "web-accessibility",
        "name": "Web Accessibility (WCAG & ARIA)",
        "category": "Frontend",
        "description": "Screen reader support, keyboard navigation, color contrast, and ARIA roles.",
        "prerequisites": ["html"]
    },
    {
        "skill_id": "pwa",
        "name": "Progressive Web Apps (PWA)",
        "category": "Frontend",
        "description": "Service workers, offline caching strategies, web manifests, background sync.",
        "prerequisites": ["javascript"]
    },
    {
        "skill_id": "sass",
        "name": "Sass / SCSS",
        "category": "Frontend",
        "description": "CSS preprocessor, mixins, variables, nesting, and modular styles.",
        "prerequisites": ["css"]
    },
    {
        "skill_id": "graphql-client",
        "name": "GraphQL Client (Apollo/URQL)",
        "category": "Frontend",
        "description": "Queries, mutations, subscriptions, normalized caching, and optimistic UI.",
        "prerequisites": ["javascript"]
    },

    # Backend (14 skills)
    {
        "skill_id": "nodejs",
        "name": "Node.js",
        "category": "Backend",
        "description": "Event-driven runtime, non-blocking I/O, streams, buffers, and npm ecosystem.",
        "prerequisites": ["javascript"]
    },
    {
        "skill_id": "express",
        "name": "Express.js",
        "category": "Backend",
        "description": "Middleware architecture, routing, error handling, and server-side request pipelines.",
        "prerequisites": ["nodejs"]
    },
    {
        "skill_id": "rest-api",
        "name": "RESTful API Design",
        "category": "Backend",
        "description": "HTTP status codes, idempotent methods, resource modeling, and OpenAPI specs.",
        "prerequisites": ["nodejs"]
    },
    {
        "skill_id": "python",
        "name": "Python Programming",
        "category": "Backend",
        "description": "Data structures, OOP, decorators, generators, type hints, and packaging.",
        "prerequisites": []
    },
    {
        "skill_id": "fastapi",
        "name": "FastAPI",
        "category": "Backend",
        "description": "Modern ASGI framework, automatic docs, Pydantic validation, async endpoints.",
        "prerequisites": ["python"]
    },
    {
        "skill_id": "django",
        "name": "Django",
        "category": "Backend",
        "description": "Batteries-included web framework, ORM, migrations, admin panel, auth.",
        "prerequisites": ["python"]
    },
    {
        "skill_id": "golang",
        "name": "Go (Golang)",
        "category": "Backend",
        "description": "Goroutines, channels, interfaces, memory safety, and high-performance microservices.",
        "prerequisites": []
    },
    {
        "skill_id": "java-spring",
        "name": "Java & Spring Boot",
        "category": "Backend",
        "description": "Dependency injection, Spring Data, Spring Security, enterprise microservices.",
        "prerequisites": []
    },
    {
        "skill_id": "microservices",
        "name": "Microservices Architecture",
        "category": "Backend",
        "description": "Service discovery, API gateways, circuit breakers, distributed tracing, CQRS.",
        "prerequisites": ["rest-api"]
    },
    {
        "skill_id": "grpc",
        "name": "gRPC & Protocol Buffers",
        "category": "Backend",
        "description": "RPC communication, binary serialization, streaming RPCs, multiplexing.",
        "prerequisites": ["rest-api"]
    },
    {
        "skill_id": "auth-jwt",
        "name": "Authentication & JWT",
        "category": "Backend",
        "description": "OAuth 2.0, OpenID Connect, session tokens, JWT signing, RBAC authorization.",
        "prerequisites": ["rest-api"]
    },
    {
        "skill_id": "backend-testing",
        "name": "Backend Testing & CI",
        "category": "Backend",
        "description": "Pytest/Jest integration testing, fixture management, mock services, test coverage.",
        "prerequisites": ["rest-api"]
    },
    {
        "skill_id": "websockets",
        "name": "WebSockets & Real-time Systems",
        "category": "Backend",
        "description": "Bi-directional persistent connections, socket pooling, pub/sub broadcasting.",
        "prerequisites": ["nodejs"]
    },
    {
        "skill_id": "graphql-server",
        "name": "GraphQL API Server",
        "category": "Backend",
        "description": "Schema definition, resolvers, DataLoader, query complexity limiting.",
        "prerequisites": ["rest-api"]
    },

    # Database & Storage (10 skills)
    {
        "skill_id": "sql",
        "name": "SQL & Relational Databases",
        "category": "Database",
        "description": "DML, DDL, complex joins, subqueries, group by, aggregation, transactions.",
        "prerequisites": []
    },
    {
        "skill_id": "postgresql",
        "name": "PostgreSQL",
        "category": "Database",
        "description": "Advanced indexing (B-Tree, GIN, GiST), JSONB, window functions, CTEs.",
        "prerequisites": ["sql"]
    },
    {
        "skill_id": "database-design",
        "name": "Database Design & Normalization",
        "category": "Database",
        "description": "1NF to 3NF, ER diagrams, foreign key integrity, schema migrations.",
        "prerequisites": ["sql"]
    },
    {
        "skill_id": "mongodb",
        "name": "MongoDB & NoSQL",
        "category": "Database",
        "description": "Document storage, aggregation pipeline, replica sets, sharding concepts.",
        "prerequisites": []
    },
    {
        "skill_id": "redis",
        "name": "Redis & In-Memory Caching",
        "category": "Database",
        "description": "Data structures (hashes, sorted sets, streams), cache invalidation, rate limiting.",
        "prerequisites": []
    },
    {
        "skill_id": "database-indexing",
        "name": "Query Optimization & Indexing",
        "category": "Database",
        "description": "EXPLAIN ANALYZE, query plans, index bloat, partition pruning, connection pooling.",
        "prerequisites": ["postgresql"]
    },
    {
        "skill_id": "orm-sqlalchemy-prisma",
        "name": "ORMs (SQLAlchemy & Prisma)",
        "category": "Database",
        "description": "Declarative mapping, N+1 query prevention, eager loading, migrations.",
        "prerequisites": ["sql"]
    },
    {
        "skill_id": "elasticsearch",
        "name": "Elasticsearch & Vector Search",
        "category": "Database",
        "description": "Inverted index, BM25 text search, embedding retrieval, KNN clustering.",
        "prerequisites": []
    },
    {
        "skill_id": "data-warehousing",
        "name": "Data Warehousing (Snowflake / BigQuery)",
        "category": "Database",
        "description": "Columnar storage, partition pruning, star schemas, OLAP workloads.",
        "prerequisites": ["sql"]
    },
    {
        "skill_id": "kafka",
        "name": "Apache Kafka & Event Streaming",
        "category": "Database",
        "description": "Partitions, consumer groups, offset management, exactly-once semantics.",
        "prerequisites": []
    },

    # Cloud, DevOps & System (12 skills)
    {
        "skill_id": "git",
        "name": "Git & Version Control",
        "category": "Cloud & DevOps",
        "description": "Branching strategies, rebase, cherry-pick, conflict resolution, PR workflows.",
        "prerequisites": []
    },
    {
        "skill_id": "linux",
        "name": "Linux & Bash Scripting",
        "category": "Cloud & DevOps",
        "description": "Process management, file permissions, shell pipelines, systemd services.",
        "prerequisites": []
    },
    {
        "skill_id": "docker",
        "name": "Docker & Containerization",
        "category": "Cloud & DevOps",
        "description": "Dockerfile best practices, multi-stage builds, docker-compose, image optimization.",
        "prerequisites": ["linux"]
    },
    {
        "skill_id": "kubernetes",
        "name": "Kubernetes (K8s)",
        "category": "Cloud & DevOps",
        "description": "Pods, Deployments, Services, Ingress, ConfigMaps, Helm charts, autoscaling.",
        "prerequisites": ["docker"]
    },
    {
        "skill_id": "aws",
        "name": "AWS Cloud Foundations",
        "category": "Cloud & DevOps",
        "description": "EC2, S3, RDS, Lambda, IAM policies, VPC networking, CloudWatch.",
        "prerequisites": ["linux"]
    },
    {
        "skill_id": "ci-cd",
        "name": "CI/CD Pipelines (GitHub Actions)",
        "category": "Cloud & DevOps",
        "description": "Automated linting, test suites, container builds, release artifacts, deployment gates.",
        "prerequisites": ["git", "docker"]
    },
    {
        "skill_id": "terraform",
        "name": "Terraform & Infrastructure as Code",
        "category": "Cloud & DevOps",
        "description": "HCL syntax, state files, providers, modules, plan/apply cycle.",
        "prerequisites": ["aws"]
    },
    {
        "skill_id": "monitoring-prometheus",
        "name": "Monitoring & Observability (Prometheus & Grafana)",
        "category": "Cloud & DevOps",
        "description": "Metrics scraping, PromQL queries, alerting rules, dashboard visualization.",
        "prerequisites": ["linux"]
    },
    {
        "skill_id": "nginx",
        "name": "Nginx & Reverse Proxies",
        "category": "Cloud & DevOps",
        "description": "Load balancing, SSL/TLS termination, reverse proxy config, caching headers.",
        "prerequisites": ["linux"]
    },
    {
        "skill_id": "serverless",
        "name": "Serverless Architecture",
        "category": "Cloud & DevOps",
        "description": "Event-driven functions, cold starts, API Gateway integration, state orchestration.",
        "prerequisites": ["aws"]
    },
    {
        "skill_id": "system-architecture",
        "name": "System Architecture & Scalability",
        "category": "Cloud & DevOps",
        "description": "High availability, load balancers, caching strategies, horizontal vs vertical scaling.",
        "prerequisites": ["microservices"]
    },
    {
        "skill_id": "networking-basics",
        "name": "Computer Networking (TCP/IP & DNS)",
        "category": "Cloud & DevOps",
        "description": "OSI model, TCP vs UDP, DNS resolution, TLS handshake, subnetting.",
        "prerequisites": []
    },

    # Data Science & AI (14 skills)
    {
        "skill_id": "data-analysis-pandas",
        "name": "Data Analysis (Pandas & NumPy)",
        "category": "Data & AI",
        "description": "Data wrangling, vectorization, indexing, missing values, group-by transformations.",
        "prerequisites": ["python"]
    },
    {
        "skill_id": "data-visualization",
        "name": "Data Visualization (Matplotlib & Seaborn)",
        "category": "Data & AI",
        "description": "Exploratory data analysis charts, distributions, correlations, publication plots.",
        "prerequisites": ["data-analysis-pandas"]
    },
    {
        "skill_id": "machine-learning-scikit",
        "name": "Machine Learning (Scikit-Learn)",
        "category": "Data & AI",
        "description": "Regression, classification, decision trees, random forests, hyperparameter tuning.",
        "prerequisites": ["data-analysis-pandas"]
    },
    {
        "skill_id": "deep-learning-pytorch",
        "name": "Deep Learning (PyTorch)",
        "category": "Data & AI",
        "description": "Tensors, autograd, neural network modules, optimizers, backpropagation.",
        "prerequisites": ["machine-learning-scikit"]
    },
    {
        "skill_id": "nlp",
        "name": "Natural Language Processing (NLP)",
        "category": "Data & AI",
        "description": "Tokenization, TF-IDF, word embeddings, transformer architectures, attention mechanism.",
        "prerequisites": ["deep-learning-pytorch"]
    },
    {
        "skill_id": "llm-applications",
        "name": "LLM Application Engineering & Prompting",
        "category": "Data & AI",
        "description": "Prompt design, structured outputs, function calling, RAG architectures, evaluation.",
        "prerequisites": ["python"]
    },
    {
        "skill_id": "vector-databases",
        "name": "Vector Databases & Embeddings (Pinecone/Chroma)",
        "category": "Data & AI",
        "description": "Cosine similarity, HNSW indexing, chunking strategies, hybrid search.",
        "prerequisites": ["python"]
    },
    {
        "skill_id": "computer-vision",
        "name": "Computer Vision (OpenCV & CNNs)",
        "category": "Data & AI",
        "description": "Convolutional filters, image segmentation, object detection (YOLO), transfer learning.",
        "prerequisites": ["deep-learning-pytorch"]
    },
    {
        "skill_id": "feature-engineering",
        "name": "Feature Engineering & Preprocessing",
        "category": "Data & AI",
        "description": "One-hot encoding, feature scaling, dimensionality reduction (PCA), outlier handling.",
        "prerequisites": ["data-analysis-pandas"]
    },
    {
        "skill_id": "statistics-probability",
        "name": "Applied Statistics & Probability",
        "category": "Data & AI",
        "description": "Hypothesis testing, p-values, Bayes' theorem, normal distributions, A/B testing.",
        "prerequisites": []
    },
    {
        "skill_id": "mlops",
        "name": "MLOps & Model Deployment (MLflow/Docker)",
        "category": "Data & AI",
        "description": "Experiment tracking, model registry, inference servers, model drift monitoring.",
        "prerequisites": ["machine-learning-scikit", "docker"]
    },
    {
        "skill_id": "etl-pipelines",
        "name": "ETL & Data Pipelines (Airflow)",
        "category": "Data & AI",
        "description": "DAG orchestration, data extraction, transformation workflows, backfilling.",
        "prerequisites": ["python", "sql"]
    },
    {
        "skill_id": "spark",
        "name": "Big Data (Apache Spark & PySpark)",
        "category": "Data & AI",
        "description": "Distributed computing, RDDs, DataFrames, cluster resource management.",
        "prerequisites": ["data-analysis-pandas"]
    },
    {
        "skill_id": "langchain-llamaindex",
        "name": "AI Agent Frameworks (LangChain/LlamaIndex)",
        "category": "Data & AI",
        "description": "Agent loops, tool bindings, memory management, multi-agent coordination.",
        "prerequisites": ["llm-applications"]
    },

    # Cybersecurity (8 skills)
    {
        "skill_id": "web-security-owasp",
        "name": "Web Security & OWASP Top 10",
        "category": "Security",
        "description": "XSS, SQL injection, CSRF, broken access control, security headers (CSP, CORS).",
        "prerequisites": ["html", "rest-api"]
    },
    {
        "skill_id": "cryptography-basics",
        "name": "Applied Cryptography",
        "category": "Security",
        "description": "Symmetric vs asymmetric encryption, RSA, AES, hashing (SHA-256), digital signatures.",
        "prerequisites": []
    },
    {
        "skill_id": "network-security",
        "name": "Network Security & Firewalls",
        "category": "Security",
        "description": "Packet inspection (Wireshark), port scanning (Nmap), VPNs, intrusion detection.",
        "prerequisites": ["networking-basics"]
    },
    {
        "skill_id": "penetration-testing",
        "name": "Penetration Testing & Ethical Hacking",
        "category": "Security",
        "description": "Vulnerability scanning, exploitation frameworks (Metasploit), privilege escalation.",
        "prerequisites": ["web-security-owasp", "network-security"]
    },
    {
        "skill_id": "iam-security",
        "name": "Identity & Access Management (IAM)",
        "category": "Security",
        "description": "Principle of least privilege, MFA, role-based access control, directory services.",
        "prerequisites": ["auth-jwt"]
    },
    {
        "skill_id": "incident-response",
        "name": "Incident Response & Forensics",
        "category": "Security",
        "description": "SIEM log analysis, threat hunting, containment strategies, post-mortem reports.",
        "prerequisites": ["linux"]
    },
    {
        "skill_id": "secure-code-review",
        "name": "Secure Code Review & SAST/DAST",
        "category": "Security",
        "description": "Static analysis tools (SonarQube), taint analysis, dependency vulnerability scans.",
        "prerequisites": ["web-security-owasp"]
    },
    {
        "skill_id": "cloud-security",
        "name": "Cloud Security Posture",
        "category": "Security",
        "description": "AWS security groups, KMS key management, container security scanning (Trivy).",
        "prerequisites": ["aws", "docker"]
    },

    # UI/UX & Design (8 skills)
    {
        "skill_id": "figma",
        "name": "Figma & UI Design",
        "category": "UI/UX & Design",
        "description": "Auto-layout, components, variants, design systems, interactive prototypes.",
        "prerequisites": []
    },
    {
        "skill_id": "user-research",
        "name": "User Research & Usability Testing",
        "category": "UI/UX & Design",
        "description": "User interviews, persona creation, card sorting, heuristic evaluation.",
        "prerequisites": []
    },
    {
        "skill_id": "wireframing",
        "name": "Wireframing & Information Architecture",
        "category": "UI/UX & Design",
        "description": "Low-fidelity wireframes, user flow diagrams, site maps, sitemap hierarchy.",
        "prerequisites": []
    },
    {
        "skill_id": "design-systems",
        "name": "Design Systems & Tokenization",
        "category": "UI/UX & Design",
        "description": "Color ramps, typography scale, spacing grids, component consistency.",
        "prerequisites": ["figma"]
    },
    {
        "skill_id": "interaction-design",
        "name": "Interaction Design & Micro-animations",
        "category": "UI/UX & Design",
        "description": "Easing curves, state transitions, cognitive load reduction, micro-interactions.",
        "prerequisites": ["figma"]
    },
    {
        "skill_id": "visual-hierarchy",
        "name": "Visual Hierarchy & Typography",
        "category": "UI/UX & Design",
        "description": "Gestalt principles, typographic contrast, rhythm, white space utilization.",
        "prerequisites": []
    },
    {
        "skill_id": "prototyping",
        "name": "Interactive Prototyping",
        "category": "UI/UX & Design",
        "description": "Smart animate, condition-based interactions, stakeholder walkthroughs.",
        "prerequisites": ["figma"]
    },
    {
        "skill_id": "design-accessibility",
        "name": "Accessible UI/UX Design",
        "category": "UI/UX & Design",
        "description": "Color blindness simulation, touch target sizing, accessible focus states.",
        "prerequisites": ["visual-hierarchy"]
    },

    # Mobile (4 skills)
    {
        "skill_id": "react-native",
        "name": "React Native",
        "category": "Mobile",
        "description": "Cross-platform mobile apps, native components, Expo, gestures, offline storage.",
        "prerequisites": ["react"]
    },
    {
        "skill_id": "flutter",
        "name": "Flutter & Dart",
        "category": "Mobile",
        "description": "Widget tree, state management (Bloc/Provider), Material and Cupertino widgets.",
        "prerequisites": []
    },
    {
        "skill_id": "ios-swift",
        "name": "iOS Development (Swift & SwiftUI)",
        "category": "Mobile",
        "description": "Swift syntax, declarative SwiftUI layouts, Combine, Core Data, App Store distribution.",
        "prerequisites": []
    },
    {
        "skill_id": "android-kotlin",
        "name": "Android Development (Kotlin & Jetpack)",
        "category": "Mobile",
        "description": "Kotlin coroutines, Jetpack Compose, ViewModel, Room database, Gradle builds.",
        "prerequisites": []
    },

    # Soft Skills & Engineering Practices (4 skills)
    {
        "skill_id": "agile-scrum",
        "name": "Agile & Scrum Practices",
        "category": "Engineering Practices",
        "description": "Sprint planning, user stories, retrospectives, velocity estimation, backlog grooming.",
        "prerequisites": []
    },
    {
        "skill_id": "system-debugging",
        "name": "System Debugging & Troubleshooting",
        "category": "Engineering Practices",
        "description": "Root cause analysis, reproduction steps, Chrome DevTools profiling, log correlation.",
        "prerequisites": []
    },
    {
        "skill_id": "code-review",
        "name": "Code Review & Technical Communication",
        "category": "Engineering Practices",
        "description": "Constructive code reviews, architectural decision records (ADRs), technical documentation.",
        "prerequisites": ["git"]
    },
    {
        "skill_id": "algorithms-data-structures",
        "name": "Data Structures & Algorithms",
        "category": "Engineering Practices",
        "description": "Big-O complexity, binary search trees, graph traversals (BFS/DFS), dynamic programming.",
        "prerequisites": []
    }
]
