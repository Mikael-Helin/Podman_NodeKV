podman stop node-kv
podman rm node-kv
podman build -t node-kv:production --target production ..
podman volume create node-kv__opt__app__dist
podman volume create node-kv__opt__app__data

cp ../src/app.js ~/.local/share/containers/storage/volumes/node-kv__opt__app__dist/_data

chmod +x ../shared/entrypoint.sh
chmod +x update.sh
chmod +x run.sh
chmod +x remove_db.sh
chmod +x install_tests.sh
chmod +x update_tests.sh
