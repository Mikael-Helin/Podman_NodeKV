# 3KV

3KV is a key-value storage solution, developed using Node.js and SQLite3 backend. It is designed to be immune to SQL injections by incorporating thorough sanitation of all user inputs. The primary target of this key-value store is to serve smaller web-based projects for production use. Its distinguishing feature is the ability to accept keys in three different ways - via the URL path, the URL query, and directly within the HTTP body, thus earning it the name 3KV.

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

