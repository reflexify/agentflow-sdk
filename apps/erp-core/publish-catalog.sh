#!/usr/bin/env bash
# Publish rfx/erp-core to one AgentFlow deployment's app catalog.
#
#   export AGENTFLOW_URL=https://agentflow.example.com
#   read -rs AGENTFLOW_TOKEN && export AGENTFLOW_TOKEN    # afk_… of the organization APP_CATALOG_VERIFIED_ORG_ID names
#   export ERP_CORE_SIGNING_KEY=~/.agentflow/keys/rfx.pem  # outside the repo, mode 600
#   pnpm publish:catalog
#
# Run it once per deployment. The sealed file is kept in dist-app/<key id>/, and sealing the same version with the same key
# gives the same bytes, so every deployment gets the identical package. Publishing a version again with the same
# bytes changes nothing; with other contents it is refused: raise version in config/package-manifest.json.
set -euo pipefail
cd "$(dirname "$0")"

: "${AGENTFLOW_URL:?set AGENTFLOW_URL to the deployment address}"
: "${AGENTFLOW_TOKEN:?set AGENTFLOW_TOKEN to a key holding app_catalog.publish and integration.admin}"
: "${ERP_CORE_SIGNING_KEY:?set ERP_CORE_SIGNING_KEY to the rfx publisher signing key (a .pem outside the repo)}"

key=$(cd "$(dirname "$ERP_CORE_SIGNING_KEY")" && pwd)/$(basename "$ERP_CORE_SIGNING_KEY")
[ -f "$key" ] || { echo "no signing key at $key" >&2; exit 2; }
case "$key" in "$(git rev-parse --show-toplevel)"/*)
  echo "the signing key is inside the repository; keep it outside it" >&2; exit 2 ;;
esac

cli=(pnpm exec agentflow-app)

echo "1/4 package/ matches config/"
"${cli[@]}" build --check

echo "2/4 lint against $AGENTFLOW_URL"
"${cli[@]}" lint

echo "3/4 seal"
# One folder per signing key, so a seal made with a test key never blocks the real one.
sealed=$("${cli[@]}" seal --key "$key" --out "dist-app/$(basename "$key" .pem)" --json)
file=$(node -e 'const s = JSON.parse(process.argv[1]); console.log(s.file)' "$sealed")
node -e 'const s = JSON.parse(process.argv[1]); console.log(`${s.unchanged ? "unchanged" : "sealed"} ${s.package_id} ${s.version} (${s.digest})`)' "$sealed"

echo "4/4 publish to $AGENTFLOW_URL"
"${cli[@]}" publish --file "$file"
