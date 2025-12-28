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

    stage('Verify AWS Identity') {
      steps {
        withCredentials([
          [$class: 'AmazonWebServicesCredentialsBinding',
           credentialsId: 'aws_credentials']
        ]) {
          sh 'aws sts get-caller-identity'
        }
      }
    }

    stage('Terraform Init') {
      steps {
        dir('Infrastructure/terraform') {
          withCredentials([
            [$class: 'AmazonWebServicesCredentialsBinding',
             credentialsId: 'aws_credentials']
          ]) {
            sh 'terraform init'
          }
        }
      }
    }

    stage('Terraform Plan') {
      steps {
        dir('Infrastructure/terraform') {
          withCredentials([
            [$class: 'AmazonWebServicesCredentialsBinding',
             credentialsId: 'aws_credentials']
          ]) {
            sh 'terraform plan'
          }
        }
      }
    }

    stage('Terraform Apply') {
      steps {
        dir('Infrastructure/terraform') {
          withCredentials([
            [$class: 'AmazonWebServicesCredentialsBinding',
             credentialsId: 'aws_credentials']
          ]) {
            sh 'terraform apply -auto-approve'
          }
        }
      }
    }
  }
}

