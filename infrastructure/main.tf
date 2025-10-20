terraform {
    required_version = ">= 1.0"

    required_providers {
        aws = {
            source = "hashicorp/aws"
            version = "~> 5.0"
        }
    }
}

provider "aws" {
    region = var.aws_region

    default_tags {
        tags = {
            Project = "Personal Site"
            ManagedBy = "Terraform"
            Owner = "Yogapriya Veturi"
            Environment = var.environment
        }
    }
}

# DNS Module
module "dns" {
    source = "./modules/dns"
    domain_name = var.domain_name
    project_name = var.project_name
}