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

    stage('AWS Identity + Terraform') {
      steps {
        withCredentials([
          string(credentialsId: 'aws_access_key_id', variable: 'AWS_ACCESS_KEY_ID'),
          string(credentialsId: 'aws_secret_access_key', variable: 'AWS_SECRET_ACCESS_KEY'),
          string(credentialsId: 'aws_session_token', variable: 'AWS_SESSION_TOKEN')
        ]) {

          sh 'aws sts get-caller-identity'

          dir('Infrastructure/terraform') {
            sh 'terraform init'
            sh 'terraform plan'
            sh 'terraform apply -auto-approve'
          }
        }
      }
    }
  }
}
