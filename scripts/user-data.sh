#!/bin/bash
# Install Node.js and git
sudo yum update -y
sudo yum install -y git
curl -sL https://rpm.nodesource.com/setup_16.x | sudo bash -
sudo yum install -y nodejs

# Clone application repository (replace <repo-url> with actual repo)
REPO_URL="https://example.com/hw1.git"
APP_DIR="/home/ec2-user/app"

if [ ! -d "$APP_DIR" ]; then
  git clone $REPO_URL $APP_DIR
  cd $APP_DIR
  npm install
  npm run build || true
fi

node dist/server.js > app.log 2>&1 &

