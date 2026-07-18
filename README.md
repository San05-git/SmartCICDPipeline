# Automated Bug Testing & Deployment System

> **Enterprise-Grade CI/CD Pipeline**  
> Showcasing automated testing, containerization, security linting, and zero-downtime deployment practices.

## Project Overview

This project demonstrates a fully automated **CI/CD pipeline** that:

1. **Detects bugs automatically** — Unit tests run on every commit; if a test fails, the pipeline aborts immediately.
2. **Enforces code quality & security** — A lint + security scan stage simulates enterprise tools like SonarQube and ESLint.
3. **Builds container artifacts** — A lightweight Docker image is created using a `node:24-alpine` base.
4. **Validates deployments** — The pipeline runs the container locally and verifies the `/health` endpoint responds correctly.
5. **Stores successful validations** — Passing user payloads are saved in a small SQLite database so the app demonstrates simple persistence.

The result: **bad code never reaches production**, and deployments are consistent, repeatable, and auditable.

## Architecture Diagram

```mermaid
flowchart LR
    A[Developer Pushes Code] --> B[GitHub Webhook]
    B --> C[Jenkins Pipeline Triggered]
    C --> D[Stage 1: Checkout]
    D --> E[Stage 2: Lint & Security Scan]
    E --> F{Stage 3: Automated Bug Testing}
    F -->|Tests Pass| G[Stage 4: Container Artifact Build]
    F -->|Tests Fail| H[Pipeline Aborted]
    G --> I[Stage 5: Mock Deployment & Health Check]
    I --> J[Deployment Verified]

### ASCII Fallback Diagram

+-----------+     +-----------+     +------------------+
| Developer | --> |  GitHub   | --> | Jenkins Pipeline |
+-----------+     +-----------+     +------------------+
                                          |
                                    +-----v------+
                                    | 1. Checkout |
                                    +-----+------+
                                          |
                                    +-----v------+
                                    | 2. Lint &  |
                                    |   Security |
                                    +-----+------+
                                          |
                                    +-----v------+
                                    | 3. Bug     |
                                    |   Testing  |
                                    +-----+------+
                                          |
                              +-----------+-----------+
                              |                       |
                         Tests Pass              Tests Fail
                              |                       |
                    +---------v---------+     +------v------+
                    | 4. Docker Build   |     |  Pipeline   |
                    +---------+---------+     |   ABORTED   |
                              |               +-------------+
                    +---------v---------+
                    | 5. Mock Deploy   |
                    |   & Health Check |
                    +---------+---------+
                              |
                    +---------v---------+
                    |  DEPLOYED       |
                    +-------------------+

## How to Run

### Prerequisites

- [Node.js](https://nodejs.org/) v24+ and npm
- [Docker](https://www.docker.com/) (for container build)
- [Git](https://git-scm.com/)

### 1. Install Dependencies

```bash
npm install
```

### 2. Run the Application Locally

```bash
node server.js
```

The server starts on `http://localhost:3000`.
The root URL `/` returns a small JSON status message, while `/health` is the main health-check endpoint used by tests and the pipeline.
Successful `POST /api/validate-user` requests are stored in `data/validations.db` by default, and `GET /api/validations` returns the saved records.

### 3. Test the Endpoints

```bash
# Health check
curl http://localhost:3000/health

# Business logic — validate a user payload
curl -X POST http://localhost:3000/api/validate-user \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","age":30}'
```

### 4. Run Unit Tests

```bash
npm test
```

A failing test example is included to demonstrate how the pipeline catches bugs.

### 5. Build & Run Docker Container

```bash
docker build -t smart-cicd-pipeline .
docker run -p 3000:3000 smart-cicd-pipeline

### 6. Simulate the Full Pipeline (Jenkins)

If you have a Jenkins instance, point it to this repository and use the provided `Jenkinsfile`.  
The pipeline will execute all 5 stages automatically.


## Enterprise Impact

| Concern | How This Project Addresses It |
|---|---|
| **Manual deployment errors** | Every deployment follows the same automated pipeline — no human typos, no forgotten steps. |
| **Bugs reaching production** | Automated tests run on every commit. If a test fails, the pipeline aborts before any artifact is built. |
| **Security vulnerabilities** | The lint & security scan stage simulates tools like SonarQube and ESLint, catching issues early. |
| **Inconsistent environments** | Docker containers guarantee the same runtime environment in dev, CI, and production. |
| **Slow release cycles** | Full pipeline runs in under 2 minutes, enabling rapid, safe iterations. |
| **Audit trail** | Every pipeline run is logged in Jenkins with timestamps, test results, and artifact IDs. |


## File Structure

SmartCICDPipeline/
├── .github/
│   └── workflows/
│       └── ci-trigger.yml      # GitHub → Jenkins webhook trigger
├── tests/
│   ├── health.test.js           # Health endpoint test
│   └── validate-user.test.js    # Business logic test (catches bugs)
├── Dockerfile                   # Lightweight container definition
├── Jenkinsfile                  # Declarative pipeline (5 stages)
├── package.json                 # Node.js project manifest
├── server.js                    # Express application (< 50 lines)
└── README.md                    # This file

Author
Sannidhi C S
