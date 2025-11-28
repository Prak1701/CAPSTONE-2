pipeline {
    agent any

    environment {
        COMPOSE_PROJECT_DIR = "C:/Users/prakr/Downloads/CAPSTONE-2"
        COMPOSE_PROJECT_NAME = 'capstone-prod'
    }

    stages {
        stage('Start Unit Testing') {
            steps {
                dir("${env.COMPOSE_PROJECT_DIR}") {
                    // Run tests using a temporary container
                    bat 'docker-compose build backend_main'
                    bat 'docker-compose run --rm backend_main pytest tests'
                }
            }
        }

        stage('Build Backend') {
            steps {
                dir("${env.COMPOSE_PROJECT_DIR}") {
                    // We already built it in testing, but ensuring it's tagged/ready
                    bat 'docker-compose build backend_main'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir("${env.COMPOSE_PROJECT_DIR}") {
                    bat 'docker-compose build frontend'
                }
            }
        }

        stage('Deploy') {
            steps {
                dir("${env.COMPOSE_PROJECT_DIR}") {
                    // 1. Safe Cleanup (Port 27018 fix)
                    bat 'powershell -Command "Stop-Process -Id (Get-NetTCPConnection -LocalPort 27018 -ErrorAction SilentlyContinue).OwningProcess -Force -ErrorAction SilentlyContinue; exit 0"'
                    bat 'docker-compose down --remove-orphans || echo "Clean start"'
                    
                    // 2. Start Everything
                    bat 'docker-compose up -d'
                }
            }
        }

        stage('Success') {
            steps {
                dir("${env.COMPOSE_PROJECT_DIR}") {
                    echo '⏳ Waiting for services...'
                    bat 'ping 127.0.0.1 -n 21 > nul'
                    bat 'docker ps'
                    echo "---------------------------------------------------"
                    echo "   DEPLOYMENT SUCCESSFUL!   "
                    echo "   Open: http://localhost:8081   "
                    echo "---------------------------------------------------"
                }
            }
        }
    }

    post {
        failure {
            echo '❌ Build failed. Check logs.'
        }
    }
}
