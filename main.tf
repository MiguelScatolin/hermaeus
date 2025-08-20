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
  }
}

provider "google" {
  project      = "hermaeus-466914"
  region       = "us-central1"
  zone         = "us-central1-c"
  access_token = data.google_service_account_access_token.default.access_token
}

resource "google_compute_network" "vpc_network" {
  name = "terraform-network"
}