const express = require("express");
const fs = require("fs");
// const users = require("./MOCK_DATA.json");
const { error } = require("console");
const mongoose = require("mongoose");
const { type } = require("os");
const app = express();
const PORT= 8000;

//Connecting mongodb
const dbConnection = ()=>{
    mongoose.connect("mongodb://127.0.0.1:27017/my-app")
    .then(()=>
        console.log("mongo db connection is succesful")
    ).catch((err)=>console.log("Mongodb Error",err))
}
dbConnection();


//Defining Schema....
const UserSchema = new mongoose.Schema({
    firstName:{
        type: String,
        required: true,
    },
    lastName:{
        type:String,
        required: false,
    },
    Email:{
        type:String,
        required:true,
        unique:true,
    },
    jobTitle:{
        type:String,

    },
    gender:{
        type:String,

    }
},
{timestamps:true}) 
//Defining UserModel.... 
const User = mongoose.model("user",UserSchema);





//Middleware Or plugin
app.use(express.urlencoded({extended:false}));

app.use((req, res, next)=>{
    console.log("Hello from the middleware 1");
    next();
})

app.use((req, res, next)=>{
    console.log("Hello from the middleware 2");
    fs.appendFile("log.txt",`\nTime : ${Date.now()} From Ip: ${req.ip} Method: ${req.method} : From the Path of: ${req.path}`,(req,res)=>{
        next();
    })
    
})

app.use((req, res, next)=>{
    console.log("Hello from the middleware 3");
    // return res.end("Hey");
    next();
})
//Routes
app.get("/users",async (req,res)=>{
    const allDbUsers = await User.find({});
    const html = `
    <ul>
    ${allDbUsers.map((user)=>
        `<li>${user.firstName} - ${user.Email}</li>`
    ).join("")}
    </ul>
    `;
    res.send(html);
})



//Rest Api
app.get("/api/users" ,async (req, res)=>{
    const allDbUsers = await User.find({});
    res.setHeader("X-myname","chinmay");
    // Always add a X to the custoom headers...
    console.log(req.headers);
  return res.json(allDbUsers);
})

// app.get("/api/users/:id" , (req,res)=>{
//     const id = Number(req.params.id);
//     console.log(id);
//     const myuser = users.find((user)=>user.id===id) 
//     return res.json(myuser);

// })

//Find by id
app.route("/api/users/:id")
.get(async (req,res)=>{
    const user = await User.findById(req.params.id);
    if(!user){
        return res.status(404).json({error:"Users not found or User doesnot exist"});
    }
    return res.json(user);
    // const id= Number(req.params.id);
    // // console.log(id);
    // const myuser = users.find((user)=>user.id === id);
    // return res.json(myuser);
})
.patch((req,res)=>{

    return res.json({status:"Pending"});
})//delete request...
.delete((req,res)=>{
    const id = Number(req.params.id);
    console.log(id);
    // console.log(users);
    const myuserIndex = users.findIndex((user)=>user.id===id)
    console.log(myuserIndex);
    if(myuserIndex!==0){
        users.splice(myuserIndex, 1)
    }
   fs.writeFile("./MOCK_DATA.json" , JSON.stringify(users), (err,data)=>{
    if(err){
        console.log(err);
        return res.status(500).json({status:"error"});
    }
    return res.json({status:"Sucess"});
   })
    // return res.json({status:"Pending"});
})



//Now express don't know how to handle the datacome from the front end thats why we need to use the MIddleware(Plugins)
app.post("/api/users",async (req,res)=>{

    const body = req.body;
    if (!body||!body.first_name||!body.last_name||!body.email||!body.job_title||!body.gender)
        {
        res.status(400).json({msg:"All fields are required"});
    }
const result = await User.create({
    firstName:body.first_name,
    lastName:body.last_name,
    Email:body.email,
    jobTitle:body.job_title,
    gender:body.gender,
})
console.log("result",result);
return res.status(201).json({ msg:"success"})
   






    //Push tthe data to the users.. Come from the frontend as postman get request using a urlencoded middleware
    // users.push(
    //    {...body , id:users.length +1} 
    // );
    // console.log("Body" , body);
    // fs.writeFile("./MOCK_DATA.json", JSON.stringify(users),(err,data)=>{
    //     if(err){
    //         console.log(err);
    //         return res.status(500).json({status:"error"});
    //     }
    //     return res.json({status:"Sucess", id:users.length});
        
    // })
    
    // return res.json({status:"Pending"});
})  

app.listen(PORT, ()=>{
    console.log(`Server started at port ${PORT} `);
})