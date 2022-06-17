#!/bin/bash -xe
source /home/ec2-user/.bash_profile
sudo /etc/init.d/redis_6379 start
cd /home/ec2-user/app/release
nvm alias default 16
nvm use 16
npm clean-install
npm run start
