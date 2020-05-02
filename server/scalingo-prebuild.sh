#!/bin/bash
set -x
echo "# $(basename $0)"
echo "# set app version"
npm --no-git-tag-version version $(cat ../VERSION)
