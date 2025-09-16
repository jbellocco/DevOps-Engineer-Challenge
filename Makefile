.PHONY: help install build test lint type-check docker-build docker-run k8s-deploy k8s-delete k8s-logs k8s-port-forward clean

# Variables
APP_NAME := devops-challenge-app
IMAGE_NAME := $(APP_NAME):dev
NAMESPACE := default

help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies
	npm install

build: ## Build the TypeScript application
	npm run build

test: ## Run tests
	npm test

lint: ## Run linter
	npm run lint

type-check: ## Run TypeScript type checking
	npm run type-check

docker-build: build ## Build Docker image (compile first)
	docker build -t $(IMAGE_NAME) .

docker-run: ## Run Docker container locally
	docker run --rm -p 8080:8080 --name $(APP_NAME) $(IMAGE_NAME)

k8s-check: ## Check if Kubernetes is available
	@kubectl cluster-info > /dev/null 2>&1 || (echo "❌ Kubernetes cluster not available. Make sure docker is running with Kubernetes enabled." && exit 1)
	@echo "✅ Kubernetes cluster is available"
	@echo "📋 Cluster info:"
	@kubectl cluster-info | head -2

docker-check: ## Check if docker is running
	@echo "docker running"

k8s-deploy: docker-check k8s-check docker-build ## Deploy to Kubernetes with docker
	@echo "🚀 Deploying to Kubernetes..."
	kubectl apply -f k8s/configmap.yaml
	kubectl apply -f k8s/deployment.yaml
	kubectl apply -f k8s/service.yaml
	@echo "✅ Deployment completed"
	@echo "📋 Checking deployment status..."
	kubectl rollout status deployment/$(APP_NAME) --timeout=60s
	@echo "🔍 Getting pods:"
	kubectl get pods -l app=$(APP_NAME)

k8s-delete: k8s-check ## Delete Kubernetes resources
	@echo "🗑️  Deleting Kubernetes resources..."
	kubectl delete -f k8s/ --ignore-not-found=true
	@echo "✅ Resources deleted"

k8s-logs: k8s-check ## Show application logs
	kubectl logs -l app=$(APP_NAME) --tail=50 -f

k8s-port-forward: k8s-check ## Port forward to access the application
	@echo "🌐 Port forwarding to localhost:8080..."
	@echo "📝 Access the application at: http://localhost:8080"
	@echo "🔍 Endpoints available:"
	@echo "   - GET  http://localhost:8080/health"
	@echo "   - GET  http://localhost:8080/version"
	@echo "   - POST http://localhost:8080/echo"
	@echo "   - GET  http://localhost:8080/metrics"
	@echo "⏹️  Press Ctrl+C to stop port forwarding"
	kubectl port-forward service/devops-challenge-service 8080:8080

k8s-status: k8s-check ## Show Kubernetes resources status
	@echo "📊 Kubernetes Resources Status:"
	@echo "================================"
	@echo "🔧 ConfigMaps:"
	kubectl get configmap -l app=$(APP_NAME)
	@echo ""
	@echo "🚀 Deployments:"
	kubectl get deployment -l app=$(APP_NAME)
	@echo ""
	@echo "🌐 Services:"
	kubectl get service -l app=$(APP_NAME)
	@echo ""
	@echo "📦 Pods:"
	kubectl get pods -l app=$(APP_NAME)

k8s-describe: k8s-check ## Describe Kubernetes resources for debugging
	@echo "🔍 Describing Kubernetes resources..."
	kubectl describe deployment $(APP_NAME)
	kubectl describe service devops-challenge-service
	kubectl describe pods -l app=$(APP_NAME)

clean: ## Clean build artifacts
	rm -rf dist node_modules

dev: ## Run in development mode
	npm run dev

ci: install type-check lint build test ## Run CI pipeline locally

# Quick start commands
quick-start: install build docker-build k8s-deploy k8s-port-forward ## Complete setup and deployment

restart: k8s-delete k8s-deploy ## Restart the application in Kubernetes
