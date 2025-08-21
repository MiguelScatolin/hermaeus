provider "google" {
  alias = "impersonation"
  scopes = [
    "https://www.googleapis.com/auth/cloud-platform",
    "https://www.googleapis.com/auth/userinfo.email",
  ]
}

#receive short-lived access token
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

    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0.1"
    }
  }
}

provider "google" {
  project      = var.project
  region       = var.region
  zone         = var.zone
  access_token = data.google_service_account_access_token.default.access_token
}

provider "docker" {}


resource "docker_image" "api_image" {
  name = "hermaeus-api-image:latest"
  build {
    context = "./backend"
  }
}

resource "docker_container" "api_container" {
  name  = "hermaeus-container"
  image = docker_image.api_image.name
  ports {
    internal = 5000 # Port exposed by your API in the Dockerfile
    external = 8080 # Port to map on the host machine
  }
}

resource "google_compute_network" "vpc_network" {
  name = "terraform-network"
}

resource "google_compute_instance" "vm_instance" {
  name         = "terraform-instance"
  machine_type = "f1-micro"
  tags         = ["web", "dev"]

  boot_disk {
    initialize_params {
      image = "cos-cloud/cos-stable"
    }
  }

  network_interface {
    network = google_compute_network.vpc_network.name
    access_config {
    }
  }
}
