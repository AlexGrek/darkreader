#!/bin/bash
# Downloads a backup archive from the darkreader backup PVC.
#
# Usage:
#   ./download-backup.sh [OPTIONS]
#
# Options:
#   -n, --namespace NS    Kubernetes namespace (default: darkreader)
#   -o, --output DIR      Local directory to save the archive (default: .)
#   -f, --file NAME       Exact archive filename to download; omit to pick interactively
#   -l, --latest          Download the most recent backup without prompting
#   -h, --help            Show this help message

set -euo pipefail

NAMESPACE="darkreader"
OUTPUT_DIR="."
TARGET_FILE=""
LATEST=false
PVC_NAME="darkreader-backup-storage"
POD_NAME="darkreader-backup-reader-$$"

usage() {
  grep '^#' "$0" | sed 's/^# \{0,1\}//'
  exit 0
}

cleanup() {
  echo ""
  echo "==> Removing temporary pod ${POD_NAME} ..."
  kubectl delete pod "${POD_NAME}" -n "${NAMESPACE}" --ignore-not-found --wait=false 2>/dev/null || true
}

# ── Argument parsing ───────────────────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case "$1" in
    -n|--namespace) NAMESPACE="$2"; shift 2 ;;
    -o|--output)    OUTPUT_DIR="$2"; shift 2 ;;
    -f|--file)      TARGET_FILE="$2"; shift 2 ;;
    -l|--latest)    LATEST=true; shift ;;
    -h|--help)      usage ;;
    *) echo "Unknown option: $1"; usage ;;
  esac
done

mkdir -p "${OUTPUT_DIR}"

# ── Spin up a temporary read-only pod that mounts the backup PVC ───────────────
echo "==> Launching temporary pod ${POD_NAME} in namespace ${NAMESPACE} ..."
kubectl run "${POD_NAME}" \
  --image=busybox:1.36 \
  --restart=Never \
  --namespace="${NAMESPACE}" \
  --overrides="{
    \"spec\": {
      \"containers\": [{
        \"name\": \"backup-reader\",
        \"image\": \"busybox:1.36\",
        \"command\": [\"sh\", \"-c\", \"sleep 3600\"],
        \"volumeMounts\": [{
          \"name\": \"backup-storage\",
          \"mountPath\": \"/backup\",
          \"readOnly\": true
        }]
      }],
      \"volumes\": [{
        \"name\": \"backup-storage\",
        \"persistentVolumeClaim\": {
          \"claimName\": \"${PVC_NAME}\",
          \"readOnly\": true
        }
      }]
    }
  }"

trap cleanup EXIT

echo "==> Waiting for pod to be ready ..."
kubectl wait pod "${POD_NAME}" \
  --namespace="${NAMESPACE}" \
  --for=condition=Ready \
  --timeout=60s

# ── List available archives ────────────────────────────────────────────────────
echo ""
echo "==> Available backups:"
ARCHIVES=$(kubectl exec "${POD_NAME}" -n "${NAMESPACE}" -- \
  sh -c 'ls -t /backup/darkreader-*.tar.gz 2>/dev/null || true')

if [[ -z "${ARCHIVES}" ]]; then
  echo "    No backup archives found in the PVC."
  exit 1
fi

# Print with index for interactive selection
i=1
while IFS= read -r line; do
  SIZE=$(kubectl exec "${POD_NAME}" -n "${NAMESPACE}" -- \
    sh -c "du -sh '${line}' 2>/dev/null | cut -f1" 2>/dev/null || echo "?")
  printf "  [%2d]  %-50s  %s\n" "$i" "$(basename "${line}")" "${SIZE}"
  i=$((i + 1))
done <<< "${ARCHIVES}"

echo ""

# ── Resolve which file to download ────────────────────────────────────────────
if [[ -n "${TARGET_FILE}" ]]; then
  CHOSEN="/backup/${TARGET_FILE}"
elif [[ "${LATEST}" == true ]]; then
  CHOSEN=$(echo "${ARCHIVES}" | head -n 1)
  echo "==> Auto-selecting latest: $(basename "${CHOSEN}")"
else
  read -rp "Enter number to download (default: 1): " SELECTION
  SELECTION="${SELECTION:-1}"
  CHOSEN=$(echo "${ARCHIVES}" | sed -n "${SELECTION}p")
  if [[ -z "${CHOSEN}" ]]; then
    echo "Invalid selection."
    exit 1
  fi
fi

BASENAME=$(basename "${CHOSEN}")
LOCAL_PATH="${OUTPUT_DIR}/${BASENAME}"

# ── Download ───────────────────────────────────────────────────────────────────
echo "==> Downloading ${BASENAME} → ${LOCAL_PATH} ..."
kubectl cp \
  "${NAMESPACE}/${POD_NAME}:${CHOSEN}" \
  "${LOCAL_PATH}"

echo "==> Done. Saved to: ${LOCAL_PATH}"
echo "    Size: $(du -sh "${LOCAL_PATH}" | cut -f1)"
