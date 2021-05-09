pipeline{
	agent any
	
tools {nodejs "nodejs"}

	stages{
		stage('Test'){
			steps{
				echo 'Testing...'
				sh 'npm install'
				sh 'npm run test'
			}
		}	
	}
	post{
		always{
			emailtext attachlog: true,
			body: "${currentBuild.currentResult}: Job ${env.JOB_NAME} build ${env.BUILD_NUMBER}",
			to: 'Lasiuk16@gmail.com',
			subject: "Jenkins build: ${currentBuild.currentResult}, ${env.BUILD_NUMBER}"
			
		}		
	}
}
