provider "google" {
  alias = "impersonation"
  scopes = [
    "https://www.googleapis.com/auth/cloud-platform",
    "https://www.googleapis.com/auth/userinfo.email",
  ]
}

# Receive short-lived access token
data "google_service_account_access_token" "default" {
  provider               = google.impersonation
  target_service_account = var.terraform_service_account
  scopes                 = ["cloud-platform", "userinfo-email"]
  lifetime               = "3600s"
}

terraform {
  backend "gcs" {
    bucket                      = "hermaeus-terraform-state"
    prefix                      = "terraform/state"
    impersonate_service_account = "terraform@hermaeus-466914.iam.gserviceaccount.com"
  }

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "6.8.0"
    }
  }
}

provider "google" {
  project      = var.project_id
  region       = "us-central1"
  zone         = "us-central1-c"
  access_token = data.google_service_account_access_token.default.access_token
}

# VPC Network
resource "google_compute_network" "vpc_network" {
  name                    = "fastify-vpc"
  auto_create_subnetworks = false
}

# Subnet
resource "google_compute_subnetwork" "subnet" {
  name          = "fastify-subnet"
  ip_cidr_range = "10.0.0.0/24"
  network       = google_compute_network.vpc_network.id
  region        = "us-central1"
}

# Firewall rule to allow HTTP traffic
resource "google_compute_firewall" "allow_http" {
  name    = "allow-http"
  network = google_compute_network.vpc_network.id

  allow {
    protocol = "tcp"
    ports    = ["80", "443", "3000"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["http-server"]
}

# Container Registry
resource "google_container_registry" "registry" {
  project = var.project_id
}

# Cloud Run service
resource "google_cloud_run_service" "fastify_service" {
  name     = "fastify-hello-world"
  location = "us-central1"

  template {
    spec {
      containers {
        image = "gcr.io/${var.project_id}/fastify-hello-world:latest"
        
        ports {
          container_port = 3000
        }

        resources {
          limits = {
            cpu    = "1000m"
            memory = "512Mi"
          }
        }
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
}

# IAM policy to allow unauthenticated access
resource "google_cloud_run_service_iam_member" "public_access" {
  location = google_cloud_run_service.fastify_service.location
  service  = google_cloud_run_service.fastify_service.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# Output the service URL
output "service_url" {
  value = google_cloud_run_service.fastify_service.status[0].url
}