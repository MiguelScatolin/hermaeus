#!/bin/bash
set -e

PROJECT_ID="hermaeus-466914"
IMAGE_NAME="fastify-hello-world"
REGION="us-central1"

echo "Building Docker image..."
cd backend
docker build -t gcr.io/$PROJECT_ID/$IMAGE_NAME .

echo "Pushing to Container Registry..."
docker push gcr.io/$PROJECT_ID/$IMAGE_NAME

echo "Deploying with Terraform..."
cd ..
terraform init
terraform plan
terraform apply -auto-approve

echo "Deployment complete!"
echo "Service URL: $(terraform output -raw service_url)"
