const express= require('express')
const cors= require('cors')
const {Msg} = require('./addchats')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')







const Router=express.Router();

Router.use(cors());

Router.get('/',async(req,res)=>{
 

    const user= jwt.verify(req.headers.from,'THISISMYSECRETKEY')


    const msg= await Msg.find({$or:[{from:user.userid,to: new mongoose.Types.ObjectId(req.headers.to)},{from: new mongoose.Types.ObjectId(req.headers.to),to:user.userid}]});

    // const msg= await Msg.find({type:'public'});

    res.json({msgs: msg})
    
})


module.exports = Router