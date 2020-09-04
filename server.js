// Setup app and port
const express = require('express');
var app = express();
var port = process.env.PORT || 8000;

// Enable compression
const compression = require('compression');
app.use(compression());

// Disable x-powered-by header
app.disable('x-powered-by');

// Redirect to secure if request is not secure and not localhost
if(port == process.env.PORT){
	app.enable('trust proxy'); // Enable reverse proxy support
	app.use((req,res,next) => {
		if(req.secure) next();
		else res.redirect(301,'https://'+req.headers.host+req.url);
	});
}

// Serves static files without .html extension
app.use(express.static('public', { extensions: ['html'] } ));

// Listen to port
app.listen(port);

// Connect to database
const { Client } = require('pg');
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});
client.connect();

/*client.query('SELECT table_schema,table_name FROM information_schema.tables;', (err, res) => {
  if (err) throw err;
  for (let row of res.rows) {
    console.log(JSON.stringify(row));
  }
  client.end();
});*/

// Send 404 page if page not found, has to be last route
app.get('*',(req,res) => {
    res.status(404).sendFile(__dirname+'/404.html');
});