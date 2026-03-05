.PHONY: docker-build docker-push all deploy-service redeploy helm-deploy helm-upgrade download-backup restore-backup

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

helm-deploy:
	helm install $(HELM_RELEASE) $(HELM_CHART) \
		--namespace $(NAMESPACE) \
		--create-namespace \
		--set image.tag=$(GIT_HASH)

helm-upgrade:
	helm upgrade $(HELM_RELEASE) $(HELM_CHART) \
		--namespace $(NAMESPACE) \
		--set image.tag=$(GIT_HASH)

redeploy: all
	kubectl delete pod -n $(NAMESPACE) -l app=darkreader

download-backup:
	./helm/download-backup.sh --namespace $(NAMESPACE) $(if $(LATEST),--latest,) $(if $(FILE),--file $(FILE),) $(if $(OUTPUT),--output $(OUTPUT),)

restore-backup:
	@test -n "$(FILE)" || (echo "Error: FILE is required. Usage: make restore-backup FILE=path/to/backup.tar.gz"; exit 1)
	./helm/upload-backup.sh --namespace $(NAMESPACE) $(if $(REPLICAS),--replicas $(REPLICAS),) $(if $(YES),--yes,) $(FILE)

deploy-service:
	kubectl --namespace $(NAMESPACE) apply -f k8s-deploy/k3s-deployment.yaml
	kubectl --namespace $(NAMESPACE) apply -f k8s-deploy/traefik-ingressroute.yaml