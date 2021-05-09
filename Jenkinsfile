pipeline{
	agent any
	
	tools {nodejs "nodejs"}
	
	stages{
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
					body: "${currentBuild.currentResult}: ${currentBuild.fullDisplayName}",
					to: 'Lasiuk16@gmail.com',
					recipientProviders: [developers(), requestor()],
					subject: "Jenkins BUILD result:${currentBuild.currentResult}"
				}
			}
		}
		stage('Test')
			when{		
				expression{currentBuild.result=='SUCCESS'}
			}
			steps{
				echo 'Testing...'
				sh 'npm run test'
			}
			post{
				always{
					body: "${currentBuild.currentResult}: ${currentBuild.fullDisplayName}",
					to: 'Lasiuk16@gmail.com',
					recipientProviders: [developers(), requestor()],
					subject: "Jenkins TEST result:${currentBuild.currentResult}"
				}
			}	
		}
}
