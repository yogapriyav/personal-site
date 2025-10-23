variable project_name {
    description = "Project name for resource naming"
    type = string
}

variable "vpc_cidr" {
    description = "CIDR block for VPC"
    type = string
    default = "10.0.0.0/16"
}

variable "availability_zones" {
    description = "List of availability zones"
    type = list(string)
}

variable "public_subnet_cidrs" {
    description = "Public Subnet CIDRs"
    type = list(string)
    default = [ "10.0.1.0/24", "10.0.2.0/24" ]
}