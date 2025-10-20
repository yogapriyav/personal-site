variable "aws_region" {
    description = "AWS region"
    type = string
    default = "us-east-2"
}

variable "environment" {
    description = "Environment name"
    type = string
    default = "production"
}

variable "domain_name" {
    description = "Primary domain name"
    type = string
    default = "yogapriyaveturi.com"
}

variable "project_name" {
    description = "Project name for resource naming"
    type = string
    default = "yogapriya-site"
}