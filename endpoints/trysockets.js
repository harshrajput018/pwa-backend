const jwt = require('jsonwebtoken');
const Msg = require('../models/msg');
const socketIo = require('socket.io');
const mongoose = require('mongoose');

function initializeSocket(server) {
  const io = socketIo(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"]
    },
    transports: ["websocket"],
  });

  const mapsidtouid = new Map();

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    

    var userid;

    // Authentication (Optional based on your requirements)
    try {

      const { token } = socket.handshake.auth;
      const decoded = jwt.verify(token, 'THISISMYSECRETKEY');
      userid = decoded.userid;
      mapsidtouid.set(userid, socket.id);
      console.log(`User ${userid} authenticated and mapped to socket ${socket.id}`);

      
    } catch (error) {
      console.error('Failed to authenticate socket:', error);
    }

    // Listen for a message from connected users
    socket.on('message', async (res) => {
      console.log('Event `send` triggered with data:', res);

      try {
        let newMsgData = {

          from: new mongoose.Types.ObjectId( userid ),
          // Adjust message data structure as per your requirement
          content: res.content.text || '',
          timeStamp: new Date(res.time), // Use the provided timestamp
          // Include sender details if authenticated
          type:res.type,
          username:res.username
          
        };

        if (res.content.videoData) {
          // Assuming you handle binary data for video
          newMsgData.videoData = res.content.videoData;
          console.log('Received video data length:', newMsgData.videoData.length);
        }

        console.log(newMsgData)

        // Create and save the new message
        const newMsg = new Msg(newMsgData);
        await newMsg.save();

        // Broadcast the message to all connected clients
        io.emit('message', { msgs: [newMsg] }); // Use a general event like 'message' for public chat
      } catch (error) {
        console.error('Error processing `send` event:', error);
      }
    });

    socket.on('send', async (res) => {
      console.log('Event `send` triggered with data:', res);

      try {
        const user = jwt.verify(res.fromtoken, 'THISISMYSECRETKEY');

        // Initialize the message object
        let newMsgData = {
          from: new mongoose.Types.ObjectId(user.userid), // Ensure correct object ID format
          to: new mongoose.Types.ObjectId(res.to), // Ensure correct object ID format
          content: res.content.text || '',
          timeStamp: new Date(res.time),
          type:'private',// Use the provided timestamp
        };

        if (res.content.videoData) {
          // Directly use the ArrayBuffer (binary data) received
          newMsgData.videoData = res.content.videoData;

          // No need to convert from base64; the data should be already in binary format
          console.log('Received video data length:', newMsgData.videoData.length);
        }

        // Create and save the new message
        const newMsg = new Msg(newMsgData);
        await newMsg.save();

        // Emit the latest message back to sender and receiver
        io.to(mapsidtouid.get(res.to)).emit('send', { msgs: [newMsg] });
        io.to(mapsidtouid.get(user.userid)).emit('send', { msgs: [newMsg] });
        
      } catch (error) {
        console.error('Error processing `send` event:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
}

module.exports = initializeSocket;
