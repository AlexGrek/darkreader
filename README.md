# darkreader

![logo](frontend/public/logo_small.jpg)

Simple SPA server for hosting text stories (in .txt files) and managing access using random passwords (no login).

## Development

### backend

Run backend:

`go run ./src`

If you want to use `secret` as your text directory, and you are on PowerShell and Windows like me:

`$env:TEXT_PATH = 'secret'; go run ./src`

Build binary:

`go build ./src`

### frontend

App uses Vite + React + Typescript for frontend

Run Vite dev server:

```sh
cd frontend
npm run dev
```

Frontend server uses proxy for API requests, so backend should be running and listening on port `6969`

# Deploy

Deployment uses Helm charts with Kubernetes. The application is containerized with Docker and deployed to a Kubernetes cluster.

## Prerequisites

- Docker with buildx support (for multi-architecture builds)
- Kubernetes cluster with Helm 3+
- cert-manager (for TLS certificates)
- Traefik ingress controller

## Build and Push Docker Image

The application is built for both ARM64 and x86-64 architectures and pushed to `grekodocker/darkreader`:

```bash
make docker-build
```

This builds the image with a git commit hash tag and pushes it to the registry.

## Deploy with Helm

### Initial Deployment

To deploy the application to your Kubernetes cluster:

```bash
make helm-deploy
```

This installs the Helm release with the current git commit hash as the image tag. Default namespace is `default`; to use a different namespace:

```bash
make helm-deploy NAMESPACE=myapp
```

### Upgrade Existing Deployment

To upgrade an existing deployment to a new image:

```bash
# First, build and push a new image
make docker-build

# Then upgrade the Helm release
make helm-upgrade
```

Or specify a custom git hash:

```bash
make helm-upgrade GIT_HASH=abc1234
```

## Configuration

The Helm chart configuration is in `helm/darkreader/values.yaml`:

- **Image**: `grekodocker/darkreader` with dynamic git hash tag
- **Hostname**: `dr.alexgr.space` with automatic Let's Encrypt TLS
- **Storage**: 1Gi PVC provisioned by the default StorageClass (set `storage.storageClass` to override)
- **Resources**: 500m CPU / 512Mi memory limits

Edit the values file to customize replica count, resource limits, storage size, and environment variables.

## Backup and Restore

The application is deployed as a StatefulSet with its data on a dedicated PVC (`darkreader-storage-darkreader-0`). A Kubernetes CronJob runs every Sunday at midnight and writes compressed archives to a separate backup PVC (`darkreader-backup-storage`), retaining the 8 most recent snapshots (~2 months).

### Download a backup

```bash
# Interactive — lists available archives and prompts for selection
make download-backup

# Download the latest backup automatically
make download-backup LATEST=1

# Download a specific archive to a local directory
make download-backup FILE=darkreader-2026-03-01_00-00-00.tar.gz OUTPUT=~/backups

# Different namespace
make download-backup NAMESPACE=production
```

Or call the script directly:

```bash
./helm/download-backup.sh [--namespace NS] [--output DIR] [--file NAME | --latest]
```

### Restore a backup

> **Warning:** Restore overwrites all data in the live PVC. The StatefulSet is scaled to 0 during the operation and brought back up automatically when it finishes (or if it fails/is interrupted).

```bash
# Restore from a local archive (prompts for confirmation)
make restore-backup FILE=darkreader-2026-03-01_00-00-00.tar.gz

# Skip the confirmation prompt (useful in scripts)
make restore-backup FILE=backup.tar.gz YES=1

# Restore in a different namespace, bring up a specific replica count
make restore-backup FILE=backup.tar.gz NAMESPACE=production REPLICAS=2
```

Or call the script directly:

```bash
./helm/upload-backup.sh [--namespace NS] [--replicas N] [--yes] <backup-file.tar.gz>
```

The restore sequence is:
1. Scale StatefulSet to 0, wait for all pods to terminate
2. Spin up a temporary pod with read-write access to the data PVC
3. Upload the local archive and extract it into the volume
4. Remove the temporary pod
5. Scale the StatefulSet back to its previous replica count and wait for rollout
