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