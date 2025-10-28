# Route 53 Hosted Zone
data "aws_route53_zone" "main" {
    name = var.domain_name
    private_zone = false
    # comment = "Managed by Terraform - ${var.project_name}"

    tags = {
        Name = var.domain_name
    }
}

# A record - point root domain to EC2
resource "aws_route53_record" "root" {
    zone_id = data.aws_route53_zone.main.zone_id
    name = var.domain_name
    type = "A"
    ttl = 300
    records = [var.ec2_public_ip]
}

# A record - point www to EC2
resource "aws_route53_record" "www" {
    zone_id = data.aws_route53_zone.main.zone_id
    name = "www.${var.domain_name}"
    type = "A"
    ttl = 300
    records = [var.ec2_public_ip]
}