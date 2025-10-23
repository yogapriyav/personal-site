resource "aws_key_pair" "main" {
    key_name = "${var.project_name}-key"
    public_key = file("${path.module}/keys/yogapriya-key.pub")

    tags = {
      Name = "${var.project_name}-key"
    }
}