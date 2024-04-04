.PHONY: docker-build
docker-build:
	chmod +x ./server
	docker build -t darkreader-srv .

.PHONY: docker-run
docker-run:
	docker run -d -u $(shell id -u):$(shell id -g) -e USER=$(shell id -un) -v ~/darkreader/demotexts:/data -p 6969:6969 --name "darkreader" darkreader-srv

.PHONY: docker-run-debug
docker-run-debug:
	docker run -it --rm -u $(id -u):$(id -g) -v ~/darkreader/demotexts:/data -p 6969:6969 --name "darkreader" --entrypoint /bin/sh darkreader-srv

.PHONY: docker-kill
docker-kill:
	docker rm -f "darkreader"

.PHONY: re-docker
re-docker: docker-kill docker-build docker-run
	sleep 3s && docker logs darkreader
