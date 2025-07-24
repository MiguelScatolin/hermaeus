terraform {
  cloud {
    organization = "scatolin-software"
    workspaces {
      name = "learn-terraform-migrate"
    }
  }

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "6.8.0"
    }
  }
}

provider "google" {
  project = "hermaeus-466914"
  region  = "us-central1"
  zone    = "us-central1-c"
  credentials = "./keys.json"
}

resource "google_compute_network" "vpc_network" {
  name = "terraform-network"
}





