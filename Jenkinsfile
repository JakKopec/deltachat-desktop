pipeline{
	agent any
	stages{
		stage('Build'){
			steps{
				echo 'Pulling from origin...'
				sh 'git pull origin master'
				echo 'Building...'
				sh 'npm install'
				sh 'npm run build'
			}
			post{
				always{
					emailtext attachlog: true
					body: '${currentBuild.currentResult}: Job ${env.JOB_NAME}' build ${env.BUILD_NUMBER} 
					recipientProviders: [developers(),requestor()]
					subject: 'Jenkins BUILD status: ${currentBuild.currentResult}'
					to: 'Lasiuk16@gmail.com'
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
					emailtext attachlog: true
					body: '${currentBuild.currentResult}: Job ${env.JOB_NAME}' build ${env.BUILD_NUMBER} 
					recipientProviders: [developers(),requestor()]
					subject: 'Jenkins TEST status: ${currentBuild.currentResult}'
					to: 'Lasiuk16@gmail.com'
				}
			}	
		}
}


