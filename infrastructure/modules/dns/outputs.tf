output "zone_id" {
    description = "Route 53 zone ID"
    value = data.aws_route53_zone.main.zone_id
}

output "nameservers" {
    description = "Route 53 nameservers"
    value = data.aws_route53_zone.main.name_servers
}