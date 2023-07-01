# Podman NodeKV

Create the image and its volume

    podman build -t node-kv .
    podman volume create podman-kv__app
    cp app.js ~/.local/share/containers/storage/volumes/podman-kv__app/_data
    chmod +x entrypoint.sh
    cp -p entrypoint.sh ~/.local/share/containers/storage/volumes/podman-kv__app/_data

and run it

    podman run -d -p 8080:80 -v podman-kv__app:/app:Z node-kv

check if entrypoint.sh was run

    ls -al ~/.local/share/containers/storage/volumes/podman-kv__app/_data/
