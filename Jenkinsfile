pipeline{
	agent any
	
tools {nodejs "nodejs"}

	stages{
		stage('Build'){ 
			steps{
				echo 'Building...'
				sh 'npm install'
				sh 'npm audit fix'
				sh 'npm run build'
		    }
		}
		stage('Test'){
			steps{
				echo 'Testing...'
				sh 'npm run test'
			}
		}	
	}
	post{
		failure{
			emailext attachLog: true,
				body: "${currentBuild.currentResult}: ${currentBuild.fullDisplayName}",
				to: 'Lasiuk16@gmail.com',
				subject: "Jenkins build failed, ${env.BUILD_NUMBER}"
		}
		success{
			emailext attachLog: true,
				body: "${currentBuild.currentResult}: ${currentBuild.fullDisplayName}",
				to: 'Lasiuk16@gmail.com',
				subject: "Jenkins build succeeded, ${env.BUILD_NUMBER}"
		}		
	}
}
