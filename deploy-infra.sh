#!/bin/bash

# I named my aws CLI profile 'personal' so that's what the file says
# this is an aws profile in the ~/.aws directory that has 
# CloudFormation permissions to deploy lucretia-bott 
# and lucretia-bott-setup stacks
AWS_PROFILE=$(cat ~/.env/cli-profile)
# personal access token for github that you feel comfortable pushing to AWS
# Generate a personal access token with repo and admin:repo_hook
# permissions from https://github.com/settings/tokens
GH_ACCESS_TOKEN=$(cat ~/.env/lucretia-bott-access-token)

GH_OWNER="emmahyde"
GH_REPO="lucretia-bott"
GH_BRANCH="master"

AWS_ACCOUNT_ID=`aws sts get-caller-identity --profile $AWS_PROFILE --query "Account" --output text`
STACK_NAME=lucretia-bott
REGION=us-east-1 
EC2_INSTANCE_TYPE=t2.micro
CODEPIPELINE_BUCKET="$STACK_NAME-$REGION-codepipeline-$AWS_ACCOUNT_ID"

echo -e "GITHUB REPOSITORY:\t $GH_OWNER/$GH_REPO/$GH_BRANCH"
echo -e "AWS ACCOUNT ID:\t\t $AWS_ACCOUNT_ID"
echo -e "AWS PROFILE:\t\t $AWS_PROFILE"
echo -e "AWS REGION:\t\t $REGION"
echo -e "EC2 INSTANCE TYPE:\t $EC2_INSTANCE_mkdir -p ~/.env; touch ~/.env/lucretia-bott-access-token ~/.env/cli-profile ~/.env/poopTYPE"
echo -e "CODEPIPELINE BUCKET:\t $CODEPIPELINE_BUCKET"

# Deploys static resources
echo -e "\n\n=========== DEPLOYING SETUP.YML ==========="
echo -e "STACK_NAME: $STACK_NAME-setup"
echo -e "templates the dependencies of the code deploy itself."
echo -e "(effectively sets up a bucket for artifacts.)"
echo -e "-------------------------------------------"
aws cloudformation deploy \
  --region $REGION \
  --profile $AWS_PROFILE \
  --stack-name $STACK_NAME-setup \
  --template-file deploy/setup.yml \
  --no-fail-on-empty-changeset \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides \
    CodePipelineBucket=$CODEPIPELINE_BUCKET
echo -e "\n==========================================="

# Deploy the CloudFormation template
echo -e "\n\n=========== DEPLOYING MAIN.YML ============"
echo -e "STACK_NAME: $STACK_NAME"
echo -e "templates the majority of the cloudformation template."
echo -e "this includes the bash script the EC2 instance runs, permissions, and pipelines."
echo -e "-------------------------------------------"
aws cloudformation deploy \
  --region $REGION \
  --profile $AWS_PROFILE \
  --stack-name $STACK_NAME \
  --template-file deploy/main.yml \
  --no-fail-on-empty-changeset \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides \
    EC2InstanceType=$EC2_INSTANCE_TYPE \
    GitHubOwner=$GH_OWNER \
    GitHubRepo=$GH_REPO \
    GitHubBranch=$GH_BRANCH \
    GitHubPersonalAccessToken=$GH_ACCESS_TOKEN \
    CodePipelineBucket=$CODEPIPELINE_BUCKET
echo -e "\n===========================================\n\n"

# If the deploy succeeded, show the DNS name of the created instance
if [ $? -eq 0 ]; then
  aws cloudformation list-exports \
  --profile $AWS_PROFILE \
  --query "Exports[?Name=='InstanceEndpoint'].Value"
fi
