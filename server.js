// server.js
const express = require('express');
const app = express();
const http = require('http');
const mongoose = require('mongoose')
const serverPort = process.env.PORT || 9000 ; // Change this to your desired port
const server = http.createServer(app); // Create an HTTP server
require('dotenv').config();




console.log(process.env.MONGO_URI);


mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', error => {
  console.error('Error in MongoDb connection: ' + error);})
db.on('connected', () => console.log('Data Db connected'));


// Import your API endpoints
const friendsEndpoint = require('./endpoints/friends');
const getchats = require('./endpoints/getchats');
const adduser = require('./endpoints/adduser');
const getPublicChats = require('./endpoints/getPublicChats');

// Import the initializeSocket function from trysockets.js
const initializeSocket = require('./endpoints/trysockets');

// Use the endpoint router as middleware
app.use('/friends', friendsEndpoint);
app.use('/getchats', getchats);
app.use('/getpublicchats', getPublicChats);
app.use('/allusers', adduser);

app.use(express.json())

app.get('/', (req, res) => {
  res.json('Hello');
});

// Initialize Socket.IO and use it as middleware
const io = initializeSocket(server);

// Start the server on port 9000
server.listen(serverPort, () => {
  console.log(`Server is listening on port ${serverPort}`);
});
