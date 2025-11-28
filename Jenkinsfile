pipeline {
    agent any

    environment {
        // Pointing directly to your local project folder (Like your example!)
        COMPOSE_PROJECT_DIR = "C:/Users/prakr/Downloads/CAPSTONE-2"
        COMPOSE_PROJECT_NAME = 'capstone-prod'
    }

    stages {
        stage('Clean up any previous containers') {
            steps {
                dir("${env.COMPOSE_PROJECT_DIR}") {
                    // Safe Cleanup (My special script to fix port 27018)
                    bat 'powershell -Command "Stop-Process -Id (Get-NetTCPConnection -LocalPort 27018 -ErrorAction SilentlyContinue).OwningProcess -Force -ErrorAction SilentlyContinue; exit 0"'
                    bat 'docker-compose down --remove-orphans || echo "Clean start"'
                }
            }
        }

        stage('Build and Start Containers') {
            steps {
                dir("${env.COMPOSE_PROJECT_DIR}") {
                    // This builds AND runs everything (Backend + Frontend + Mongo)
                    bat 'docker-compose up --build -d'
                }
            }
        }

        stage('Wait for Services to Start') {
            steps {
                echo '⏳ Waiting for services to initialize...'
                // Using ping hack because 'sleep' sometimes fails on Windows Jenkins
                bat 'ping 127.0.0.1 -n 21 > nul' 
            }
        }

        stage('Verify Running Containers') {
            steps {
                dir("${env.COMPOSE_PROJECT_DIR}") {
                    bat 'docker ps'
                    echo "---------------------------------------------------"
                    echo "   SUCCESS! Open: http://localhost:8081   "
                    echo "---------------------------------------------------"
                }
            }
        }
    }

    post {
        success {
            echo 'Dockerized Capstone App launched successfully via Jenkins!'
        }
        failure {
            echo 'Build failed. Check logs for container errors.'
        }
    }
}
