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

    stage('Terraform Orchestrated Flow') {
      steps {
        withCredentials([
          string(credentialsId: 'aws_access_key_id', variable: 'AWS_ACCESS_KEY_ID'),
          string(credentialsId: 'aws_secret_access_key', variable: 'AWS_SECRET_ACCESS_KEY'),
          string(credentialsId: 'aws_session_token', variable: 'AWS_SESSION_TOKEN')
        ]) {

          script {
            dir('Infrastructure/terraform') {

              sh 'aws sts get-caller-identity'
              sh 'terraform init -input=false -lock-timeout=60s'
              sh 'terraform validate'

              /* --------------------------------------------------
                 STEP 1: WAIT IF TERRAFORM IS BUSY
              -------------------------------------------------- */

              int maxWait = 10        // 10 × 30s = 5 minutes
              int waitCount = 0

              while (waitCount < maxWait) {
                def state = sh(
                  script: 'terraform state list || true',
                  returnStdout: true
                ).trim()

                if (!state) {
                  echo "No active resources detected."
                  break
                }

                echo "Resources still present (waiting before any action)"
                echo state
                waitCount++
                sleep time: 30, unit: 'SECONDS'
              }

              if (waitCount == maxWait) {
                error "Terraform did not reach idle state in time"
              }

              /* --------------------------------------------------
                 STEP 2: RUN PLAN (DETECT IF DESTROY IS NEEDED)
              -------------------------------------------------- */

              int planExitCode = sh(
                script: 'terraform plan -input=false -detailed-exitcode',
                returnStatus: true
              )

              if (planExitCode == 1) {
                error "Terraform plan failed"
              }

              if (planExitCode == 2) {
                echo "Plan indicates changes — checking if destroy is required"

                def stateBeforeDestroy = sh(
                  script: 'terraform state list || true',
                  returnStdout: true
                ).trim()

                if (stateBeforeDestroy) {
                  echo "Existing resources detected → destroying first"

                  sh 'terraform destroy -auto-approve -input=false'

                  /* ----------------------------------------------
                     STEP 3: WAIT UNTIL DESTROY FINISHES
                  ---------------------------------------------- */

                  int destroyWait = 0
                  while (destroyWait < maxWait) {
                    def postDestroyState = sh(
                      script: 'terraform state list || true',
                      returnStdout: true
                    ).trim()

                    if (!postDestroyState) {
                      echo "Destroy complete, state is clean"
                      break
                    }

                    destroyWait++
                    echo "⏳ Waiting for destroy to complete"
                    sleep time: 30, unit: 'SECONDS'
                  }

                  if (destroyWait == maxWait) {
                    error "Destroy did not complete in time"
                  }

                  echo "Running fresh plan after destroy"
                  sh 'terraform plan -input=false'
                }
              }

              /* --------------------------------------------------
                 STEP 4: APPLY
              -------------------------------------------------- */

              echo "Applying infrastructure"
              sh 'terraform apply -auto-approve -input=false'
            }
          }
        }
      }
    }
  }
}
