#!/bin/bash
set -e

# DOMAIN

BUILD_DIR="/var/local/$DOMAIN"
CRON_TASKS_DIR="/var/local/tasks"

if [[ "$1" = "run" ]] ; then
    pushd $BUILD_DIR
    DOMAIN=$DOMAIN node $BUILD_DIR/$2
    popd
fi
