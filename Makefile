.PHONY: docker-build docker-push all deploy-service redeploy

NAME?=darkreader
GIT_HASH?=$(shell git rev-parse --short HEAD)
IMAGE_NAME?=grekodocker/$(NAME):$(GIT_HASH)
NAMESPACE?=default

docker-build:
	docker buildx build --platform linux/arm64,linux/amd64 -t $(IMAGE_NAME) --push .

docker-push:
	@echo "Push is included in docker-build step"

all: docker-build

redeploy: all
	kubectl delete pod -n $(NAMESPACE) -l app=darkreader

deploy-service:
	kubectl --namespace $(NAMESPACE) apply -f k8s-deploy/k3s-deployment.yaml
	kubectl --namespace $(NAMESPACE) apply -f k8s-deploy/traefik-ingressroute.yaml