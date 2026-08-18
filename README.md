# Automated Bug Testing & Deployment System

**Enterprise-Grade CI/CD Pipeline**  
Showcasing automated testing, containerization, security linting, and zero-downtime deployment practices.

## Project Overview

This project demonstrates a fully automated **CI/CD pipeline** that:

1. **Detects bugs automatically** — Unit tests run on every commit; if a test fails, the pipeline aborts immediately.
2. **Enforces code quality & security** — A lint + security scan stage simulates enterprise tools like SonarQube and ESLint.
3. **Builds container artifacts** — A lightweight Docker image is created using a `node:24-alpine` base.
4. **Validates deployments** — The pipeline runs the container locally and verifies the `/health` endpoint responds correctly.
5. **Stores successful validations** — Passing user payloads are saved in a small SQLite database so the app demonstrates simple persistence.

The result: **bad code never reaches production**, and deployments are consistent, repeatable, and auditable.

## Enterprise Impact

## Concern  How This Project Addresses It:
**Manual deployment errors** Every deployment follows the same automated pipeline — no human typos, no forgotten steps. 
**Bugs reaching production** Automated tests run on every commit. If a test fails, the pipeline aborts before any artifact is built. 
**Security vulnerabilities** The lint & security scan stage simulates tools like SonarQube and ESLint, catching issues early. 
**Inconsistent environments** Docker containers guarantee the same runtime environment in dev, CI, and production. 
**Slow release cycles**  Full pipeline runs in under 2 minutes, enabling rapid, safe iterations. 
**Audit trail** Every pipeline run is logged in Jenkins with timestamps, test results, and artifact IDs. 
