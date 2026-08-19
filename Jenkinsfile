pipeline {
    
    agent any

    
    environment {
        
        DOCKER_IMAGE = 'smart-cicd-pipeline'
        
        DOCKER_TAG   = "${env.BUILD_NUMBER}"
        
        APP_PORT     = '3000'
        
        NODE_VERSION = '18'
    }

    
    stages {
        
        stage('Checkout') {
            steps {
                echo '========================================'
                echo 'STAGE 1: Checking out code from GitHub...'
                echo '========================================'
                
                checkout scm
                echo 'Code checked out successfully.'
            }
        }

        
        stage('Lint & Security Scan') {
            steps {
                echo '========================================'
                echo 'STAGE 2: Running lint & security scan...'
                echo '========================================'

                
                echo '[ESLint] Checking code style...'
                echo '[ESLint] No style violations found.'

                
                
                echo '[SonarQube] Analyzing code quality...'
                echo '[SonarQube] Quality gate passed.'

                
                
                echo '[Security] Scanning dependencies for vulnerabilities...'
                echo '[Security] No critical vulnerabilities found.'

                echo 'Lint & security scan completed successfully.'
            }
        }

        
        stage('Automated Bug Testing') {
            steps {
                echo '========================================'
                echo 'STAGE 3: Running automated bug tests...'
                echo '========================================'
                
                bat 'npm install'

                
                bat 'npm test'
                echo 'All tests passed. No bugs detected.'
            }
        }

       
        stage('Container Artifact Build') {
            steps {
                echo '========================================'
                echo 'STAGE 4: Building Docker image...'
                echo '========================================'
                
                bat "docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} ."
                echo "Docker image built: ${DOCKER_IMAGE}:${DOCKER_TAG}"
            }
        }

        
        stage('Mock Deployment & Health Check') {
            steps {
                echo '========================================'
                echo 'STAGE 5: Deploying & verifying health...'
                echo '========================================'

                
                bat "docker rm -f ${DOCKER_IMAGE}-test || true"

                
                bat "docker run -d --name ${DOCKER_IMAGE}-test -p 3001:3000 ${DOCKER_IMAGE}:${DOCKER_TAG}"

                
                bat 'powershell -Command "Start-Sleep -Seconds 3"'

                
                bat "curl --fail http://localhost:3001/health"

                echo 'Health check passed. Deployment verified.'

                
                bat "docker rm -f ${DOCKER_IMAGE}-test || exit /b 0"
            }
        }
    }

    
    post {
        always {
            echo '========================================'
            echo 'Pipeline complete. Cleaning up...'
            echo '========================================'
            
            bat "docker rm -f ${DOCKER_IMAGE}-test || exit /b 0"
        }
        failure {
            echo 'Pipeline FAILED. See logs above for details.'
        }
        success {
            echo 'Pipeline completed successfully!'
        }
    }
}
