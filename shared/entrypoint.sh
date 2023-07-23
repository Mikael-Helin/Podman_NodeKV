#!/bin/bash

echo "Running entrypoint.sh"

DB_DIR=/opt/app/data
mkdir -p $DB_DIR

# Create table if necessary.
if [ "$(ls -A $DB_DIR)" ]; then
   echo "Data directory is not empty, skipping population."
else
   echo "Data directory is empty, populating initial data..."
   sqlite3 $DB_DIR/kvstore.db "CREATE TABLE kvstore (id INTEGER PRIMARY KEY AUTOINCREMENT, key TEXT NOT NULL UNIQUE CHECK(length(key) <= 40), value BLOB, created INTEGER NOT NULL, updated INTEGER NOT NULL, ttl INTEGER DEFAULT(0), last_active INTEGER NOT NULL, active BOOLEAN);"
fi

# Start your main application.
node /opt/app/dist/app.js
