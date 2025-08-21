terraform {
  backend "gcs" {
    bucket = "hermaeus-terraform-state"
    prefix = "terraform/state"
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
  project = var.project
  region  = var.region
  zone    = var.zone
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

resource "google_artifact_registry_repository" "artifact-repository" {
  location      = "us-central1"
  repository_id = "hermaeus-repository"
  description   = "Docker repository"
  format        = "DOCKER"
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
