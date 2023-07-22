const http = require('http');
const sqlite3 = require('sqlite3').verbose();
const hostname = '0.0.0.0';
const port = 80;

const ALLOWED_FIELDS = ["key", "value", "created", "updated", "last_active", "ttl", "active"];
const ALLOWED_CHARACTERS = /^[a-zA-Z0-9\/\.,@~()_\-:;*]*$/;

const DEFAULT_FORMAT = ""; // empty string "" means default is JSON
const DEFAULT_TTL = "0";
const DEFAULT_VALUE = "";


// ** Functions for validating sanity **


const isCleanSelector = selector => ALLOWED_FIELDS.includes(selector);
const areCleanSelectors = selectorString => selectorString.split(",").every(isCleanSelector);
const isCleanValue = inputString => ALLOWED_CHARACTERS.test(inputString);
const isCleanList = inputList => inputList.every(isCleanValue);
const isCleanTTL = value => (Number.isInteger(value) && value >= 0) || (typeof value === 'string' && Number.isInteger(parseInt(value)) && parseInt(value) >= 0);


const pathExtract = path => {
  if (path == undefined || path.length === 0 || path === "/") { return ["", []]; };
  if (path[0] !== "/") { return ["invalid", []]; };
  let temp = path.slice(1);
  if (temp.length === 1) { return [temp, []]; };
  if (temp[temp.length-1] === "/") { temp = temp.slice(0, temp.length-1); };
  const path_list = temp.split("/");

  return [path_list[0], path_list.slice(1)];
};


const isCleanPostBody = postBody => { // returns an errorMsg
  let jsonObj;
  try { jsonObj = JSON.parse(postBody); }
  catch(err) { return "Invalid JSON in request body, could not parse string"; }

  if (typeof jsonObj === 'object') {
    if (Array.isArray(jsonObj)) { if (!isCleanList(jsonObj)) { return "Invalid array in request body"; }; }
    else {
      for (let key in jsonObj) {
        if (jsonObj.hasOwnProperty(key)) {
          const key_data = jsonObj[key];
          const ttl = key_data.ttl ? key_data.ttl : DEFAULT_TTL;
          const value = key_data.value ? key_data.value : DEFAULT_VALUE;
          if (!isCleanValue(key) || !isCleanValue(value) || !isCleanTTL(ttl)) { return "Invalid character in key, TTL or value"; };};};};}
  else { return "Invalid JSON in request body"; }

  return ""; // postBody is clean since no errorMsg
};

const getSelectors = selectorString => {
  let selected = "";
  if (selectorString == undefined || selectorString === "*") { selected = "*"; }
  else if (areCleanSelectors(selected)) {
    selected = "key,value"
    for (let n=2; n<ALLOWED_FIELDS.length; n++) { if (selectorString.split(",").includes(ALLOWED_FIELDS[n])) { selected += "," + ALLOWED_FIELDS[n]; };};};
  
  return selected === "" ? "*" : selected;
};


// ** Response functions **

const traverseJSON2HTML = ({msgJSON, attributes}) => {
  let html = "<center><table width='80%'>";
  if (msgJSON.message.items != undefined && msgJSON.message.items.length > 1) {
    const items = msgJSON.message.items;
    html += "<tr align='left'>" + attributes.map(attr => `<th>${attr}</th>`).join('') + "</tr>";
    items.forEach(item => { html += "<tr>" + attributes.map(attr => `<td>${item[attr]}</td>`).join('') + "</tr>"; });} 
  else {
    html += "<tr><th>KEY</th><th>VALUE</th></tr>";
    const keys = Object.keys(msgJSON);
    keys.forEach(key => {
      html += `<tr><td>${key}</td>`;
      let value = msgJSON[key];
      html += typeof value === "string" ? `<td>${value}</td></tr>` : `<td>${JSON.stringify(value)}</td></tr>`; });};
  html += "</table></center>";

  return html;
};

const traverseJSON2CSV = ({msgJSON, attributes}) => {
  let csv;
  if (msgJSON.message.items != undefined && msgJSON.message.items.length > 1) {
    const items = msgJSON.message.items;
    csv = attributes.join(",") + "\n";
    items.forEach(item => {  csv += attributes.map(attr => `"${item[attr]}"`).join(",") + "\n"; });}
  else {
    csv = "KEY,VALUE\n";
    const keys = Object.keys(msgJSON);
    keys.forEach(key => {
      let value = msgJSON[key];
      csv += `"${key}",`;
      csv += typeof value === "string" ? `"${value}"\n` : `"${JSON.stringify(value)}"\n`; });};

  return csv;
};

const sendResponse = ({statusCode, msgJSON, res, format, attributes}) => {
  if (format == "html") {
    res.writeHead(statusCode, {'Content-Type': 'text/html'});
    res.end(traverseJSON2HTML({msgJSON, attributes})); }
  else if (format == "csv") {
    res.writeHead(statusCode, {'Content-Type': 'text/csv'});
    res.end(traverseJSON2CSV({msgJSON, attributes})); }
  else {
    res.writeHead(statusCode, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(msgJSON)); };
};

const sendOKResponse = ({messageValue, res, format=DEFAULT_FORMAT, attributes=["KEY","VALUE"]}) => { sendResponse({ statusCode: 200, msgJSON: {"status": "ok", "message": messageValue}, res, format, attributes}); };
const sendErrorResponse = ({statusCode, msgString, res, format=DEFAULT_FORMAT, attributes=["KEY","VALUE"]}) => { sendResponse({ statusCode, msgJSON: {"status": "error", "message": msgString}, res, format, attributes}); };

const handleDataStream = req => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => { resolve(body); });
    req.on('error', (err) => { reject(err); });});
};


const handleSelectResponse = ({err, rows, res, format=DEFAULT_FORMAT, attributes}) => {
  if (err) { sendErrorResponse({statusCode: 500, msgString: `Failed with SQL query: ${err.message}`, res, format, attributes}); }
  else if (!rows || rows.length === 0) { sendOKResponse({messageValue: {}, res, format, attributes}); }
  else {
    const items = rows.map(row => ({
      key: row.key,
      value: row.value,
      created: row.created,
      updated: row.updated,
      ttl: row.ttl,
      last_active: row.last_active,
      active: row.active
    }));
    sendOKResponse({messageValue: {items}, res, format, attributes}); };
};


// ** Other functions **


const getKeys = ({httpBody, query_keys_list, path_keys_list}) => {
  let keys = [];
  if (httpBody === undefined || httpBody === "" || httpBody === "{}" || httpBody === "[]" || httpBody.length === 0) { keys = query_keys_list.length>0 ? query_keys_list : path_keys_list; }
  else { let jsonObj = JSON.parse(httpBody); if (Array.isArray(jsonObj)) { keys = jsonObj; } };

  return keys;
};


// ** SQLite3 functions **


const db = new sqlite3.Database('/opt/app/data/kvstore.db', (err) => {
  if (err) { console.error(err.message); process.exit(1); }
  console.log('Connected to the kvstore.db database.');
});


const server = http.createServer(async (req, res) => {
  const method = req.method;
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;
  const urlquery = parsedUrl.searchParams;
  let [root_path, path_keys_list] = pathExtract(pathname);
  const query_keys_list = urlquery.get("keys") ? urlquery.get("keys").split(",") : [];
  const query_values_list = urlquery.get("values") ? urlquery.get("values").split(",") : [];
  const query_ttls_list = urlquery.get("ttls") ? urlquery.get("ttls").split(",") : [];
  const format = urlquery.get("format") === "html" ? "html" : "json";
  let httpBody = await handleDataStream(req);
  httpBody = httpBody ? httpBody : "{}";
  let isOK = true;
  
  // Sanity checks
  let errorMsg = isCleanPostBody(httpBody);
  if (root_path === "invalid" || !isCleanValue(root_path)) { isOK = false; errorMsg = "Cannot recognise resource in URL"; }
  else if (!path_keys_list.every(isCleanValue)) { isOK = false; errorMsg = "Key in URL path has invalid character"; }
  else if (!query_keys_list.every(isCleanValue)) { isOK = false; errorMsg = "Key in URL query has invalid character"; }
  else if (!query_ttls_list.every(isCleanTTL)) { isOK = false; errorMsg = "Invalid TTL value in HTTP query"; }
  else if (!query_values_list.every(isCleanValue)) { isOK = false; errorMsg = "Invalid character in values"; }
  else if (urlquery.get("selectors") != undefined && !areCleanSelectors(urlquery.get("selectors"))) { isOK = false; errorMsg = "Invalid selector"; }
  else if (errorMsg !== "") { isOK = false; } // isCleanPostBody

  if (httpBody !== "{}") {
    if (path_keys_list.length > 0) { isOK = false; errorMsg = "Cannot have keys in both HTTP body and URL path"; }
    else if (query_keys_list.length > 0) { isOK = false; errorMsg = "Cannot have keys in both HTTP body and URL query"; }
    else if (query_values_list.length !== 1) { isOK = false; errorMsg = "Mismatching values in HTTP body and URL query"; }
    else if (query_ttls_list.length !== 1) { isOK = false; errorMsg = "Mismatching ttls in HTTP body and URL query"; }; }
  else if (path_keys_list.length > 0 && query_keys_list.length > 0) { isOK = false; errorMsg = "Mismatching keys in URL path and URL query"; }
  
  // Init
  const value_default = query_values_list.length ? query_values_list[0] : ""; 
  const ttl_default = query_ttls_list.length ? query_ttls_list[0] : "0";
  const timeNow = Date.now();
  let dataToInsert = [];

  // Main
  if (isOK) {
    if (root_path == "store") {

      // CREATE
      if (method === "POST" || (method === "GET" && urlquery.get("cmd") === "create")) {
        if (method === "POST") {
          const jsonObj = JSON.parse(httpBody);
          for (let key in jsonObj) {
            if (jsonObj.hasOwnProperty(key)) {
              const key_data = jsonObj[key];
              let value = key_data.value ? key_data.value : value_default;
              let ttl = parseInt(key_data.ttl ? key_data.ttl : ttl_default);
              dataToInsert.push([key, value, timeNow, timeNow, ttl, timeNow, 1]);};};}
        else {
          const keys = query_keys_list.length>0 ? query_keys_list : path_keys_list;
          for (let n = 0; n < keys.length; n++) {
            const key = keys[n];
            const value = query_values_list[n] ? query_values_list[n] : value_default;
            const ttl = query_ttls_list[n] ? query_ttls_list[n] : ttl_default;
            dataToInsert.push([key, value, timeNow, timeNow, ttl, timeNow, 1]);};};
        
        if (dataToInsert.length > 0) {
          let sql = `INSERT ${urlquery.get("replace") === "true" ? "OR REPLACE" : ""} INTO kvstore (key, value, created, updated, ttl, last_active, active) VALUES `;
          const valueSets = dataToInsert.map(row => `('${row.join("', '")}')`);
          sql += valueSets.join(", ");

          db.run(sql, [], err => {
            if (err) { isOK = false; sendErrorResponse(500, "Failed inserting data", res); }
            else { sendOKResponse("Success inserting data", res); };});}
        else { sendErrorResponse(400, "Empty insert requested") };};

      // READ
      if (method === "GET" && (urlquery.get("cmd") === "read" || urlquery.get("cmd") == undefined)) {
        const keys = getKeys(httpBody, query_keys_list, path_keys_list);
        let sql = `UPDATE kvstore SET last_active=${timeNow} WHERE active=1 AND (${timeNow}<last_active+ttl OR ttl=0)`;
        if (keys.length>0) { sql += ` AND key IN (${keys.map(key => `'${key}'`).join(",")})`};
        sql += ";";

        db.run(sql, err => {
          if (err) { isOK = false; sendErrorResponse(500, "Failed update activity before read", res); }
          else {
            const select = getSelectors(getSelectors(urlquery.get("selectors")));
            sql = keys.length === 0 ? `SELECT ${select} FROM kvstore;` : `SELECT ${select} FROM kvstore WHERE key IN (${keys.map(key => `'${key}'`).join(", ")}) AND active=1 AND (${timeNow}<last_active+ttl OR ttl=0);`;
            db.all(sql, [], (err, rows) => { handleSelectResponse(err, rows, res, format); });};});};

      // UPDATE
      if (method === "PUT" || (method === "GET" && urlquery.get("cmd") === "update")) {
        if (method === "GET") {
          const keys = query_keys_list.length>0 ? query_keys_list : path_keys_list;
          for (let n = 0; n < keys.length; n++) {
            const key = keys[n];
            const value = query_values_list[n] ? query_values_list[n] : value_default;
            const ttl = query_ttls_list[n] ? query_ttls_list[n] : ttl_default;
            dataToInsert.push([key, value, ttl]); };}
        else {
          const jsonObj = JSON.parse(httpBody);
          for (let key in jsonObj) {
            if (jsonObj.hasOwnProperty(key)) {
              const key_data = jsonObj[key];
              let value = key_data.value ? key_data.value : value_default;
              let ttl = parseInt(key_data.ttl ? key_data.ttl : ttl_default);
              dataToInsert.push([key, value, ttl]); };};};
        
        for (let i = 0; i < dataToInsert.length; i++) {
          const [key, value, ttl] = dataToInsert[i];
          const sql = `UPDATE kvstore SET value = ?, updated = ?, ttl = ?, last_active = ? WHERE key = ? AND active=1 AND ${timeNow}<last_active+ttl`;
          db.run(sql, [value, timeNow, ttl, timeNow, key], err => { if (err) { sendErrorResponse(500, "Failed updating data", res); } else { sendOKResponse("Success updating data", res); }});};};

      // DELETE
      if (method === "DELETE" || (method === "GET" && urlquery.get("cmd") === "delete")) {
        let keys = getKeys(httpBody, query_keys_list, path_keys_list);
        const sql = keys.length === 0 ? `DELETE FROM kvstore WHERE active=0 OR (ttl>0 AND ${timeNow}>=last_active+ttl);` : `DELETE FROM kvstore WHERE key IN(${keys.map(key => `'${key}'`).join(", ")});`;
        db.run(sql, [], err => { if (err) { sendErrorResponse(500, "Failed deleting data", res); } else { sendOKResponse("Success deleting data", res); };});};

      // EXISTS
      if (method === "GET" && urlquery.get("cmd") === "exists") {
        let keys = getKeys(httpBody, query_keys_list, path_keys_list);
        const sql = `SELECT key FROM kvstore WHERE active=1 AND (ttl=0 OR ${timeNow}<last_active+ttl)` + (keys.length === 0 ? ";" : ` AND key IN(${keys.map(key => `'${key}'`).join(", ")});`);
        db.all(sql, [], (err, rows) => { handleSelectResponse(err, rows, res, format); });};

      // PING
      if (method === "PATCH" || (method === "GET" && urlquery.get("cmd") === "ping")) {
        let keys = getKeys(httpBody, query_keys_list, path_keys_list);
        if (keys.length>0) {
          const sql = `UPDATE kvstore SET last_active=${timeNow} WHERE active=1 AND ${timeNow}<last_active+ttl AND key IN(${keys.map(key => `'${key}'`).join(", ")});`;
          db.run(sql, [], err => { if (err) { sendErrorResponse(500, "Failed ping", res); } else { sendOKResponse("Ping successful", res); };});}
        else { sendErrorResponse(400, "Ping requires some keys", res); };};

      // INACTIVATE
      if ((method === "PATCH" || method === "GET") && urlquery.get("cmd") === "inactivate") {
        let keys = getKeys(httpBody, query_keys_list, path_keys_list);
        if (keys.length>0) {
          const sql = `UPDATE kvstore SET last_active=${timeNow}, active=0 WHERE active=1 AND ${timeNow}<last_active+ttl AND key IN(${keys.map(key => `'${key}'`).join(", ")});`;
          db.run(sql, [], err => { if (err) { sendErrorResponse(500, "Failed inactivation", res); } else { sendOKResponse("Successful inactivation", res); };});}
        else { sendErrorResponse(400, "Inactivation requires some keys", res); };};}
    else { sendOKResponse("Welcome!", res, "html"); };} // View index page
  else { sendErrorResponse(400, errorMsg, res); }; // Sanity check failed
});


server.listen(port, hostname, () => { console.log(`Server running at http://${hostname}:${port}/`); });
