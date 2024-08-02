const express = require("express");
const fs = require("fs");
const users = require("./MOCK_DATA.json");
const { error } = require("console");
const app = express();
const PORT= 8000;


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
app.get("/users", (req,res)=>{
    const html = `
    <ul>
    ${users.map((user)=>
        `<li>${user.first_name}</li>`
    ).join("")}
    </ul>
    `;
    res.send(html);
})



//Rest Api
app.get("/api/users" , (req, res)=>{
    res.setHeader("X-myname","chinmay");
    // Always add a X to the custoom headers...
    console.log(req.headers);
  return res.json(users);
})

// app.get("/api/users/:id" , (req,res)=>{
//     const id = Number(req.params.id);
//     console.log(id);
//     const myuser = users.find((user)=>user.id===id) 
//     return res.json(myuser);

// })


app.route("/api/users/:id")
.get((req,res)=>{
    const id= Number(req.params.id);
    // console.log(id);
    const myuser = users.find((user)=>user.id === id);
    return res.json(myuser);
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
app.post("/api/users",(req,res)=>{

    const body = req.body;
    //Push tthe data to the users.. Come from the frontend as postman get request using a urlencoded middleware
    users.push(
       {...body , id:users.length +1} 
    );
    console.log("Body" , body);
    fs.writeFile("./MOCK_DATA.json", JSON.stringify(users),(err,data)=>{
        if(err){
            console.log(err);
            return res.status(500).json({status:"error"});
        }
        return res.json({status:"Sucess", id:users.length});
        
    })
    
    // return res.json({status:"Pending"});
})  

app.listen(PORT, ()=>{
    console.log(`Server started at port ${PORT} `);
})