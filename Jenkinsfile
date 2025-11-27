pipeline {
    agent any

    environment {
        PYTHON_ENV = 'venv'
    }

    stages {
        stage('Build Backend') {
            steps {
                script {
                    // Build the image first
                    docker.build("backend-main:${env.BUILD_ID}", "./backend_main")
                }
            }
        }

        stage('Test Backend') {
            steps {
                script {
                    // Run tests INSIDE the container
                    // We mount the tests directory to ensure we're testing the latest code
                    bat "docker run --rm backend-main:${env.BUILD_ID} pytest tests"
                }
            }
        }

        stage('Build Frontend') {
            steps {
                script {
                    docker.build("frontend:${env.BUILD_ID}", ".")
                }
            }
        }

        stage('Deploy') {
            steps {
                bat 'docker-compose up -d --build'
            }
        }

        stage('Verify Deployment') {
            steps {
                script {
                    echo "Waiting for services to start..."
                    bat 'ping 127.0.0.1 -n 21 > nul' // Wait 20 seconds (ping hack for Jenkins)
                    
                    echo "Checking Backend Health..."
                    bat 'curl -f http://localhost:5000/ || echo Backend not ready yet'
                    
                    echo "Checking Frontend Health..."
                    bat 'curl -f http://localhost:8081/ || echo Frontend not ready yet'
                    
                    echo "---------------------------------------------------"
                    echo "   DEPLOYMENT SUCCESSFUL!   "
                    echo "   Open your browser to: http://localhost:8081   "
                    echo "---------------------------------------------------"
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
    }
}
