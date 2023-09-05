const express = require('express')
const cors= require('cors')
const mongoose= require('mongoose')
const jwt = require('jsonwebtoken')
const Msg = require('../models/msg')



mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db=mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));


const app = express();

app.use(cors());

app.use(express.json())

app.post('/',async(req,res)=>{

    const {from,to,content} = req.body;

    

    const user= jwt.verify(from,'THISISMYSECRETKEY')

    

    try{
    
    res.json({message:'sent successfully'})
    }
    catch(error)
    {
        console.log(error);
        res.json({message:'an error occured'})
    }

})

module.exports= {Msg}