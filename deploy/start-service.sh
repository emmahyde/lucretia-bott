#!/bin/bash -xe
source /home/ec2-user/.bash_profile
sudo /etc/init.d/redis_6379 start
cd /home/ec2-user/app/release
npm run start
