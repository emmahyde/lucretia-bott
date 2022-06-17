#!/bin/bash -xe
source /home/ec2-user/.bash_profile
[ -d "/home/ec2-user/app/release" ] && \
cd /home/ec2-user/app/release && \
node ./node_modules/pm2/bin/pm2 save
npm run show
npm stop
redis-cli shutdown
