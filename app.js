const http = require('http');
const url = require('url')
const sqlite3 = require('sqlite3').verbose();
const hostname = '0.0.0.0';
const port = 80;

const db = new sqlite3.Database('/opt/app/data/kvstore.db', (err) => {
  if (err) {
    console.error(err.message);
    process.exit(1);
  }
  console.log('Connected to the kvstore.db database.');
});

const db_insert = (key, value, res) => {
  db.run(`INSERT INTO kvstore(key, value, created, updated, active) VALUES(?, ?, ?, ?, ?)`,
    [key, value, Date.now(), Date.now(), true],
    function(err) {
      let msg;
      if (err) {
        msg = `ERROR: Failed to insert data: ${err.message}`;
        res.writeHead(500);
        res.end(JSON.stringify({msg}));
        return;
      }

      msg = 'OK: Insert successful';
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({key, value, msg}));
  });
};

const db_update = (key, value, res) => {
  db.run(`UPDATE kvstore SET value = ?, updated = ?, active = ? WHERE key = ?`,
    [value, Date.now(), true, key],
    function(err) {
      let msg;
      if (err) {
        msg = `ERROR: Failed to insert data: ${err.message}`;
        res.writeHead(500);
        res.end(JSON.stringify({msg}));
        return;
      }

      msg = 'OK: Update successful'
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({key, value, msg}));
  });
};

const db_inactivate = (key, res) => {
  db.run(`UPDATE kvstore SET updated = ?, active = ? WHERE key = ?`,
    [Date.now(), false, key],
    function(err) {
      let msg;
      if (err) {
        msg = 'ERROR: Failed to inactivate: ${err.message}'
        res.writeHead(500);
        res.end(JSON.stringify({msg}));
        return;
      }

      msg = 'OK: Inactivated'
      res.writeHead(200, {'Content-Type': 'application/text'});
      res.end(JSON.stringify({key, msg}));
  });
};

const db_select_active = (key, res) => {
  db.get(`SELECT value FROM kvstore WHERE key = ?, active = ?`,
    [key, true],
    function(err, row) {
      let msg;
      if (err) {
        msg = `ERROR: Failed to select data: ${err.message}`
        res.writeHead(500);
        res.end(JSON.stringify({msg}));
        return;
      }
      if (!row) {
        msg = 'OK: Active key not found'
        res.writeHead(404);
        res.end(JSON.stringify({msg}));
        return
      }

    const value = row.value
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({key, value}));
  });
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;

  // Handle PUT requests to /store/:key
  if (method === 'PUT' && path.startsWith('/store/')) {
    const key = path.slice('/store/'.length);

    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      const value = JSON.parse(body).value;
      db_insert(key, value, res);
        //db.run(`INSERT OR REPLACE INTO kvstore(key, value, created, updated, active) VALUES(?, ?, ?, ?, ?)`,
        //[key, value, Date.now(), Date.now(), true],
        //function(err) {
        //  if (err) {
        //    res.writeHead(500);
        //    res.end(`Failed to insert data: ${err.message}`);
        //    return;
        //  }

        // res.writeHead(200, {'Content-Type': 'application/json'});
        // res.end(JSON.stringify({key, value}));
      });
    return;
  }


  // Existing code for index page...
  db.serialize(() => {
    db.all(`SELECT * FROM kvstore`, (err, rows) => {
      if (err) { console.error(err.message); }

      res.setHeader('Content-Type', 'text/html');
      res.write('<html><body><center><table>');
      res.write('<tr><th>ID</th><th>KEY</th><th>VALUE</th><th>CREATED</th><th>UPDATED</th><th>ACTIVE</th></tr>');
      rows.forEach((row) => {
        res.write('<tr>');
        res.write('<td>' + row.id + '</td>');
        res.write('<td>' + row.key + '</td>');
        res.write('<td>' + row.value + '</td>');
        res.write('<td>' + row.created + '</td>');
        res.write('<td>' + row.updated + '</td>');
        res.write('<td>' + row.active + '</td>');
        res.write('</tr>');
      });
      res.write('</table></center></body></html>');
      res.statusCode = 200;
      res.end();
    });
  });
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

