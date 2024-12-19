const mongoose = require("mongoose")   

const {Schema,  model , Types} = mongoose ; 
 
  mongoose.connect("mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.3.1").then(()=>{ console.log("connected to mongodb")  }).catch((error) => { console.error("error connecting to mongodb:" ,  error )  }) ;    

  const todoSchema  = new Schema({    
    title:String ,  
    description: String , 
    completed:  { type: Boolean  ,   default: false }  ,
    userId: { type: Types.ObjectId ,  ref:'user'}
   }) 
  

   const userSchema = new Schema( { 
    username:{type: String  , unique: true  } , 
    password: String    

   })

const todoModel = model("Todo" ,  todoSchema  ) ; 
const userModel = model("User" ,  userSchema) ; 

module.exports =  { todoModel  , userModel  } 