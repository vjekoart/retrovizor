#!/bin/bash
set -e

TMP_DIR="/tmp/retrovizor"
TARGET_DIR="/var/www/retrovizor.xyz/html"

echo "Cloning the code..."

rm -rf $TMP_DIR
git clone --depth=1 https://github.com/vjekoart/retrovizor.git $TMP_DIR

echo "Building the project..."

pushd $TMP_DIR
npm ci
npm run build
popd

echo "Replacing artefacts..."

rm -rf "$TARGET_DIR/*"
cp -r $TMP_DIR/dist/* "$TARGET_DIR/"
rm -rf $TMP_DIR

echo "Done."
