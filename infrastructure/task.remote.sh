#!/bin/bash
set -e

# ENV: DOMAIN, USER

BUILD_DIR="/var/local/$DOMAIN"

if [[ "$1" = "run" ]] ; then
    pushd $BUILD_DIR
    DOMAIN=$DOMAIN node $BUILD_DIR/$2 ${@:3}
    popd
fi

if [[ "$1" = "cron:list" ]] ; then
    crontab -u $USER -l | grep -v "#"
fi

if [[ "$1" = "cron:set" ]] ; then
    (crontab -u $USER -l ; echo "$3 cd $BUILD_DIR && node $2") | crontab -u $USER -
fi

if [[ "$1" = "cron:unset" ]] ; then
    crontab -u $USER -l | grep -v $2 | crontab -u $USER -
fi

if [[ "$1" = "cron:logs" ]] ; then
    cat /var/log/syslog | grep cron
fi

