output "account_id" {
    description = "AWS account ID"
    value = data.aws_caller_identity.current.account_id
}

output "region" {
    description = "AWS region"
    value = var.aws_region
}

# DNS outputs
output "nameservers" {
    description = "Route 53 nameservers - update these in Porkbun"
    value = module.dns.nameservers
}

output "zone_id" {
    description = "Route 53 hosted zone ID"
    value = module.dns.zone_id
}

# Networking outputs
output "vpc_id" {
    description = "VPC ID"
    value = module.networking.vpc_id
}

output "public_subnet_ids" {
    description = "Public subnet IDs"
    value = module.networking.public_subnet_ids
}

# Compute outputs
output "ec2_instance_id" {
    description = "EC2 instance ID"
    value = module.compute.instance_id
}

output "ec2_public_ip" {
    description = "EC2 instance public IP"
    value = module.compute.instance_public_ip
}

output "ssh_command" {
    description = "SSH command to connect to instance"
    value = "ssh -i yogapriya-key ec2-user@${module.compute.instance_public_ip}"
}