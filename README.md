# Podman NodeKV

First install key-value store image by

    sh install.sh

and then run the container by

    podman run -d -p 8080:80 --name node-kv -v node-kv__opt__app__dist:/opt/app/dist:Z -v node-kv__opt__app__data:/opt/app/data node-kv

then to check if it worked you should get kvstore.db lsited

    ls -al ~/.local/share/containers/storage/volumes/node-kv__app/_data/data

As soon as you implemented changes to app.js and want to test it, run

    ./update.sh.

