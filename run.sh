#!/bin/bash
podman run -dt -p 8080:80 --name node-kv -v node-kv__opt__app__dist:/opt/app/dist:Z -v node-kv__opt__app__data:/opt/app/data node-kv
