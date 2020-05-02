#!/bin/bash
set -ex
echo "$(basename $0)"
pwd
ls -l
export VUE_APP_CLIENT_BUILD_INFO=""
if [ -n "$CANDIDAT_PUBLIC_PATH" ] ; then
  echo "# build:candidat"
  npm run build:candidat
  mv dist dist-candidat
fi
if [ -n "$ADMIN_PUBLIC_PATH" ] ; then
  echo "# build:admin"
  npm run build:admin
  mv dist dist-admin
fi

echo "# clean"
rm -rf node_modules
npm cache clean --force
