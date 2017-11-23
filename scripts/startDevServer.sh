#!/bin/bash
set -e
PATH=$(npm bin):$PATH

rm -rf ./.site
rm -rf ./.prerender
webpack --config "$PWD/site/webpack.prerender.config.js"
./scripts/renderPages.sh
webpack-dev-server --config "$PWD/site/webpack.client.config.js" --no-info --content-base .site --port ${1-8080}
