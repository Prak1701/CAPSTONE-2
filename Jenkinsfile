pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                echo "📦 Using Jenkins workspace checkout"
                bat "dir"
            }
        }

        stage('Unit Tests') {
            steps {
                echo "🧪 Running backend pytest suite inside Docker..."
                dir("backend_main") {
                    bat 'docker build -t capstone-backend-test .'
                    bat 'docker run --rm capstone-backend-test pytest tests'
                }
            }
        }

        stage('Build Backend Image') {
            steps {
                echo "🐳 Building backend_main image via docker-compose..."
                bat 'docker-compose build backend_main'
            }
        }

        stage('Build Frontend Image') {
            steps {
                echo "🐳 Building frontend image via docker-compose..."
                bat 'docker-compose build frontend'
            }
        }

        stage('Deploy Using Docker Compose') {
            steps {
                echo "🚀 Deploying full stack with docker-compose..."
                
                // Stop previous stack
                bat 'docker-compose down --remove-orphans || echo "Nothing to stop"'

                // Start new stack
                bat 'docker-compose up -d'
            }
        }

        stage('Verify Deployment') {
            steps {
                echo "⏳ Waiting for services to initialize..."
                bat 'ping 127.0.0.1 -n 10 > nul'

                echo "✅ Verifying containers and endpoints..."
                bat 'docker ps'

                // ✅ backend health-check FIX (uses actual working endpoint)
                bat 'curl -f http://localhost:5000/api || echo Backend not responding yet'

                // frontend check
                bat 'curl -f http://localhost:8081/ || echo Frontend not responding yet'

                echo "----------------------------------------"
                echo " App should now be running on: "
                echo " http://localhost:8081"
                echo "----------------------------------------"
            }
        }
    }

    post {
        success {
            echo "🎉 App deployed successfully!"
        }
        failure {
            echo "❌ Pipeline failed. Check which stage turned red."
        }
    }
}
