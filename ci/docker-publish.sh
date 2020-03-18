#!/bin/bash
set -e

basename=$(basename $0)
export SRC=${1:? $basename SRC DST VERSION}
export DST=${2:? $basename SRC DST VERSION}
export VERSION=${3:? $basename SRC DST VERSION}

echo "Publish $SRC $DST ${VERSION} docker images"
if [ -z "${DOCKER_USERNAME}" -o -z "${DOCKER_PASSWORD}" ] ; then
  echo "DOCKER_USERNAME et DOCKER_PASSWORD vide"
  exit 1
fi

echo ${DOCKER_PASSWORD} | docker login --password-stdin  --username ${DOCKER_USERNAME}
docker tag ${SRC} ${DST}:${VERSION}
docker push ${DST}:${VERSION}

exit $?
