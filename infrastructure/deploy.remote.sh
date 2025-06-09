#!/bin/bash
set -e

# ENV: DOMAIN, REPO

BUILD_DIR="/var/local/$DOMAIN"
TARGET_DIR="/var/www/$DOMAIN/html"

OLD_BUILD_FIELS="$TARGET_DIR/*"
NEW_BUILD_FILES="$BUILD_DIR/dist/*"

if [[ "$1" = "update" ]] ; then
    echo "Updating the code..."

    rm -rf $BUILD_DIR
    git clone --depth=1 $REPO $BUILD_DIR
    pushd $BUILD_DIR
    npm ci
    popd

    echo "Done."
fi

if [[ "$1" = "build" ]] ; then
    echo "Building the project..."

    pushd $BUILD_DIR
    npm ci
    npm run build
    popd

    echo "Replacing artefacts..."

    rm -rf $OLD_BUILD_FILES
    cp -r $NEW_BUILD_FILES "$TARGET_DIR/"

    echo "Done."
fi

