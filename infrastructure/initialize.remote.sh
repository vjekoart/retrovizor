#!/bin/bash
set -e

NODEJS="v22.14.0"

echo "Installing packages..."

sudo apt update -y
sudo apt upgrade -y

sudo apt install git -y
sudo apt install nginx -y
sudo apt install ufw -y
sudo apt install wget -y

sudo apt install python3 python3-venv libaugeas0 -y

echo "Installing NodeJS..."

NODEJS_TARGET="/usr/local/etc"
NODEJS_BIN="$NODEJS_TARGET/node-$NODEJS-linux-x64/bin"
NODEJS_URL="https://nodejs.org/dist/$NODEJS/node-$NODEJS-linux-x64.tar.gz"

sudo wget -qO- $NODEJS_URL | gunzip | tar xvf - -C $NODEJS_TARGET
sudo rm /usr/local/bin/node
sudo rm /usr/local/bin/npm
sudo ln -s $NODEJS_BIN/node /usr/local/bin/node
sudo ln -s $NODEJS_BIN/npm /usr/local/bin/npm

echo "Configuring firewall..."

sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable

echo "Configuring Nginx..."

sudo mkdir -p /var/www/retrovizor.xyz/html
sudo echo "Upcoming..." > /var/www/retrovizor.xyz/html/index.html
sudo ln -s /etc/nginx/sites-available/retrovizor.xyz /etc/nginx/sites-enabled/

# TODO: this should be optional
sudo mkdir -p /var/www/stats.retrovizor.xyz/html
sudo echo "Upcoming..." > /var/www/stats.retrovizor.xyz/html/index.html
sudo ln -s /etc/nginx/sites-available/stats.retrovizor.xyz /etc/nginx/sites-enabled/

sudo rm /etc/nginx/sites-enabled/default

sudo systemctl restart nginx

echo "Generating SSL certificates..."

sudo python3 -m venv /opt/certbot/
sudo /opt/certbot/bin/pip install --upgrade pip
sudo /opt/certbot/bin/pip install certbot certbot-nginx

sudo ln -s /opt/certbot/bin/certbot /usr/local/bin/certbot

# TODO: how to run this non-interactively
sudo certbot --nginx

echo "0 0,12 * * * root /opt/certbot/bin/python -c 'import random; import time; time.sleep(random.random() * 3600)' && sudo certbot renew -q" | sudo tee -a /etc/crontab > /dev/null

echo "Done."
