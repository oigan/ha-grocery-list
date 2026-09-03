#!/usr/bin/env bash
set -euo pipefail

: "${HA_SSH_TARGET:?Setează HA_SSH_TARGET, de exemplu root@server}"
: "${HA_SSH_KEY:?Setează HA_SSH_KEY cu o cale absolută spre cheia SSH}"

HA_CONFIG_PATH="${HA_CONFIG_PATH:-/config}"

sync_integration() {
  npm run build
  rsync -az --exclude '__pycache__' \
    -e "ssh -i $HA_SSH_KEY -o StrictHostKeyChecking=accept-new" \
    ./custom_components/auchan_grocery/ \
    "$HA_SSH_TARGET:$HA_CONFIG_PATH/custom_components/auchan_grocery/"
  echo "Sincronizare finalizată. Repornește Home Assistant pentru modificările Python."
}

sync_integration

if command -v fswatch >/dev/null 2>&1; then
  fswatch -o custom_components/auchan_grocery www/auchan-grocery | while read -r _; do
    sync_integration
  done
else
  echo "fswatch nu este instalat; s-a executat o singură sincronizare."
fi
