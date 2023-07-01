const http = require('http');
const sqlite3 = require('sqlite3').verbose();
const hostname = '0.0.0.0';
const port = 80;

const db = new sqlite3.Database('/app/data/kvstore.db', (err) => {
  if (err) {
    console.error(err.message);
    process.exit(1);
  }
  console.log('Connected to the kvstore.db database.');
});

const server = http.createServer((req, res) => {
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

