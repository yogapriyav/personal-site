#!/bin/bash

set -e 

KUBECONFIG="~/.kube/config"
K3S_YAML="/etc/rancher/k3s/k3s.yaml"
HOST_IP=$(terraform output -raw ec2_public_ip)

echo "Fetching kubeconfig from EC2 at ${HOST_IP}"

# Fetch k3s.yaml
ssh -u StrictHostKeyChecking=no -i keys/yogapriya-key ec2-user@${HOST_IP} \
    "sudo cat ${K3S_YAML}" > /tmp/k3s-config.yaml

# Replace localhost IP with EC2 public IP
sed "s/127.0.0.1/${HOST_IP}/g" /tmp/k3s-config.yaml > ${KUBECONFIG}

# Set permissions
chmod 600 ${KUBECONFIG}

# Test
echo "Testing 'kubectl get nodes'"
kubectl get nodes

if [ $? -ne 0 ]; then 
    echo "Failed. Check the kube config manually"
fi

echo "kubectl is ready!"
