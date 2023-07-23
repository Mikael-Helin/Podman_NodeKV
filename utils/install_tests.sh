#!/bin/bash
podman build -t node-kv:testing --target testing ..
podman volume create node-kv__opt__app__testing

cp ../testing/*.js ~/.local/share/containers/storage/volumes/node-kv__opt__app__testing/_data
