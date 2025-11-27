pipeline {
    agent any

    environment {
        PYTHON_ENV = 'venv'
        COMPOSE_PROJECT_NAME = 'capstone-prod' // Enforce consistent container names
    }

    stages {
        stage('Cleanup') {
            steps {
                script {
                    echo "Cleaning up previous deployments..."
                    bat 'docker-compose down --remove-orphans || echo "Clean start"'
                    bat 'ping 127.0.0.1 -n 3 > nul'
                }
            }
        }

        stage('Build and Deploy') {
            steps {
                script {
                    // 1. Aggressive Cleanup of known previous projects
                    bat 'docker-compose -p capstone-2 down --remove-orphans || echo "capstone-2 not found"'
                    
                    // 2. Run the Port Killer Script for Containers (PowerShell)
                    // This safely removes CONTAINERS using the ports, without killing the Docker Daemon
                    bat 'powershell -Command "docker ps -q | ForEach-Object { docker inspect --format \'{{.Id}} {{range $p, $conf := .NetworkSettings.Ports}}{{$p}} {{end}}\' $_ } | Select-String \'27018|5000|8081\' | ForEach-Object { docker rm -f ($_.ToString().Split(\' \')[0]) }; exit 0"'
                    
                    // 3. Standard Cleanup
                    bat 'docker-compose down --remove-orphans || echo "Clean start"'
                    
                    // 4. Wait for ports to release
                    bat 'ping 127.0.0.1 -n 6 > nul' // Wait 5 seconds
                    
                    // 5. Start Fresh
                    bat 'docker-compose up -d --build'
                }
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
