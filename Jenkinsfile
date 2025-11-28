pipeline {
    agent any

    environment {
        // ⭐ YOUR LOCAL PROJECT FOLDER (must exist!)
        COMPOSE_PROJECT_DIR = "C:/Users/prakr/Downloads/CAPSTONE-2"
        COMPOSE_PROJECT_NAME = "capstone-prod"
    }

    stages {

        /* -------------------------------------------------- */
        /* 1. CLEANUP OLD CONTAINERS                          */
        /* -------------------------------------------------- */
        stage('Cleanup Previous Containers') {
            steps {
                echo "🧹 Cleaning old containers and freeing ports..."

                dir("${env.COMPOSE_PROJECT_DIR}") {

                    // Free port 27018 (Mongo) safely
                    bat '''
                        powershell -Command "
                        $p = Get-NetTCPConnection -LocalPort 27018 -ErrorAction SilentlyContinue;
                        if ($p) { Stop-Process -Id $p.OwningProcess -Force }
                        "
                    '''

                    bat 'docker-compose down --remove-orphans || echo "No previous containers"'
                }
            }
        }

        /* -------------------------------------------------- */
        /* 2. BUILD & START ALL SERVICES                      */
        /* -------------------------------------------------- */
        stage('Build and Start Application') {
            steps {
                echo "🚀 Building Backend + Frontend + MongoDB..."

                dir("${env.COMPOSE_PROJECT_DIR}") {
                    bat 'docker-compose up --build -d'
                }
            }
        }

        /* -------------------------------------------------- */
        /* 3. WAIT FOR STARTUP                                */
        /* -------------------------------------------------- */
        stage('Wait For Services') {
            steps {
                echo "⏳ Waiting for services to initialize..."
                bat 'ping 127.0.0.1 -n 21 > nul'  // ~20 seconds wait
            }
        }

        /* -------------------------------------------------- */
        /* 4. SHOW RUNNING CONTAINERS                         */
        /* -------------------------------------------------- */
        stage('Verify Running Containers') {
            steps {
                dir("${env.COMPOSE_PROJECT_DIR}") {
                    bat 'docker ps'

                    echo "---------------------------------------------"
                    echo "   ✔ Deployment SUCCESSFUL"
                    echo "   🌐 Frontend: http://localhost:8081/"
                    echo "   🔥 Backend:  http://localhost:5000/"
                    echo "---------------------------------------------"
                }
            }
        }
    }

    post {
        success {
            echo "✨ Jenkins pipeline finished successfully!"
        }
        failure {
            echo "❌ Pipeline failed. Make sure Docker Desktop is running."
        }
    }
}
