// trysockets.js
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Msg = require('../models/msg');
const socketIo = require('socket.io');

mongoose.connect('mongodb+srv://harshrajput18:Harsh1827@cluster0.efkiy6x.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Create a function to initialize Socket.IO and return the `io` instance
function initializeSocket(server) {
  const io = socketIo(server, {
    cors: {
      origin: "https://react-chatapp-rose.vercel.app",
      methods: ["GET", "POST"]
    }
  });

  const mapsidtouid = new Map();

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    const { token } = socket.handshake.auth;

    const userid = jwt.verify(token, 'THISISMYSECRETKEY');
    console.log(userid.userid);
    mapsidtouid.delete(userid.userid);
    mapsidtouid.set(userid.userid, socket.id);

    socket.on('send', async (res) => {
      const user = jwt.verify(res.fromtoken, 'THISISMYSECRETKEY');

      try {
        const newMsg = await Msg.create({ from: user.userid, to: res.to, content: res.content });
      } catch (error) {
        console.log(error);
      }

      const msg = await Msg.find({ $or: [{ from: user.userid, to: new mongoose.Types.ObjectId(res.to) }, { from: new mongoose.Types.ObjectId(res.to), to: user.userid }] });

      console.log(msg);

      console.log(mapsidtouid.get(res.to));
      io.to(mapsidtouid.get(res.to)).emit('send', {
        msgs: msg
      });
      io.to(mapsidtouid.get(user.userid)).emit('send', {
        msgs: msg
      });
    });

    socket.on('disconnect', () => {
      console.log('A user disconnected:', socket.id);
    });
  });

  return io; // Return the Socket.IO instance
}

module.exports = initializeSocket;
