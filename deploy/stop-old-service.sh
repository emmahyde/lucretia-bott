#!/bin/bash -xe

source /home/ec2-user/.bash_profile

if [ -d "/home/ec2-user/app/release/node_modules" ]; then
  cd /home/ec2-user/app/release
  node ./node_modules/pm2/bin/pm2 save
  npm run show
  npm stop
fi

redis-cli shutdown