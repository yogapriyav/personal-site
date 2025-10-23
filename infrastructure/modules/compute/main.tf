# Get the latest amazon linux 2023 AMI
data "aws_ami" "amazon_linux" {
    most_recent = true
    owners = ["amazon"]

    filter {
      name = "virtualization-type"
      values = ["hvm"]
    }  
}

# EC2 instance
resource "aws_instance" "web" {
    ami = data.aws_ami.amazon_linux.id
    instance_type = var.instance_type
    subnet_id = var.subnet_id
    vpc_security_group_ids = [var.security_group_id]
    key_name = var.key_name

    # Enable detailed monitoring (free tier eligible)
    monitoring = true

    # Root volume
    root_block_device {
        volume_size = 20 # GB (free tier allows 30GB)
        volume_type = "gp3"
        delete_on_termination = true
        encrypted = true
    }

    # User data script to set hostname
    user_data = <<-EOF
                #!/bin/bash
                hostnamectl set-hostname ${var.project_name}-server
                EOF

    tags = {
        Name = "${var.project_name}-server"
    }

    # Prevent accidental termination
    lifecycle {
        prevent_destroy = false # Set to true in production
    }
}

# Elastic IP for stable public IP
resource "aws_eip" "web" {
    instance = aws_instance.web.id
    domain = "vpc"

    tags = {
      Name = "${var.project_name}-eip"
    }

    # Ensure instance is created first
    depends_on = [ aws_instance.web ]
}