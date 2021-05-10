// Setup app and port
const express = require('express');
const app = express();
const port = process.env.PORT || 8000;

// Setup server and socket.io
const server = require('http').Server(app);
const io = require('socket.io')(server);
app.locals.io = io;

// Listen to port
server.listen(port);

// Use CORS
const cors = require('cors');
app.use(cors());

// Use body parser
app.use(express.json());
app.use(express.text());

// Use cookie parser
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// Use compression
const compression = require('compression');
app.use(compression());

// Disable x-powered-by header
app.disable('x-powered-by');

// Setup for rate limiter
app.set('trust proxy', 1);

// Redirect to secure if request is not secure and not localhost
if(port == process.env.PORT){
	app.enable('trust proxy'); // Enable reverse proxy support
	app.use((req,res,next) => {
		if(req.secure) next();
		else res.redirect(301, `https://${req.headers.host}${req.url}`);
	});
}

// Setup and connect to DB
const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
require('dotenv/config');
mongoose.connect(process.env.DB_CONNECTION, {useNewUrlParser: true, useUnifiedTopology: true}, () => {
    console.log('Connected to database!');
});

// Serve static files
app.use('/static', express.static(`${__dirname}/public/static`));

// Use routes
const statusRoute = require('./routes/statuses');
const userRoute = require('./routes/users');
app.use('/status', statusRoute);
app.use('/user', userRoute);

// Serve home page
app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/public/index.html`);
});

// Send 404 page if page not found, has to be last route
app.get('*', (req, res) => {
    res.status(404).sendFile(`${__dirname}/404.html`);
});