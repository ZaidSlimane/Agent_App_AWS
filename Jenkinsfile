pipeline {
  agent any

  environment {
    AWS_DEFAULT_REGION = 'us-east-1'
  }

  stages {

    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Terraform') {
      steps {
        withCredentials([
          string(credentialsId: 'aws_access_key_id', variable: 'AWS_ACCESS_KEY_ID'),
          string(credentialsId: 'aws_secret_access_key', variable: 'AWS_SECRET_ACCESS_KEY'),
          string(credentialsId: 'aws_session_token', variable: 'AWS_SESSION_TOKEN')
        ]) {

          dir('Infrastructure/terraform') {

            sh 'aws sts get-caller-identity'

            sh 'terraform init -input=false'
            sh 'terraform validate'

            // Plan
            sh 'terraform plan -input=false'

            // Apply
            sh 'terraform apply -auto-approve -input=false'
          }
        }
      }
    }
  }
}
