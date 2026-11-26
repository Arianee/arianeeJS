#!/usr/bin/env bash
# Clone the private repositories that docker-compose uses as build contexts.
#
# Why this exists: BuildKit loads a git build context inside the daemon, where it
# has no SSH forwarding ("unknown service moby.sshforward.v1.SSH"), so Docker
# cannot fetch these repositories itself. Putting a token in the context URL is
# what this replaces. We clone them with plain git instead and point the contexts
# at local paths.
#
# Why each clone pins its own key: these are per-repository DEPLOY keys. SSH
# offers the first key the server accepts, and GitHub maps that key to exactly one
# repository, so any other repository answers "Repository not found". Each clone
# therefore forces its own identity with IdentitiesOnly.
#
# Locally, without those keys installed, it falls back to your normal SSH setup.
set -euo pipefail
DEST="$(cd "$(dirname "$0")/.." && pwd)/.build-contexts"
mkdir -p "$DEST"

# Find the private key file whose fingerprint matches, among the keys CircleCI
# installed in ~/.ssh. Prints nothing when not found.
key_for() {
  want="$1"
  for f in "$HOME"/.ssh/id_*; do
    case "$f" in *.pub) continue;; esac
    [ -f "$f" ] || continue
    got=$(ssh-keygen -l -E md5 -f "$f" 2>/dev/null | awk '{print $2}' | sed 's/^MD5://')
    [ "$got" = "$want" ] && { printf '%s' "$f"; return 0; }
  done
  return 0
}

clone_at() {
  repo="$1"; ref="$2"; fp="$3"
  dir="$DEST/$repo"
  keyfile=$(key_for "$fp")
  if [ -n "$keyfile" ]; then
    export GIT_SSH_COMMAND="ssh -i $keyfile -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new"
  else
    echo "  note: no key matching $fp in ~/.ssh, using the default SSH setup"
    unset GIT_SSH_COMMAND || true
  fi
  if [ -d "$dir/.git" ]; then
    git -C "$dir" fetch --depth 1 origin "$ref"
    git -C "$dir" checkout -q FETCH_HEAD
  else
    git clone --depth 1 --branch "$ref" "git@github.com:Arianee/$repo.git" "$dir"
  fi
  echo "  $repo@$ref -> $dir"
}

echo "Fetching private build contexts:"
clone_at docker-rpc-server master       c5:22:5b:2f:6b:d4:a7:7f:b5:f8:70:1d:24:7a:b5:d3
clone_at arianee-faucet    clever-cloud 8d:a2:8f:78:a0:24:b3:19:be:d3:ba:b2:ea:33:a2:80
