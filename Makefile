.PHONY: docker-build docker-push all deploy-service redeploy helm-deploy helm-upgrade

NAME?=darkreader
GIT_HASH?=$(shell git rev-parse --short HEAD)
IMAGE_NAME?=grekodocker/$(NAME):$(GIT_HASH)
NAMESPACE?=default
HELM_RELEASE?=darkreader
HELM_CHART?=./helm/darkreader

docker-build:
	docker buildx build --platform linux/arm64,linux/amd64 -t $(IMAGE_NAME) --push .

docker-push:
	@echo "Push is included in docker-build step"

all: docker-build

helm-deploy: docker-build
	helm install $(HELM_RELEASE) $(HELM_CHART) \
		--namespace $(NAMESPACE) \
		--create-namespace \
		--set image.tag=$(GIT_HASH)

helm-upgrade: docker-build
	helm upgrade $(HELM_RELEASE) $(HELM_CHART) \
		--namespace $(NAMESPACE) \
		--set image.tag=$(GIT_HASH)

redeploy: all
	kubectl delete pod -n $(NAMESPACE) -l app=darkreader

deploy-service:
	kubectl --namespace $(NAMESPACE) apply -f k8s-deploy/k3s-deployment.yaml
	kubectl --namespace $(NAMESPACE) apply -f k8s-deploy/traefik-ingressroute.yaml