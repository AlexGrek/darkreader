.PHONY: docker-build
docker-build:
	chmod +x ./server
	docker build -t darkreader-srv .

.PHONY: docker-run
docker-run:
	mkdir -p $(shell pwd)/secrets
	docker run -d -u $(shell id -u):$(shell id -g) -e USER=$(shell id -un) -v $(shell pwd)/secrets:/secrets -v $(shell pwd)/demotexts:/data -p 6969:6969 --name "darkreader" darkreader-srv

.PHONY: docker-run-debug
docker-run-debug:
	docker run -it --rm -u $(id -u):$(id -g) -v $(shell pwd)/secrets:/secrets -v $(shell pwd)/demotexts:/data -p 6969:6969 --name "darkreader" --entrypoint /bin/sh darkreader-srv

.PHONY: docker-kill
docker-kill:
	docker rm -f "darkreader"

.PHONY: re-docker
re-docker: docker-kill docker-build docker-run
	sleep 3s && docker logs darkreader

unpack:
	unzip -o release.zip

clean:
	@rm -vrf Dockerfile server server.exe static
	
update: clean unpack re-docker


.PHONY: unpack update clean