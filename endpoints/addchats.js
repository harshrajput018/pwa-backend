const express = require('express')
const cors= require('cors')
const jwt = require('jsonwebtoken')
const Msg = require('../models/msg')






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