#!/bin/bash
podman run -dt -p 8080:80 --name node-kv -v node-kv__opt__app__dist:/opt/app/dist:Z -v node-kv__opt__app__data:/opt/app/data node-kv:production

file=~/.local/share/containers/storage/volumes/node-kv__opt__app__data/_data/kvstore.db
if [ -f "$file" ]; then
    echo "Database sucessfully created."
else
    echo "Failed to create database."
fi
