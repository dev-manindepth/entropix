#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
# Publish Entropix packages to a local Verdaccio registry
# for testing before publishing to npm.
#
# Usage:
#   1. Install Verdaccio globally:  npm i -g verdaccio
#   2. Start it:                    verdaccio
#   3. Run this script:             ./scripts/publish-local.sh
#   4. Test in a consumer project:
#        npm install @entropix/react --registry http://localhost:4873
# ──────────────────────────────────────────────────────────────

set -euo pipefail

LOCAL_REGISTRY="http://localhost:4873"
PACKAGES=("tokens" "core" "react" "react-native")

echo "🔨 Building all packages..."
pnpm build

echo ""
echo "📦 Publishing to local registry ($LOCAL_REGISTRY)..."

for pkg in "${PACKAGES[@]}"; do
  echo "  → @entropix/$pkg"
  cd "packages/$pkg"
  npm publish --registry "$LOCAL_REGISTRY" --no-git-checks 2>/dev/null || \
    echo "    ⚠  Already published (or version exists)"
  cd ../..
done

echo ""
echo "✅ Done! Test with:"
echo "   npm install @entropix/react --registry $LOCAL_REGISTRY"
echo "   npm install @entropix/react-native --registry $LOCAL_REGISTRY"
