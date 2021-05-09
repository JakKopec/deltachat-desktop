pipeline{
	agent any
	stages{
		stage('Build'){
			steps{
				echo 'Building...'
				sh 'npm install'
				sh 'npm run build'
			}
		}
		stage('Test')
			steps{
				echo 'Testing...'
				sh 'npm run test'
			}	
	}
	post{
		always{
			emailtext attachlog: true
			body: '${currentBuild.currentResult}: Job ${env.JOB_NAME}' build ${env.BUILD_NUMBER} 
			recipientProviders: [developers(),requestor()]
			subject: 'Jenkins build: ${currentBuild.currentResult}'
			to: 'Lasiuk16@gmail.com'
		}
		
		
}


