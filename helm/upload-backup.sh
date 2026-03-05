#!/bin/bash
# Restores a backup archive into the darkreader data PVC.
#
# The StatefulSet is scaled to 0 before the restore and brought back up
# afterwards (or on any error/interrupt).
#
# Usage:
#   ./upload-backup.sh [OPTIONS] <backup-file.tar.gz>
#
# Options:
#   -n, --namespace NS    Kubernetes namespace (default: darkreader)
#   -r, --replicas N      Replicas to restore to after the restore (default: auto-detect)
#   -y, --yes             Skip confirmation prompt
#   -h, --help            Show this help message

set -euo pipefail

NAMESPACE="darkreader"
STATEFULSET_NAME="darkreader"
RESTORE_REPLICAS=""   # auto-detect from current spec
SKIP_CONFIRM=false
BACKUP_FILE=""
POD_NAME="darkreader-restore-$$"
DATA_PVC="darkreader-storage-darkreader-0"
ORIGINAL_REPLICAS=0

usage() {
  grep '^#' "$0" | sed 's/^# \{0,1\}//'
  exit 0
}

scale_up() {
  local target="${RESTORE_REPLICAS:-${ORIGINAL_REPLICAS}}"
  if [[ "${target}" -gt 0 ]]; then
    echo ""
    echo "==> Scaling ${STATEFULSET_NAME} back to ${target} replica(s) ..."
    kubectl scale statefulset "${STATEFULSET_NAME}" \
      --namespace="${NAMESPACE}" \
      --replicas="${target}"
    echo "==> Waiting for StatefulSet to be ready ..."
    kubectl rollout status statefulset "${STATEFULSET_NAME}" \
      --namespace="${NAMESPACE}" \
      --timeout=120s
    echo "==> ${STATEFULSET_NAME} is back online."
  fi
}

cleanup() {
  echo ""
  echo "==> Removing temporary pod ${POD_NAME} ..."
  kubectl delete pod "${POD_NAME}" -n "${NAMESPACE}" --ignore-not-found --wait=false 2>/dev/null || true
  scale_up
}

# ── Argument parsing ───────────────────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case "$1" in
    -n|--namespace) NAMESPACE="$2"; shift 2 ;;
    -r|--replicas)  RESTORE_REPLICAS="$2"; shift 2 ;;
    -y|--yes)       SKIP_CONFIRM=true; shift ;;
    -h|--help)      usage ;;
    -*)             echo "Unknown option: $1"; usage ;;
    *)              BACKUP_FILE="$1"; shift ;;
  esac
done

if [[ -z "${BACKUP_FILE}" ]]; then
  echo "Error: no backup file specified." >&2
  echo "Usage: $0 [OPTIONS] <backup-file.tar.gz>" >&2
  exit 1
fi

if [[ ! -f "${BACKUP_FILE}" ]]; then
  echo "Error: file not found: ${BACKUP_FILE}" >&2
  exit 1
fi

BASENAME=$(basename "${BACKUP_FILE}")
FILE_SIZE=$(du -sh "${BACKUP_FILE}" | cut -f1)

# ── Confirm ────────────────────────────────────────────────────────────────────
echo "================================================================"
echo "  RESTORE SUMMARY"
echo "================================================================"
echo "  Archive   : ${BACKUP_FILE} (${FILE_SIZE})"
echo "  Namespace : ${NAMESPACE}"
echo "  Target PVC: ${DATA_PVC}"
echo "  StatefulSet will be scaled to 0 during restore."
echo "================================================================"
echo ""
echo "WARNING: This will OVERWRITE all current data in the PVC."
echo ""

if [[ "${SKIP_CONFIRM}" == false ]]; then
  read -rp "Type 'yes' to continue: " CONFIRM
  if [[ "${CONFIRM}" != "yes" ]]; then
    echo "Aborted."
    exit 0
  fi
fi

# ── Auto-detect current replica count ─────────────────────────────────────────
ORIGINAL_REPLICAS=$(kubectl get statefulset "${STATEFULSET_NAME}" \
  --namespace="${NAMESPACE}" \
  -o jsonpath='{.spec.replicas}' 2>/dev/null || echo "1")

if [[ -z "${RESTORE_REPLICAS}" ]]; then
  RESTORE_REPLICAS="${ORIGINAL_REPLICAS}"
fi

echo ""
echo "==> Detected ${ORIGINAL_REPLICAS} running replica(s). Will restore to ${RESTORE_REPLICAS}."

# ── Scale down ────────────────────────────────────────────────────────────────
echo "==> Scaling ${STATEFULSET_NAME} down to 0 ..."
kubectl scale statefulset "${STATEFULSET_NAME}" \
  --namespace="${NAMESPACE}" \
  --replicas=0

echo "==> Waiting for all pods to terminate ..."
kubectl wait pod \
  --namespace="${NAMESPACE}" \
  --selector="app=${STATEFULSET_NAME}" \
  --for=delete \
  --timeout=120s 2>/dev/null || true

# cleanup handles scale-up on any exit (including errors and Ctrl-C) from here on
trap cleanup EXIT

# ── Spin up temporary restore pod ─────────────────────────────────────────────
echo "==> Launching temporary restore pod ${POD_NAME} ..."
kubectl run "${POD_NAME}" \
  --image=busybox:1.36 \
  --restart=Never \
  --namespace="${NAMESPACE}" \
  --overrides="{
    \"spec\": {
      \"containers\": [{
        \"name\": \"restore\",
        \"image\": \"busybox:1.36\",
        \"command\": [\"sh\", \"-c\", \"sleep 3600\"],
        \"volumeMounts\": [{
          \"name\": \"data\",
          \"mountPath\": \"/data\"
        }]
      }],
      \"volumes\": [{
        \"name\": \"data\",
        \"persistentVolumeClaim\": {
          \"claimName\": \"${DATA_PVC}\"
        }
      }]
    }
  }"

echo "==> Waiting for pod to be ready ..."
kubectl wait pod "${POD_NAME}" \
  --namespace="${NAMESPACE}" \
  --for=condition=Ready \
  --timeout=60s

# ── Upload and extract ─────────────────────────────────────────────────────────
echo "==> Uploading ${BASENAME} to pod ..."
kubectl cp "${BACKUP_FILE}" "${NAMESPACE}/${POD_NAME}:/tmp/${BASENAME}"

echo "==> Clearing existing data ..."
kubectl exec "${POD_NAME}" -n "${NAMESPACE}" -- \
  sh -c 'find /data -mindepth 1 -delete'

echo "==> Extracting archive ..."
kubectl exec "${POD_NAME}" -n "${NAMESPACE}" -- \
  tar -xzf "/tmp/${BASENAME}" -C /data

echo "==> Cleaning up archive from pod ..."
kubectl exec "${POD_NAME}" -n "${NAMESPACE}" -- rm "/tmp/${BASENAME}"

echo ""
echo "==> Restore complete. Data volume contents:"
kubectl exec "${POD_NAME}" -n "${NAMESPACE}" -- \
  sh -c 'du -sh /data/* 2>/dev/null || echo "  (empty)"'

# cleanup (trap) removes the pod and scales back up
