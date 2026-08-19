// =============================================================================
// Jenkinsfile — Declarative Pipeline for Automated Bug Testing & Deployment
// =============================================================================
// This Jenkinsfile defines a 5-stage CI/CD pipeline that:
//   1. Checks out the latest code from GitHub
//   2. Runs linting and a mock security scan
//   3. Executes automated unit tests (aborts on failure)
//   4. Builds a Docker container image
//   5. Deploys the container locally and verifies the /health endpoint
//
// Each stage is heavily commented so you can explain the "why" behind it
// during your HPE interview.
// =============================================================================

pipeline {
    // -----------------------------------------------------------------------
    // AGENT
    // -----------------------------------------------------------------------
    // Use any available agent (Jenkins node) that has Docker installed.
    // In a real enterprise, you'd use a labeled agent (e.g., 'docker-node').
    agent any

    // -----------------------------------------------------------------------
    // ENVIRONMENT
    // -----------------------------------------------------------------------
    // Centralized environment variables make the pipeline easy to configure.
    // These values are used across multiple stages.
    environment {
        // Name for the Docker image we'll build
        DOCKER_IMAGE = 'smart-cicd-pipeline'
        // Tag for the image (using build number ensures unique artifacts)
        DOCKER_TAG   = "${env.BUILD_NUMBER}"
        // Port the container will expose
        APP_PORT     = '3000'
        // Node.js version (used for consistency across stages)
        NODE_VERSION = '18'
    }

    // -----------------------------------------------------------------------
    // STAGES
    // -----------------------------------------------------------------------
    stages {
        // ===================================================================
        // STAGE 1: CHECKOUT
        // ===================================================================
        // Pulls the latest source code from the GitHub repository.
        // This is the first step in any CI/CD pipeline — without the code,
        // nothing else can happen.
        stage('Checkout') {
            steps {
                echo '========================================'
                echo 'STAGE 1: Checking out code from GitHub...'
                echo '========================================'
                // 'checkout scm' is a Jenkins shorthand that pulls the code
                // configured in the Jenkins job (e.g., from GitHub, GitLab).
                checkout scm
                echo 'Code checked out successfully.'
            }
        }

        // ===================================================================
        // STAGE 2: LINT & SECURITY SCAN
        // ===================================================================
        // Enterprise-grade pipelines always include code quality and security
        // checks. In a real HPE environment, this stage would integrate with:
        //   - SonarQube (static code analysis)
        //   - ESLint / Prettier (code style enforcement)
        //   - npm audit / Snyk (dependency vulnerability scanning)
        //
        // Here we simulate these tools with echo commands. The key point is
        // that this stage runs BEFORE tests, catching style and security
        // issues early — "shift left" security.
        stage('Lint & Security Scan') {
            steps {
                echo '========================================'
                echo 'STAGE 2: Running lint & security scan...'
                echo '========================================'

                // --- Mock ESLint ---
                // In production: sh 'npx eslint src/'
                echo '[ESLint] Checking code style...'
                echo '[ESLint] ✅ No style violations found.'

                // --- Mock SonarQube ---
                // In production: sh 'sonar-scanner ...'
                echo '[SonarQube] Analyzing code quality...'
                echo '[SonarQube] ✅ Quality gate passed.'

                // --- Mock Security Scan ---
                // In production: sh 'npm audit' or 'snyk test'
                echo '[Security] Scanning dependencies for vulnerabilities...'
                echo '[Security] ✅ No critical vulnerabilities found.'

                echo 'Lint & security scan completed successfully.'
            }
        }

        // ===================================================================
        // STAGE 3: AUTOMATED BUG TESTING
        // ===================================================================
        // THIS IS THE MOST IMPORTANT STAGE.
        //
        // It runs the Jest test suite. If ANY test fails, the pipeline
        // immediately aborts — no Docker image is built, no deployment
        // happens. This is how we guarantee that "bad code never reaches
        // production."
        //
        // The test suite includes a specific "bug-catching" test that
        // validates input types (see tests/validate-user.test.js). If a
        // developer accidentally sends a string where a number is expected,
        // the test fails and the pipeline stops.
        stage('Automated Bug Testing') {
            steps {
                echo '========================================'
                echo 'STAGE 3: Running automated bug tests...'
                echo '========================================'
                // Install dependencies (in a real pipeline, you'd cache
                // node_modules to speed this up).
                bat 'npm install'

                // Run the Jest test suite with verbose output.
                // If any test fails, the 'sh' step returns a non-zero exit
                // code, which causes Jenkins to mark this stage as FAILED
                // and abort the pipeline.
                bat 'npm test'
                echo '✅ All tests passed. No bugs detected.'
            }
        }

        // ===================================================================
        // STAGE 4: CONTAINER ARTIFACT BUILD
        // ===================================================================
        // Once the code has passed linting, security scanning, AND all tests,
        // we build a Docker image. This image is the deployable artifact.
        //
        // Using Docker guarantees that the application runs in the exact same
        // environment in development, CI, and production — eliminating
        // "it works on my machine" problems.
        stage('Container Artifact Build') {
            steps {
                echo '========================================'
                echo 'STAGE 4: Building Docker image...'
                echo '========================================'
                // Build the Docker image using the Dockerfile in the root.
                // Tag it with the build number for traceability.
                bat "docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} ."
                echo "✅ Docker image built: ${DOCKER_IMAGE}:${DOCKER_TAG}"
            }
        }

        // ===================================================================
        // STAGE 5: MOCK DEPLOYMENT & HEALTH CHECK
        // ===================================================================
        // This stage simulates a production deployment by:
        //   1. Running the Docker container locally
        //   2. Waiting for it to start
        //   3. Hitting the /health endpoint to verify it's working
        //
        // In a real enterprise, this would deploy to Kubernetes, AWS ECS,
        // or an HPE GreenLake container environment. The health check
        // concept remains the same.
        stage('Mock Deployment & Health Check') {
            steps {
                echo '========================================'
                echo 'STAGE 5: Deploying & verifying health...'
                echo '========================================'

                // Stop and remove any previous container with the same name
                // (so we don't get port conflicts).
                bat "docker rm -f ${DOCKER_IMAGE}-test || true"

                // Run the container in detached mode, mapping port 3000.
                bat "docker run -d --name ${DOCKER_IMAGE}-test -p ${APP_PORT}:${APP_PORT} ${DOCKER_IMAGE}:${DOCKER_TAG}"

                // Give the container a moment to start up.
                bat 'timeout /t 3 /nobreak >nul'

                // Hit the /health endpoint using curl.
                // If the container is running correctly, we'll get a 200
                // response with {"status":"healthy",...}.
                // If the container failed to start, curl will fail and the
                // pipeline will abort.
                bat "curl --fail http://localhost:${APP_PORT}/health"

                echo '✅ Health check passed. Deployment verified.'

                // Clean up the test container.
                bat "docker rm -f ${DOCKER_IMAGE}-test || exit /b 0"
            }
        }
    }

    // -----------------------------------------------------------------------
    // POST
    // -----------------------------------------------------------------------
    // Always run cleanup, regardless of pipeline success or failure.
    // This prevents dangling containers and images from accumulating.
    post {
        always {
            echo '========================================'
            echo 'Pipeline complete. Cleaning up...'
            echo '========================================'
            // Remove any leftover test containers
            bat "docker rm -f ${DOCKER_IMAGE}-test || exit /b 0"
        }
        failure {
            echo '❌ Pipeline FAILED. See logs above for details.'
        }
        success {
            echo '✅ Pipeline completed successfully!'
        }
    }
}
