output "vpc_id" {
    description = "VPC ID"
    value = aws_vpc.main.id
}

output "public_subnet_ids" {
    description = "Public subnet IDs"
    value = aws_subnet.public[*].id
}

output "security_group_id" {
    description = "Security group ID for web servers"
    value = aws_security_group.web.id
}