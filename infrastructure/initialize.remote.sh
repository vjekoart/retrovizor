#!/bin/bash
set -e

# Constants
NODEJS="v22.14.0"

# Packages
echo "Installing packages..."

sudo apt update -y
sudo apt upgrade -y

sudo apt install git -y
sudo apt install nginx -y
sudo apt install ufw -y
sudo apt install wget -y

# NodeJS installation
echo "NodeJS installation..."

NODEJS_TARGET="/usr/local/etc"
NODEJS_BIN="$NODEJS_TARGET/node-$NODEJS-linux-x64/bin"
NODEJS_URL="https://nodejs.org/dist/$NODEJS/node-$NODEJS-linux-x64.tar.gz"

sudo wget -qO- $NODEJS_URL | gunzip | tar xvf - -C $NODEJS_TARGET
sudo rm /usr/local/bin/node
sudo rm /usr/local/bin/npm
sudo ln -s $NODEJS_BIN/node /usr/local/bin/node
sudo ln -s $NODEJS_BIN/npm /usr/local/bin/npm

# Firewall
echo "Configuring firewall..."

sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable

# Nginx configuration
echo "Nginx configuration..."

sudo mkdir -p /var/www/retrovizor.xyz/html
sudo echo "Upcoming..." > /var/www/retrovizor.xyz/html/index.html
sudo ln -s /etc/nginx/sites-available/retrovizor.xyz /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

sudo systemctl restart nginx

# Setup SSL
echo "Setup SSL..."
# TODO

echo "Done."
