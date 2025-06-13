pipeline {
 agent any
	environment {
        COMMIT_USER = ''
        COMMIT_MESSAGE = ''
        COMMIT_DESCRIPTION = ''
        SSH_CREDENTIALS_ID = 'host_machine'
    }
stages {
  stage('Extract Git Info') {
            steps {
                script {
                    COMMIT_USER = sh(script: "git log -1 --pretty=format:'%an'", returnStdout: true).trim()
                    COMMIT_MESSAGE = sh(script: "git log -1 --pretty=format:'%s'", returnStdout: true).trim()
                    COMMIT_DESCRIPTION = sh(script: "git log -1 --pretty=format:'%b'", returnStdout: true).trim()
                }
            }
        }
  stage('Test On Dev') {
    when {expression {env.BRANCH_NAME == 'development'}}
     steps {
			script {
                        slackSend channel: "#jenkins", color: "warning", message: "BackEnd NodeJS **Dev** Env https://api.rminder.ge/docs build status is STARTED!\n Commit made by: ${COMMIT_USER}\nCommit Message: ${COMMIT_MESSAGE}\nCommit Description: ${COMMIT_DESCRIPTION}"
                    }
			sh ''
        }
    }
    stage('Test On Prod') {
     when {expression {env.BRANCH_NAME == 'Prod'}}
      steps {
          sh ''
      }
    }
   stage('Git Pull to Dev') {
    when {expression {env.BRANCH_NAME == 'development'}}
     steps {
	   script {
                    sshagent([SSH_CREDENTIALS_ID]) {
                        sh """
                        ssh -o StrictHostKeyChecking=no rminder@10.13.13.13 'cd /var/opt/docker/rminder_service/rminderservice/ && docker compose down'
						ssh -o StrictHostKeyChecking=no rminder@10.13.13.13 'docker image prune -f'
						ssh -o StrictHostKeyChecking=no rminder@10.13.13.13 'cd /var/opt/docker/rminder_service/rminderservice/ && git reset --hard'
						ssh -o StrictHostKeyChecking=no rminder@10.13.13.13 'cd /var/opt/docker/rminder_service/rminderservice/ && git pull'
                        """
                  }
             }
     	}
    }
    stage('Publish on Dev') {
     when {expression {env.BRANCH_NAME == 'development'}}
      steps {	 
	       script {
                    sshagent([SSH_CREDENTIALS_ID]) {
                        sh """
                        ssh -o StrictHostKeyChecking=no rminder@10.13.13.13 'cd /var/opt/docker/rminder_service/rminderservice/ && docker compose up --build -d'
                        """
                  }
			script {
                        slackSend channel: "#jenkins", color: "good", message: "BackEnd NodeJS **Dev** Env https://api.rminder.ge/docs updated successfully!\n Commit made by: ${COMMIT_USER}\nCommit Message: ${COMMIT_MESSAGE}\nCommit Description: ${COMMIT_DESCRIPTION}"
                    }
             }
      	}
    }
    stage('Publish on Production') {
      when {expression {env.BRANCH_NAME == 'Prod'}}
      steps {
	 sh ''
      }
    }
    stage('Clear Work Spase') {
      steps {
        deleteDir()
      }
    }
  }
  post {
        failure {
            script {
                COMMIT_USER = sh(script: "git log -1 --pretty=format:'%an'", returnStdout: true).trim()
                COMMIT_MESSAGE = sh(script: "git log -1 --pretty=format:'%s'", returnStdout: true).trim()
                COMMIT_DESCRIPTION = sh(script: "git log -1 --pretty=format:'%b'", returnStdout: true).trim()

                def slackMessage = "Build failed for ${currentBuild.fullDisplayName}.\n\n" +
                    "Build URL: ${env.BUILD_URL}\n" +
                    "Console Log: ${env.BUILD_URL}console\n" +
                    "Commit made by: ${COMMIT_USER}\n" +
                    "Commit Message: ${COMMIT_MESSAGE}\n" +
                    "Commit Description: ${COMMIT_DESCRIPTION}"
                slackSend(channel: "#jenkins", color: "danger", message: slackMessage)
            }
        }
    }
}