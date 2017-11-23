#!/bin/bash
set -e
PATH=$(npm bin):$PATH

rm -rf ./.site
rm -rf ./.prerender
NODE_ENV=production webpack --config "$PWD/site/webpack.client.config.js"
NODE_ENV=production webpack --config "$PWD/site/webpack.prerender.config.js"
NODE_ENV=production ./scripts/renderPages.sh
