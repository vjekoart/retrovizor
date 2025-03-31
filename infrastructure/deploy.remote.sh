#!/bin/bash
set -e

# DOMAIN
# REPO

BUILD_DIR="/var/local/$DOMAIN"
TARGET_DIR="/var/www/$DOMAIN/html"

if [[ "$1" = "update" ]] ; then
    echo "Updating the code..."

    rm -rf $BUILD_DIR
    git clone --depth=1 $REPO $BUILD_DIR

    echo "Done."
fi

if [[ "$1" = "build" ]] ; then
    echo "Building the project..."

    pushd $BUILD_DIR
    npm ci
    npm run build
    popd

    echo "Replacing artefacts..."

    rm -rf "$TARGET_DIR/*"
    cp -r $BUILD_DIR/dist/* "$TARGET_DIR/"

    echo "Done."
fi
