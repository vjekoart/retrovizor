#!/bin/bash
set -e

echo "Updating packages..."

sudo apt update -y
sudo apt upgrade -y
sudo apt autoremove -y
sudo apt autoclean -y

sudo /opt/certbot/bin/pip install --upgrade certbot certbot-nginx

echo "Restarting services..."

sudo systemctl restart nginx

echo "Done."
