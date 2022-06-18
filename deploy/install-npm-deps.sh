# START
echo "Setting up NodeJS Environment..."
curl https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash

# Dot source the files to ensure that variables are available within the current shell
. /home/ec2-user/.nvm/nvm.sh
. /home/ec2-user/.bashrc

echo "environment setup complete. exiting install_script..."
cd /home/ec2-user/app/release
# Install NVM, NPM, Node.JS
nvm install v16.15.1
npm clean-install