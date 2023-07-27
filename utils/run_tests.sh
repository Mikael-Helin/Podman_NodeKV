#!/bin/bash
cp ../testing/*.js ~/.local/share/containers/storage/volumes/node-kv__opt__app__testing/_data

podman rm -f node-kv-test

podman run -t -p 8000:80 --name node-kv-test \
    -v node-kv__opt__app__dist:/opt/app/dist:Z \
    -v node-kv__opt__app__data:/opt/app/data:Z \
    -v node-kv__opt__app__testing:/opt/app/testing:Z \
    localhost/node-kv:testing
