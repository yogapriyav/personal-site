# Budget Alerting

AWS Budget alerts to prevent runaway costs.

**Status:** Active - Budget set at $5/month with email alerts

## Overview

This was a one-time setup to monitor AWS spending across all regions and services.

**Alert thresholds:**
- **80% actual** ($4) - Warning that budget is approaching
- **100% forecasted** ($5) - Predicted to exceed budget based on current spending

---

## Setup (One-time)

### 1. Create SNS topic for billing alerts
```bash
aws sns create-topic --name billing-alerts --region us-east-1
```
> **Note:** AWS Budgets must be in `us-east-1` (global service requirement)

### 2. Subscribe email for notifications
```bash
aws sns subscribe \
  --topic-arn arn:aws:sns:us-east-1:$(aws sts get-caller-identity --query Account --output text):billing-alerts \
  --protocol email \
  --notification-endpoint yogapriya.veturi@gmail.com \
  --region us-east-1
```
> **Important:** Click the confirmation link in the email to activate alerts.

### 3. Create budget with notifications
```bash
aws budgets create-budget \
  --account-id $(aws sts get-caller-identity --query Account --output text) \
  --budget file://budget.json \
  --notifications-with-subscribers file://notifications.json
```

### 4. Verify setup
```bash
aws budgets describe-budgets \
  --account-id $(aws sts get-caller-identity --query Account --output text)
```

---

## Files

- `budget.json` - Budget configuration ($5/month limit)
- `notifications.json` - Alert thresholds and email subscriptions

---

## Maintenance

**This budget runs automatically and requires no maintenance.**

To modify the budget amount or alert thresholds:
1. Update `budget.json` or `notifications.json`
2. Delete existing budget: `aws budgets delete-budget --account-id <account-id> --budget-name MonthlyBudget`
3. Recreate with updated configuration

---

## What's Monitored

- All AWS regions (including us-east-2 where main infrastructure lives)
- All services (EC2, S3, Route53, DynamoDB, data transfer, etc.)
- Taxes and fees
- Daily spending checks with monthly resets
