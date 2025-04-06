#!/bin/bash
set -e

if [[ "$1" = "help" ]] || [[ -z "$1" ]] ; then

cat << EOF
[Usage]

$ ./infrastructure/remote.sh send:scripts  # Send main script files to server
$ ./infrastructure/remote.sh send:assets   # Send configurations and similar assets to server
$ ./infrastructure/remote.sh init          # Run an initialization script (including "stats" for now)
$ ./infrastructure/remote.sh deploy        # Deploy latest version of the web app
$ ./infrastructure/remote.sh deploy:build  # Build and publish latest version of the web app
$ ./infrastructure/remote.sh deploy:update # Fetch latest version of the repository
$ ./infrastructure/remote.sh server:update        # Update server packages and restart services

# Task management

$ ./infrastructure/remote.sh task:run <relative/path> args
$ ./infrastructure/remote.sh task:cron:list
$ ./infrastructure/remote.sh task:cron:set <relative/path> "@daily|@weekly|@monthly|<cron expression>"
$ ./infrastructure/remote.sh task:cron:unset <relative/path>
$ ./infrastructure/remote.sh task:cron:logs

Tasks are NodeJS scripts placed inside the repository.
EOF

    exit
fi

# ENV: DOMAIN, REMOTE, REPO, USER
source $(pwd)/.env

if [[ "$1" = "send:scripts" ]] ; then
    echo "Sending scripts to '$REMOTE'..."

    scp $(pwd)/infrastructure/initialize.remote.sh $USER@$REMOTE:/usr/local/bin/initialize
    scp $(pwd)/infrastructure/deploy.remote.sh $USER@$REMOTE:/usr/local/bin/deploy
    scp $(pwd)/infrastructure/update.remote.sh $USER@$REMOTE:/usr/local/bin/update
    scp $(pwd)/infrastructure/task.remote.sh $USER@$REMOTE:/usr/local/bin/task
    exit
fi

if [[ "$1" = "send:assets" ]] ; then
    echo "Sending assets to '$REMOTE'..."

    scp $(pwd)/infrastructure/sites-available/$DOMAIN $USER@$REMOTE:/etc/nginx/sites-available

    # TODO: this should be optional
    scp $(pwd)/infrastructure/sites-available/stats.$DOMAIN $USER@$REMOTE:/etc/nginx/sites-available
    exit
fi

if [[ "$1" = "init" ]] ; then
    echo "Initializing '$REMOTE'..."
    ssh $USER@$REMOTE 'initialize'
    exit
fi

if [[ "$1" = "deploy" ]] ; then
    echo "Deploying the latest web app version to $REMOTE..."
    ssh $USER@$REMOTE "DOMAIN=$DOMAIN REPO=$REPO deploy update"
    ssh $USER@$REMOTE "DOMAIN=$DOMAIN REPO=$REPO deploy build"
    exit
fi

if [[ "$1" = "deploy:build" ]] ; then
    echo "Building and publishing the latest web app version to $REMOTE..."
    ssh $USER@$REMOTE "DOMAIN=$DOMAIN REPO=$REPO deploy build"
    exit
fi

if [[ "$1" = "deploy:update" ]] ; then
    echo "Fetching the latest version of the repository to $REMOTE..."
    ssh $USER@$REMOTE "DOMAIN=$DOMAIN REPO=$REPO deploy update"
    exit
fi

if [[ "$1" = "server:update" ]] ; then
    echo "Updating server '$REMOTE'..."
    ssh $USER@$REMOTE 'update'
    exit
fi

if [[ "$1" = "task:run" ]] ; then
    echo "Running task '$2 ${@:3}' on '$REMOTE'..."
    ssh $USER@$REMOTE "DOMAIN=$DOMAIN task run \"$2\" ${@:3}"
    exit
fi

if [[ "$1" = "task:cron:list" ]] ; then
    echo "Listing cron tasks on '$REMOTE'..."
    ssh $USER@$REMOTE "USER=$USER DOMAIN=$DOMAIN task cron:list"
    exit
fi

if [[ "$1" = "task:cron:set" ]] ; then
    echo "Setting cron task '$2' on a '$3' basis on '$REMOTE'..."
    ssh $USER@$REMOTE "USER=$USER DOMAIN=$DOMAIN task cron:set \"$2\" \"$3\""
    exit
fi

if [[ "$1" = "task:cron:unset" ]] ; then
    echo "Unsetting a cron task '$2' on '$REMOTE'..."
    ssh $USER@$REMOTE "USER=$USER DOMAIN=$DOMAIN task cron:unset \"$2\""
    exit
fi

if [[ "$1" = "task:cron:logs" ]] ; then
    echo "Reading cron logs on '$REMOTE'..."
    ssh $USER@$REMOTE "USER=$USER DOMAIN=$DOMAIN task cron:logs"
    exit
fi

echo "Unknown command."
