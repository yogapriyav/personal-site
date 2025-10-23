output "instance_id" {
    description = "EC2 instance ID"
    value = aws_instance.web.id
}

output "instance_public_ip" {
    description = "EC2 instance public IP"
    value = aws_eip.web.public_ip
}

output "instance_private_ip" {
    description = "EC2 instance private IP"
    value = aws_instance.web.private_ip
}

output "instance_public_dns" {
    description = "EC2 instance public DNS"
    value = aws_instance.web.public_dns
  
}