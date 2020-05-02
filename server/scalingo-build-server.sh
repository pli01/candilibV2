#!/bin/bash
set -ex
echo "# $(basename $0)"
pwd
ls -l
# need to use temporary development mode to install and build using babel,
# then remove all dev modules, clean all and rerun in production mode
(
  export NODE_ENV=development
  npm install
  npm run build-ci
  rm -rf node_modules
  npm cache clean --force
)
#
npm ci --production
npm install pm2 -g
ls -l
echo "# clean"
npm cache clean --force
