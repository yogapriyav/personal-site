# Update k3s certificate with EIP after both resources exist

resource "null_resource" "update_k3s_cert" {
    # Trigger whenever EC2 or EIP changes
    triggers = {
      instance_id = module.compute.instance_id
      eip = module.compute.instance_public_ip
    }

    # Wait for k3s to be fully ready
    provisioner "local-exec" {
        command = "sleep 45"
    }

    # Update k3s certificate with EIP
    provisioner "remote-exec" {
        connection {
          type = "ssh"
          user = "ec2-user"
          private_key = file("${path.module}/keys/yogapriya-key")
          host = module.compute.instance_public_ip
        }

        inline = [ 
            "set -e",
            "echo 'Waiting for cloud-init (user_data) to complete...'",
            "sudo cloud-init status --wait",
            "echo 'Cloud-init complete! Checking k3s...'",
            "echo 'Reinstalling k3s with TLS SAN'",
            "curl -sfL https://get.k3s.io | INSTALL_K3S_EXEC='--kube-apiserver-arg service-node-port-range=80-32767 --tls-san ${module.compute.instance_public_ip}' sh -",
            "sleep 15",
            "sudo systemctl is-active k3s && echo 'k3s running with custom port range!'",
            "echo 'k3s configured for ${module.compute.instance_public_ip}'"
         ]
    }
    
    provisioner "local-exec" {
        command = <<-EOF
            echo "Downloading kubeconfig from ${module.compute.instance_public_ip}"

            # Wait a bit more for k3s restart to complete
            sleep 15

            # Fetch kubeconfig
            ssh -o StrictHostKeyChecking=no \
                -i ${path.module}/keys/yogapriya-key \
                ec2-user@${module.compute.instance_public_ip} \
                "sudo cat /etc/rancher/k3s/k3s.yaml" > /tmp/k3s-config.yaml > /tmp/k3s-config.yaml

            # Replace localhost IP with actual IP
            sed 's/127.0.0.1/${module.compute.instance_public_ip}/g' /tmp/k3s-config.yaml > ~/.kube/config

            # Set permissions
            chmod 600 ~/.kube/config

            echo "Kubeconfig updated at ~/.kube/config"

            # Test connection
            kubectl get nodes || echo "Error: kubectl test failed, but kubeconfig is downloaded at /tmp/k3s-config.yaml"
        EOF
    }

    provisioner "local-exec" {
        command =  <<-EOF
            echo "Waiting for k3s to be fully ready..."
            sleep 20

            echo "Configuring Traefik to use NodePort 80"
            kubectl patch svc traefik -n kube-system --patch-file ${path.module}/traefik-nodeport-config.yaml

            echo "Traefik configured on port 80!"
            kubectl get svc -n kube-system traefik

            echo "Deploying application..."
            kubectl apply -f ${path.module}/../kubernetes/base/deployment.yaml
            kubectl apply -f ${path.module}/../kubernetes/base/service.yaml

            echo "Installing cert-manager..."
            kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.2/cert-manager.yaml
            
            echo "Waiting for cert-manager to be ready..."
            kubectl wait --for=condition=ready pod -l app.kubernetes.io/instance=cert-manager -n cert-manager --timeout=300s

            echo "Waiting additional time for webhook to initialize..."
            sleep 30ß
            
            echo "Fixing CoreDNS to use external DNS..."
            kubectl get configmap coredns -n kube-system -o yaml | \
                sed 's|forward . /etc/resolv.conf|forward . 8.8.8.8 1.1.1.1|' | \
                kubectl apply -f -

            kubectl rollout restart deployment coredns -n kube-system

            echo "Applying ClusterIssuer and Ingress..."
            kubectl apply -f ${path.module}/../kubernetes/base/letsencrypt-issuer.yaml
            kubectl apply -f ${path.module}/../kubernetes/base/ingress.yaml

            echo "Setup complete!"

        EOF
    }

    # Only run after compute module is complete
    depends_on = [ module.compute ]
}