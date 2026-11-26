#!/usr/bin/env bash
# Clone the private repositories that docker-compose uses as build contexts.
#
# They cannot be fetched by Docker directly: BuildKit loads a git context inside
# the daemon and has no SSH forwarding there ("unknown service
# moby.sshforward.v1.SSH"), and putting a token in the context URL is what this
# replaces. So we clone them with plain git — which does have our SSH keys — and
# point the contexts at local paths.
#
# Run this before `docker-compose up --build`. Needs read access to both repos:
# your own GitHub SSH key locally, the injected deploy keys in CI.
set -euo pipefail
DEST="$(cd "$(dirname "$0")/.." && pwd)/.build-contexts"
mkdir -p "$DEST"
clone_at() {
  repo="$1"; ref="$2"; dir="$DEST/$(basename "$repo" .git)"
  if [ -d "$dir/.git" ]; then
    git -C "$dir" fetch --depth 1 origin "$ref"
    git -C "$dir" checkout -q FETCH_HEAD
  else
    git clone --depth 1 --branch "$ref" "git@github.com:Arianee/$repo.git" "$dir"
  fi
  echo "  $repo@$ref -> $dir"
}
echo "Fetching private build contexts:"
clone_at docker-rpc-server master
clone_at arianee-faucet clever-cloud
