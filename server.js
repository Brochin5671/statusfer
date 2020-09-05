// Setup app and port
const express = require('express');
var app = express();
var port = process.env.PORT || 8000;

// Enable body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

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

// Import routes
const postsRoute = require('./routes/posts');

app.use('/status',postsRoute);

// Home page
app.get('/',(req,res) => {
    res.sendFile(__dirname+'/public/index.html');
})

// Connect to DB
const mongoose = require('mongoose');
require('dotenv/config');
mongoose.connect(process.env.DB_CONNECTION,
{ useNewUrlParser: true, useUnifiedTopology: true },
() => {
    console.log('connected to db');
});

// Listen to port
app.listen(port);

// Send 404 page if page not found, has to be last route
app.get('*',(req,res) => {
    res.status(404).sendFile(__dirname+'/404.html');
});