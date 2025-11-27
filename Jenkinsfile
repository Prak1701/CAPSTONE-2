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
    }

    post {
        always {
            cleanWs()
        }
    }
}
