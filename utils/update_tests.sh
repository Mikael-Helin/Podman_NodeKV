#!/bin/bash
cp ../testing/* ~/.local/share/containers/storage/volumes/node-kv__opt__app__testing/_data
cp ../src/app.js ~/.local/share/containers/storage/volumes/node-kv__opt__app__dist/_data
podman restart node-kv-test
