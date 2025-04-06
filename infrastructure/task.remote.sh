#!/bin/bash
set -e

# ENV: DOMAIN, USER

BUILD_DIR="/var/local/$DOMAIN"
LOG_FILE="/tmp/cron.log"

if [[ "$1" = "run" ]] ; then
    pushd $BUILD_DIR
    DOMAIN=$DOMAIN node $BUILD_DIR/$2 ${@:3}
    popd
fi

if [[ "$1" = "cron:list" ]] ; then
    crontab -u $USER -l | grep -v "#"
fi

if [[ "$1" = "cron:set" ]] ; then
    COMMAND="cd $BUILD_DIR && DOMAIN=$DOMAIN /usr/local/bin/node $2 >$LOG_FILE 2>&1"
    (crontab -u $USER -l ; echo "$3 $COMMAND") | crontab -u $USER -
fi

if [[ "$1" = "cron:unset" ]] ; then
    crontab -u $USER -l | grep -v "/usr/local/bin/node $2" | crontab -u $USER -
fi

if [[ "$1" = "cron:logs" ]] ; then
    grep -i cron /var/log/syslog
fi

if [[ "$1" = "cron:runlogs" ]] ; then
    cat $LOG_FILE
fi

