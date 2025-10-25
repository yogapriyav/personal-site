variable "domain_name" {
    description = "Primary domain name"
    type = string
}

variable "project_name" {
    description = "Project name for tagging"
    type = string
}

variable "ec2_public_ip" {
    description = "EC2 instance public IP for DNS records"
    type = string
}