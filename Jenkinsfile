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
		failure{
			emailtext attachlog: true,
				body: "${currentBuild.currentResult}: ${currentBuild.fullDisplayName}",
				to: 'Lasiuk16@gmail.com',
				subject: "Jenkins build: ${currentBuild.currentResult}, ${env.BUILD_NUMBER}"
		}
		success{
			emailtext attachlog: true,
				body: "${currentBuild.currentResult}: ${currentBuild.fullDisplayName}",
				to: 'Lasiuk16@gmail.com',
				subject: "Jenkins build: ${currentBuild.currentResult}, ${env.BUILD_NUMBER}"
		}		
	}
}
