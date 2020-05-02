#!/bin/bash
SCALINGO_API_TOKEN_FRONT=${SCALINGO_API_TOKEN_FRONT:?SCALINGO_API_TOKEN_FRONT not set!}
SCALINGO_APP_FRONT=${SCALINGO_APP_FRONT:?SCALINGO_APP_FRONT not set!}
SCALINGO_API_TOKEN_BACK=${SCALINGO_API_TOKEN_BACK:?SCALINGO_API_TOKEN_BACK no set!}
SCALINGO_APP_BACK=${SCALINGO_APP_BACK:?SCALINGO_APP_BACK not set !}

echo "# Prepare archive"
VERSION=$(git describe --tags --always)
git archive --prefix=master/ $VERSION -o master.tar.gz --format tar.gz

SCALINGO_API_TOKEN=$SCALINGO_API_TOKEN_FRONT
SCALINGO_APP=$SCALINGO_APP_FRONT
echo "# Deploy client $SCALINGO_APP"
scalingo login --api-token $SCALINGO_API_TOKEN
scalingo --app $SCALINGO_APP env-set NODE_OPTIONS="--max_old_space_size=2048"
scalingo --app $SCALINGO_APP env-set PROJECT_DIR="client"
scalingo --app $SCALINGO_APP env-set NODE_ENV="development"
scalingo --app $SCALINGO_APP env-set API_HOST=$SCALINGO_APP_BACK.osc-fr1.scalingo.io
scalingo --app $SCALINGO_APP env-set API_PORT=80
scalingo --app $SCALINGO_APP deploy master.tar.gz
#
SCALINGO_API_TOKEN=$SCALINGO_API_TOKEN_BACK
SCALINGO_APP=$SCALINGO_APP_BACK
echo "# Deploy server $SCALINGO_APP"
scalingo login --api-token $SCALINGO_API_TOKEN
scalingo --app $SCALINGO_APP env-set NODE_OPTIONS="--max_old_space_size=2048"
scalingo --app $SCALINGO_APP env-set PROJECT_DIR="server"
scalingo --app $SCALINGO_APP env-set NODE_ENV="development"
scalingo --app $SCALINGO_APP deploy master.tar.gz
scalingo --app $SCALINGO_APP run 'npm i @babel/register && npm i dotenv && npm run dev-setup'
