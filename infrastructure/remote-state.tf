terraform {
  backend "s3" {
    bucket         = "yogapriya-terraform-state"
    key            = "personal-site/terraform.tfstate"
    region         = "us-east-2"
    dynamodb_table = "terraform-state-lock"
    encrypt        = true
  }
}