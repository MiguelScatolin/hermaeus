variable "terraform_service_account" {
  type        = string
  description = "email adress of the service account used for terraform"

}

variable "project" {
  type        = string
  description = "ID of the project in scope"
}

variable "region" {
  default = "us-central1"
}

variable "zone" {
  default = "us-central1-a"
}