output "zone_id" {
    description = "Route 53 zone ID"
    value = aws_route53_zone.main.zone_id
}

output "nameservers" {
    description = "Route 53 nameservers"
    value = aws_route53_zone.main.name_servers
}