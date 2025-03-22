#!/bin/bash
set -e

cat << EOF
[Usage]
$ ./infrastructure/remote.sh send:scripts # Send main script files to server
$ ./infrastructure/remote.sh send:assets  # Send configurations and similar assets to server
$ ./infrastructure/remote.sh init         # Run an initialization script
$ ./infrastructure/remote.sh deploy       # Deploy latest version of retrovizor.xyz
$ ./infrastructure/remote.sh update       # Update server packages and restart services
EOF

source $(pwd)/.env

if [[ "$1" = "send:scripts" ]] ; then
    echo "Sending scripts to '$REMOTE'..."

    scp $(pwd)/infrastructure/initialize.remote.sh root@$REMOTE:/usr/local/bin/initialize
    scp $(pwd)/infrastructure/deploy.remote.sh root@$REMOTE:/usr/local/bin/deploy
    scp $(pwd)/infrastructure/update.remote.sh root@$REMOTE:/usr/local/bin/update
fi

if [[ "$1" = "send:assets" ]] ; then
    echo "Sending assets to '$REMOTE'..."

    scp $(pwd)/infrastructure/sites-available/retrovizor.xyz root@$REMOTE:/etc/nginx/sites-available
fi

if [[ "$1" = "init" ]] ; then
    echo "Initializing '$REMOTE'..."
    ssh root@$REMOTE 'initialize'
fi

if [[ "$1" = "deploy" ]] ; then
    echo "Deploying latest 'retrovizor.xyz' version to $REMOTE..."
    ssh root@$REMOTE 'deploy'
fi

if [[ "$1" = "update" ]] ; then
    echo "Updating '$REMOTE'..."
    ssh root@$REMOTE 'update'
fi
