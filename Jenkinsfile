properties([pipelineTriggers([githubPush()])])
pipeline{
	agent{
		any
	}
	
tools {nodejs "nodejs"}
	
	stages{
		stage('Checkout SCM') {
            steps {
                checkout([
                 $class: 'GitSCM',
                 branches: [[name: 'master']],
                 userRemoteConfigs: [[
                    url: 'git@github.com:JakKopec/deltachat-desktop.git',
                    credentialsId: '',
                 ]]
                ])
            }
        }
		stage('Build'){
			steps{
				echo 'Pulling from origin...'
				sh 'git pull origin master'
				echo 'Building...'
				sh 'npm install'
				sh 'npm audit fix'
				sh 'npm run build'
			}
			post{
				always{
					emailext attachLog: true,
					body: "${env.JOB_NAME} build finished. Result:${currentBuild.currentResult}",
					to: 'Lasiuk16@gmail.com',
					recipientProviders: [developers(), requestor()],
					subject: "Jenkins: ${env.JOB_NAME} BUILD result:${currentBuild.currentResult}"
				}
			}
		}
		stage('Test'){
			steps{
				echo 'Testing...'
				sh 'npm run test'
			}
			post{
				always{
					emailext attachLog: true,
					body: "${env.JOB_NAME} tests finished. Result:${currentBuild.currentResult}",
					to: 'Lasiuk16@gmail.com',
					recipientProviders: [developers(), requestor()],
					subject: "Jenkins: ${env.JOB_NAME} TEST result:${currentBuild.currentResult}"
				}
			}	
		}
	}
}
