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

                # Create swap file (2GB)
                dd if=/dev/zero of=/swapfile bs=1M count=2048
                chmod 600 /swapfile
                mkswap /swapfile
                swapon /swapfile
                echo '/swapfile none swap sw 0 0' >> /etc/fstab

                # Install k3s with public IP in cert
                curl -sfL https://get.k3s.io | INSTALL_K3S_EXEC='--kube-apiserver-arg service-node-port-range=80-32767 sh -

                # Wait for k3s to be ready
                sleep 10

                # Make kubeconfig readable
                chmod 644 /etc/rancher/k3s/k3s.yaml

                # Set KUBECONFIG for all users
                echo 'export KUBECONFIG=/etc/rancher/k3s/k3s.yaml' >> /etc/profile.d/k3s.sh

                # Set for ec2-user specifically
                echo 'export KUBECONFIG=/etc/rancher/k3s/k3s.yaml' >> /home/ec2-user/.bashrc
                chown ec2-user:ec2-user /home/ec2-user/.bashrc

                EOF

    tags = {
        Name = "${var.project_name}-server"
    }

    # Prevent accidental termination
    lifecycle {
        prevent_destroy = false # Set to true in production
        ignore_changes = [ ami ]
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