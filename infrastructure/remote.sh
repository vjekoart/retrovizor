#!/bin/bash
set -e

cat << EOF
[Usage]
$ ./infrastructure/remote.sh send   # Copy relevant files to remote server
$ ./infrastructure/remote.sh init   # Run an initialization script
$ ./infrastructure/remote.sh deploy # Deploy latest version of retrovizor.xyz
EOF

source $(pwd)/.env

if [[ "$1" = "send" ]] ; then
    echo "Sending assets to the server at $REMOTE..."

    scp $(pwd)/infrastructure/initialize.remote.sh root@$REMOTE:/usr/local/bin/initialize
    scp $(pwd)/infrastructure/deploy.remote.sh root@$REMOTE:/usr/local/bin/deploy

    # Send assets
    scp $(pwd)/infrastructure/sites-available/retrovizor.xyz root@$REMOTE:/etc/nginx/sites-available
fi

if [[ "$1" = "initialize" ]] ; then
    echo "Initializing the server at $REMOTE..."
    ssh root@$REMOTE 'initialize'
fi

if [[ "$1" = "deploy" ]] ; then
    echo "Deploying latest 'retrovizor.xyz' version to $REMOTE..."
    ssh root@$REMOTE 'deploy'

    # TODO: use wget or something to check if website is up
fi
