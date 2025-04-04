#!/bin/bash
set -e

cat << EOF
[Usage]

$ ./infrastructure/remote.sh send:scripts  # Send main script files to server
$ ./infrastructure/remote.sh send:assets   # Send configurations and similar assets to server
$ ./infrastructure/remote.sh init          # Run an initialization script (including "stats" for now)
$ ./infrastructure/remote.sh deploy        # Deploy latest version of the web app
$ ./infrastructure/remote.sh deploy:build  # Build and publish latest version of the web app
$ ./infrastructure/remote.sh deploy:update # Fetch latest version of the repository
$ ./infrastructure/remote.sh update        # Update server packages and restart services

# Task management

$ ./infrastructure/remote.sh task:run <relative/path> args
$ ./infrastructure/remote.sh task:cron:list
$ ./infrastructure/remote.sh task:cron:set <relative/path> "@daily|@weekly|@monthly|<cron expression>"
$ ./infrastructure/remote.sh task:cron:unset <relative/path>
$ ./infrastructure/remote.sh task:cron:logs

Tasks are NodeJS scripts placed inside the repository.
EOF

source $(pwd)/.env

if [[ "$1" = "send:scripts" ]] ; then
    echo "Sending scripts to '$REMOTE'..."

    scp $(pwd)/infrastructure/initialize.remote.sh root@$REMOTE:/usr/local/bin/initialize
    scp $(pwd)/infrastructure/deploy.remote.sh root@$REMOTE:/usr/local/bin/deploy
    scp $(pwd)/infrastructure/update.remote.sh root@$REMOTE:/usr/local/bin/update
    scp $(pwd)/infrastructure/task.remote.sh root@$REMOTE:/usr/local/bin/task
fi

if [[ "$1" = "send:assets" ]] ; then
    echo "Sending assets to '$REMOTE'..."

    scp $(pwd)/infrastructure/sites-available/$DOMAIN root@$REMOTE:/etc/nginx/sites-available

    # TODO: this should be optional
    scp $(pwd)/infrastructure/sites-available/stats.$DOMAIN root@$REMOTE:/etc/nginx/sites-available
fi

if [[ "$1" = "init" ]] ; then
    echo "Initializing '$REMOTE'..."
    ssh root@$REMOTE 'initialize'
fi

if [[ "$1" = "deploy" ]] ; then
    echo "Deploying the latest web app version to $REMOTE..."
    ssh root@$REMOTE "DOMAIN=$DOMAIN REPO=$REPO deploy update"
    ssh root@$REMOTE "DOMAIN=$DOMAIN REPO=$REPO deploy build"
fi

if [[ "$1" = "deploy:build" ]] ; then
    echo "Building and publishing the latest web app version to $REMOTE..."
    ssh root@$REMOTE "DOMAIN=$DOMAIN REPO=$REPO deploy build"
fi

if [[ "$1" = "deploy:update" ]] ; then
    echo "Fetching the latest version of the repository to $REMOTE..."
    ssh root@$REMOTE "DOMAIN=$DOMAIN REPO=$REPO deploy update"
fi

if [[ "$1" = "update" ]] ; then
    echo "Updating '$REMOTE'..."
    ssh root@$REMOTE 'update'
fi

if [[ "$1" = "task:run" ]] ; then
    echo "Running task '$2 ${@:3}' on '$REMOTE'..."
    ssh root@$REMOTE "DOMAIN=$DOMAIN task run $2 ${@:3}"
fi

if [[ "$1" = "task:cron:list" ]] ; then
    echo "Listing cron tasks on '$REMOTE'..."
    ssh root@$REMOTE "DOMAIN=$DOMAIN task cron:list"
fi

if [[ "$1" = "task:cron:set" ]] ; then
    echo "Setting cron task '$2' on a '$3' basis on '$REMOTE'..."
    ssh root@$REMOTE "DOMAIN=$DOMAIN task cron:set $2 $3"
fi

if [[ "$1" = "task:cron:unset" ]] ; then
    echo "Unsetting a cron task '$2' on '$REMOTE'..."
    ssh root@$REMOTE "DOMAIN=$DOMAIN task cron:unset $2"
fi

if [[ "$1" = "task:cron:logs" ]] ; then
    echo "Reading cron logs on '$REMOTE'..."
    ssh root@$REMOTE "DOMAIN=$DOMAIN task cron:logs"
fi

