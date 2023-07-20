# Podman NodeKV

## Installation

First install key-value store image by

    sh install.sh

and then run the container by

    ./run.sh

then to check if it worked you should get kvstore.db listed

    ls -al ~/.local/share/containers/storage/volumes/node-kv__opt__app__data/_data/

As soon as you implemented changes to app.js and want to test it, run

    ./update.sh.

## Testing

With a web browser, browse to http://localhost:8080 to see the key value store tables with its values.

To insert from CLI type

    curl -X POST -d "car1=Toyota&car2=Fiat" http://localhost:8080/store

