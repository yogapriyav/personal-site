variable "project_name" {
    description = "Project name for resource naming"
    type = string
}

variable "vpc_id" {
    description = "VPC ID where the EC2 will be launched"
    type = string
}

variable "subnet_id" {
    description = "Subnet ID for the EC2 instance"
    type = string
}

variable "security_group_id" {
    description = "Security group ID for the EC2 instance"
    type = string
}

variable "instance_type" {
    description = "EC2 instance type"
    type = string
    default = "t3.small"
}

variable "key_name" {
    description = "SSH key pair name"
    type = string
}