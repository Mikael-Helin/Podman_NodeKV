// Import sqlite3 module.
var sqlite3 = require('sqlite3').verbose();

// Create an in-memory database.
var db = new sqlite3.Database(':memory:');

// Query for the current time.
db.serialize(function() {
  db.each("SELECT datetime('now') as time", function(err, row) {
    if (err) {
      console.error(err);
    } else {
      console.log(row.time);
    }
  });
});

// Close the database after all queries are made.
db.close();
