.PHONY: docker-build docker-push all deploy-service redeploy

NAME?=darkreader
IMAGE_NAME?=localhost:5000/$(NAME)
NAMESPACE?=default

docker-build:
	docker build . -t $(IMAGE_NAME)

docker-push:
	docker push $(IMAGE_NAME)

all: docker-build docker-push

redeploy: all
	kubectl delete pod -n $(NAMESPACE) -l app=darkreader

deploy-service:
	kubectl --namespace $(NAMESPACE) apply -f k8s-deploy/k3s-deployment.yaml
	kubectl --namespace $(NAMESPACE) apply -f k8s-deploy/traefik-ingressroute.yaml