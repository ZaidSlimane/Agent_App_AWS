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
          // AWS Credentials
          string(credentialsId: 'aws_access_key_id', variable: 'AWS_ACCESS_KEY_ID'),
          string(credentialsId: 'aws_secret_access_key', variable: 'AWS_SECRET_ACCESS_KEY'),
          string(credentialsId: 'aws_session_token', variable: 'AWS_SESSION_TOKEN'),
          
          // TFVARS as a Secret File
          // 'tfvars-secret-id' is the ID you gave the credential in Jenkins
          file(credentialsId: 'terraform-tfvars', variable: 'TFVARS_PATH') 
        ]) {

          dir('Infrastructure/terraform') {

            sh 'aws sts get-caller-identity'

            sh 'terraform init -input=false'
            sh 'terraform validate'

            // Use the variable TFVARS_PATH provided by withCredentials
            // Note: We use double quotes "" for variable interpolation
            sh "terraform plan -var-file='${TFVARS_PATH}' -input=false"

            sh "terraform apply -var-file='${TFVARS_PATH}' -auto-approve -input=false"
          }
        }
      }
    }
  }
}
