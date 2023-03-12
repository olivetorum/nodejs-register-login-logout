const express = require('express');
const path = require('path');
const mongoose = require('mongoose')
const User = require('./model/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


require('dotenv').config();
const jwtSecret= process.env.JWT_SECRET
const mongoConnect = process.env.MONGO_CONNECT

mongoose.connect(mongoConnect)
const app = express()
app.use('/', express.static(path.join(__dirname,'views')))
app.use(express.json())


app.post("/api/change-password", async(req,res)=>{
    const {token, newpassword:plainTextPassword} = req.body
    try{
    const user = jwt.verify(token,jwtSecret)
    const _id = user.id

    const password = await bcrypt.hash(plainTextPassword,10)
    await User.updateOne(
        {_id},
        {
            $set:{password}
        }
    )
    res.json({status:'ok'})
    }catch(error){
        res.json({status:"error",error:"uh oh stinky"})
    }

})

application.post('api/login', async(req,res)=>{

    const{username,password} = req.body

    const user = await User.findOne({username}).lean()

    if(!user){
        return res.json({status:"error",error:"Invalid Username or Password"})
    }

    if(await bcrypt.compare(password,user.password)){

        const token = jwt.sign({
            id: user._id, 
            username:user.username},
            jwtSecret)

        res.json({status:"ok",data:"COMING SOON"})
    }

    return res.json({status:"error",error:"Invalid Username or Password"})
})

app.post('/api/register',async(req,res)=>{
    console.log(req.body)

    const {username,email,password: plainTextPassword} = req.body

    if(!username || typeof username !== 'string'){
        return res.json({status:'error', error:'Invalid username.'})
    }
    if(!email || typeof email !== 'string'){
        return res.json({status:'error', error:'Invalid email.'})
    }
    if(!plainTextPassword || typeof plainTextPassword !== 'string'){
        return res.json({status:'error', error:'Invalid password.'})
    }
    if(plainTextPassword.length <5){
        return res.json({
            status:'error',
            error:'Password too short, must be at least 6 characters.'
        })
    }

    const password = await bcrypt.hash(plainTextPassword,10);
    

    try{
        const response = await User.create({
            username,
            email,
            password
        })
    }catch(error){
        if(error.code === 11000){
            return res.json({status:'error', error:'Username or email already in use.'})
        }
        console.log(JSON.stringify(error))
        return res.json({status:'error'})
    }

    res.json({status:'ok'})
})


app.listen(3000,()=>{
    console.log('server up at 3000')
})