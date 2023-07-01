#!/bin/bash

echo "Running entrypoint.sh"

DB_DIR=/app/data
mkdir -p $DB_DIR

# Create table if necessary.
if [ "$(ls -A $DB_DIR)" ]; then
   echo "Data directory is not empty, skipping population."
else
   echo "Data directory is empty, populating initial data..."
   sqlite3 $DB_DIR/kvstore.db "CREATE TABLE kvstore (id INTEGER PRIMARY KEY AUTOINCREMENT, key TEXT NOT NULL CHECK(length(key) <= 40), value BLOB, created INTEGER, updated INTEGER, active BOOLEAN);"
fi

# Start your main application.
exec node /app/app.js
