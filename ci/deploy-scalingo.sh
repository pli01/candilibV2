#!/bin/bash
set -e
SCALINGO_API_TOKEN_ADMIN=${SCALINGO_API_TOKEN_ADMIN:?SCALINGO_API_TOKEN_ADMIN not set!}
SCALINGO_APP_ADMIN=${SCALINGO_APP_ADMIN:?SCALINGO_APP_ADMIN not set!}
SCALINGO_API_TOKEN_FRONT=${SCALINGO_API_TOKEN_FRONT:?SCALINGO_API_TOKEN_FRONT not set!}
SCALINGO_APP_FRONT=${SCALINGO_APP_FRONT:?SCALINGO_APP_FRONT not set!}
SCALINGO_API_TOKEN_API=${SCALINGO_API_TOKEN_API:?SCALINGO_API_TOKEN_API no set!}
SCALINGO_APP_API=${SCALINGO_APP_API:?SCALINGO_APP_API not set !}

client_archive=master-client.tar.gz
server_archive=master-server.tar.gz

function clean {
  echo "# Clean"
  rm -rf $client_archive $server_archive
  rm -rf $BUILD_CLIENT_VERSION $BUILD_SERVER_VERSION
}

# trap exit code and call clean function
trap clean EXIT QUIT

echo "# Prepare client/server archives"
VERSION=$(ci/version.sh)
BUILD_CLIENT_VERSION=client-$VERSION
BUILD_SERVER_VERSION=server-$VERSION

# Prepare client archive
rm -rf $client_archive
mkdir -p $BUILD_CLIENT_VERSION
git archive --prefix=master/ $VERSION --format tar client | (cd $BUILD_CLIENT_VERSION && tar xf -)

# Add file
echo $VERSION > $BUILD_CLIENT_VERSION/master/VERSION

( cd $BUILD_CLIENT_VERSION ; tar -zcvf ../$client_archive master )

# Prepare server archive
rm -rf $server_archive
mkdir -p $BUILD_SERVER_VERSION
git archive --prefix=master/ $VERSION --format tar server | (cd $BUILD_SERVER_VERSION && tar xf -)

# Add file
echo $VERSION > $BUILD_SERVER_VERSION/master/VERSION

( cd $BUILD_SERVER_VERSION ; tar -zcvf ../$server_archive master )

# clean
rm -rf $BUILD_SERVER_VERSION
rm -rf $BUILD_CLIENT_VERSION
#
# Deploy client candidat container
#
export SCALINGO_API_TOKEN=$SCALINGO_API_TOKEN_FRONT
export SCALINGO_APP=$SCALINGO_APP_FRONT
echo "# Deploy client candidat $SCALINGO_APP"
scalingo login --api-token $SCALINGO_API_TOKEN
scalingo --app $SCALINGO_APP env-set NODE_OPTIONS="--max_old_space_size=2048"
scalingo --app $SCALINGO_APP env-set PROJECT_DIR="client"
scalingo --app $SCALINGO_APP env-set NODE_ENV="production"
# TODO: extract region
scalingo --app $SCALINGO_APP env-set API_HOST=$SCALINGO_APP_API.osc-fr1.scalingo.io
scalingo --app $SCALINGO_APP env-set API_PORT=443
scalingo --app $SCALINGO_APP env-set CANDIDAT_PUBLIC_PATH=/candilib
scalingo --app $SCALINGO_APP env |grep "^ADMIN_PUBLIC_PATH" && scalingo --app $SCALINGO_APP env-unset ADMIN_PUBLIC_PATH
# scalingo --app $SCALINGO_APP env-set ADMIN_PUBLIC_PATH=/candilib-repartiteur
scalingo --app $SCALINGO_APP deploy $client_archive
scalingo logout
#
# Deploy client admin container
#
export SCALINGO_API_TOKEN=$SCALINGO_API_TOKEN_ADMIN
export SCALINGO_APP=$SCALINGO_APP_ADMIN
echo "# Deploy client admin $SCALINGO_APP"
scalingo login --api-token $SCALINGO_API_TOKEN
scalingo --app $SCALINGO_APP env-set NODE_OPTIONS="--max_old_space_size=2048"
scalingo --app $SCALINGO_APP env-set PROJECT_DIR="client"
scalingo --app $SCALINGO_APP env-set NODE_ENV="production"
# TODO: extract region
scalingo --app $SCALINGO_APP env-set API_HOST=$SCALINGO_APP_API.osc-fr1.scalingo.io
scalingo --app $SCALINGO_APP env-set API_PORT=443
scalingo --app $SCALINGO_APP env-set ADMIN_PUBLIC_PATH=/candilib-repartiteur
scalingo --app $SCALINGO_APP env |grep "^CANDIDAT_PUBLIC_PATH" && scalingo --app $SCALINGO_APP env-unset CANDIDAT_PUBLIC_PATH
# scalingo --app $SCALINGO_APP env-set CANDIDAT_PUBLIC_PATH=/candilib
scalingo --app $SCALINGO_APP deploy $client_archive
scalingo logout
#
# Deploy server api container
#
export SCALINGO_API_TOKEN=$SCALINGO_API_TOKEN_API
export SCALINGO_APP=$SCALINGO_APP_API
echo "# Deploy server $SCALINGO_APP"
scalingo login --api-token $SCALINGO_API_TOKEN
scalingo --app $SCALINGO_APP deployment-delete-cache
scalingo --app $SCALINGO_APP env-set NODE_OPTIONS="--max_old_space_size=2048"
scalingo --app $SCALINGO_APP env-set PROJECT_DIR="server"
scalingo --app $SCALINGO_APP env-set NODE_ENV="production"
scalingo --app $SCALINGO_APP deploy $server_archive
# TODO: dev setup in de mode only
scalingo --app $SCALINGO_APP run '( NODE_ENV=development ; npm i @babel/register dotenv && npm run dev-setup )'
scalingo logout

exit
