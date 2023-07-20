podman build -t node-kv .
podman volume create node-kv__opt__app__dist
podman volume create node-kv__opt__app__data

cp app.js ~/.local/share/containers/storage/volumes/node-kv__opt__app__dist/_data
chmod +x entrypoint.sh
chmod +x update.sh
chmod +x run.sh
chmod +x remove_db.sh
