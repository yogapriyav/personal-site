terraform {
    required_version = ">= 1.0"

    required_providers {
        aws = {
            source = "hashicorp/aws"
            version = "~> 5.0"
        }
        null = {
            source = "hashicorp/null"
            version = "~> 3.0"
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

# Networking module
module "networking" {
    source = "./modules/networking"

    project_name = var.project_name
    availability_zones = data.aws_availability_zones.available.names
}

# Compute module
module "compute" {
    source = "./modules/compute"

    project_name = var.project_name
    vpc_id = module.networking.vpc_id
    subnet_id = module.networking.public_subnet_ids[0]
    security_group_id = module.networking.security_group_id
    key_name = aws_key_pair.main.key_name
    instance_type = "t3.micro"
}

# DNS module
module "dns" {
    source = "./modules/dns"
    domain_name = var.domain_name
    project_name = var.project_name
    ec2_public_ip = module.compute.instance_public_ip
}
