#!/bin/bash

echo "🧪 Testing DevOps Challenge App"
echo "================================"

# Test local Docker run
echo "🐳 Testing Docker container..."
docker run -d --name test-app -p 8080:8080 devops-challenge-app:dev

# Wait for container to start
sleep 3

# Test endpoints
echo "📡 Testing /health endpoint..."
curl -s http://localhost:8080/health | jq .

echo -e "\n📡 Testing /version endpoint..."
curl -s http://localhost:8080/version | jq .

echo -e "\n📡 Testing /echo endpoint..."
curl -s -X POST -H "Content-Type: application/json" -d '{"test": "data"}' http://localhost:8080/echo | jq .

echo -e "\n📊 Testing /metrics endpoint..."
curl -s http://localhost:8080/metrics | head -5

# Cleanup
echo -e "\n🧹 Cleaning up..."
docker stop test-app
docker rm test-app

echo -e "\n✅ Local Docker test completed!"
echo -e "\n🚀 To deploy to Kubernetes, run:"
echo "   make k8s-deploy"
echo "   make k8s-port-forward"
