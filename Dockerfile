# =============================================================================
# Dockerfile — Lightweight Node.js Container for SmartCICDPipeline
# =============================================================================
# This Dockerfile uses the official node:24-alpine image, which includes the
# built-in SQLite support used by this demo. Alpine-based images are still a
# good fit because they keep the container small and predictable.
#
# Multi-stage builds are not needed here since this is a simple Express app,
# but in a real enterprise you'd add a builder stage for TypeScript compilation
# or dependency pruning.
# =============================================================================

# ---- Base Image ----
# In production, you'd pin to a specific digest (e.g., node:24-alpine@sha256:...)
# for reproducibility.
FROM node:24-alpine

# ---- Metadata ----
LABEL maintainer="HPE Interview Demo"
LABEL description="Automated Bug Testing & Deployment System"

# ---- Environment ----
# Set NODE_ENV to production so Express runs in optimized mode.
ENV NODE_ENV=production

# ---- Working Directory ----
# All subsequent commands will run from /app inside the container.
WORKDIR /app

# ---- Install Dependencies ----
# Copy package.json and package-lock.json FIRST (before copying source code).
# This leverages Docker layer caching: if dependencies haven't changed, this
# layer is reused from cache, making builds much faster.
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# ---- Copy Application Code ----
# Copy the rest of the application source code into the container.
COPY . .

# ---- Expose Port ----
# Inform Docker that the container listens on port 3000 at runtime.
EXPOSE 3000

# ---- Start Command ----
# Use the lightweight 'node' command directly (not npm start) to avoid an
# extra process layer. The server.js will listen on PORT=3000 by default.
CMD ["node", "server.js"]
