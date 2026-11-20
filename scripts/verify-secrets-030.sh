#!/usr/bin/env bash
# Roadmap 030: read-only evidence of PRIVATE FILE metadata on the ONE existing VPS checkout.
# Never prints, copies, parses, rotates, or exports a credential value.
(
  set +x
  set -euo pipefail
  export LC_ALL=C
  cd "$HOME/www/blueDotAtlas" || exit 1

  if [[ "$(id -u)" == 0 ]] ||
     [[ ! -d .git ]] ||
     [[ "$(git rev-parse --show-toplevel)" != "$(pwd -P)" ]] ||
     [[ "$(git remote get-url origin)" != "https://github.com/whiteyOnTheMoon/BlueDotAtlas.git" ]]; then
    echo "030 FAIL: unexpected user, path or repository" >&2
    exit 1
  fi

  for filename in .env.bda.db .env.bda.web .env.bda.tunnel.token; do
    if [[ -L "$filename" || ! -f "$filename" || ! -s "$filename" ]]; then
      echo "030 FAIL: private file absent, empty or symlinked" >&2
      exit 1
    fi
    if [[ "$(stat -c '%a' "$filename")" != "600" ]] ||
       [[ "$(stat -c '%u' "$filename")" != "$(id -u)" ]]; then
      echo "030 FAIL: owner or mode must be 0600 and current nonroot user" >&2
      exit 1
    fi
    if ! git check-ignore -q -- "$filename" ||
       git ls-files --error-unmatch -- "$filename" >/dev/null 2>&1; then
      echo "030 FAIL: private file tracked or not ignored" >&2
      exit 1
    fi
  done

  # Preview policy only: web admin credentials must NOT have been enabled.
  # grep -q checks presence and never emits the matching line.
  if grep -Eq '^BDA_ADMIN_(EMAIL|PASSWORD_HASH)=' .env.bda.web; then
    echo "030 FAIL: public preview admin settings are present (not approved)" >&2
    exit 1
  fi

  echo "030 READ-ONLY SECRET FILE CHECK: PASS"
  echo "Evidence: 3 owned, regular, 0600, Git-ignored, untracked files; public preview admin disabled."
  echo "Limit: no value inspection, secret rotation, Docker runtime scan or production admin authorization."
)
