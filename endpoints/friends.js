const express = require('express');
const mongoose = require('mongoose')
const cors= require('cors')
const jwt = require('jsonwebtoken')
const User = require('../models/user')

const Friend = require('../models/friend')

const friendsRouter = express.Router();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db=mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));









friendsRouter.use(express.json());
friendsRouter.use(cors())

friendsRouter.post('/request',async(req,res)=>{

    

    const from= jwt.verify(req.body.token, "THISISMYSECRETKEY");

    const Friends = await Friend.findOne({user1: from.userid, user2: req.body.to });

    if(Friends && !Friends.request)
    {
        const newMsg = await Friend.create({ user1: from.userid, user2:req.body.to, request:true });
    }
    else if(!Friends){

        const newMsg = await Friend.create({ user1: from.userid, user2:req.body.to, request:true });

    }
    res.json({

    });

})

friendsRouter.get('/getrequest',async(req,res)=>{

    const {token} = req.headers;

    const from= jwt.verify(token, "THISISMYSECRETKEY");

    let allRequest = await Friend.find({$or :[{user2:from.userid, request:true}]});

   
      
    // let allRequest2 = await Friend.find({user1:from.userid,request: true});
    // console.log('allrequest2',allRequest2)

    // await Promise.all(allRequest2.map(async (elem) => {
    //     allRequest.push({...elem._doc,flag:true});
    // }))

    // console.log(allRequest)

    if(allRequest.length>0){
        const users=[];
        await Promise.all(allRequest.map(async (elem) => {
            
                
           
            const user = await User.findOne({$or:[{ _id: elem.user1}]});
            
            users.push(user);
            
            
        }));

        res.json({users});
    }

    else
    res.json({users:[]});
    //     res.json({users})
    // }
    // else 
    
})

friendsRouter.get('/sentrequest', async(req,res)=>{

    const {token} = req.headers;

    const from= jwt.verify(token, "THISISMYSECRETKEY");

    let allRequest = await Friend.find({$or :[{user1:from.userid, request:true}]});

    if(allRequest.length>0){
        const users=[];
        await Promise.all(allRequest.map(async (elem) => {
            
                
           
            const user = await User.findOne({$or:[{ _id: elem.user2}]});
            
            users.push(user);
            
            
        }));

        res.json({users});
    }

    else
    res.json({users:[]});



})

friendsRouter.get('/getfriends',async(req,res)=>{

    const {token} = req.headers;

    const from= jwt.verify(token, "THISISMYSECRETKEY");

    

    let allRequest = await Friend.find({user2:from.userid,areFriends: true});
   
    
        
    let allRequest2 = await Friend.find({user1:from.userid,areFriends: true});
    

    await Promise.all(allRequest2.map(async (elem) => {
        allRequest.push({...elem._doc,flag:true});
    }))

    

    if(allRequest.length>0){
        const users=[];
        await Promise.all(allRequest.map(async (elem) => {
            if(elem.areFriends===true){
            if (elem.flag)
            {
                const user = await User.findOne({ _id: elem.user2 });
                users.push(user);
            }
            else{
            const user = await User.findOne({ _id: elem.user1 });
            users.push(user);
            }
            }
        }));

        

        res.json({users})
    }
    else res.json({users:[]});
})

 friendsRouter.get('/accept',async(req,res)=>{

    const {token} = req.headers;

    
    const from= jwt.verify(token, "THISISMYSECRETKEY")

    console.log(from.userid, req.headers.id)

    const mid=await Friend.find({user2:from.userid,user1:req.headers.id, request:true});

    

    if(mid.length==0)
    {
        mid = await Friend.find({user1:from.userid,user2:req.headers.id, request:true});

        if(mid.length>0)
        {
            const allRequest = await Friend.updateOne({user1:from.userid,user2:req.headers.id, request:true},{user1:from.userid,user2:req.headers.id, request:false,areFriends: true});
        }
    }
    else {
    
    const allRequest = await Friend.updateOne({user2:from.userid,user1:req.headers.id, request:true},{user2:from.userid,user1:req.headers.id, request:false,areFriends: true});

    }

    res.json({status:'successful'})

})

friendsRouter.get('/reject',async(req,res)=>{

    const {token} = req.headers;

    const from= jwt.verify(token, "THISISMYSECRETKEY");

    

    
    const allRequest2 = await Friend.deleteOne({$or:[{user2:from.userid,user1:req.headers.id, areFriends:true},{user1:from.userid,user2:req.headers.id, areFriends:true}]});
  
    
    const allRequest = await Friend.deleteOne({$or:[{user2:from.userid,user1:req.headers.id, request:true},{user1:from.userid,user2:req.headers.id, request:true}]});

    res.json({status:'successful'})

})

module.exports = friendsRouter;

