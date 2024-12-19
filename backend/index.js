const  express  =  require("express")  ; 
const cors = require("cors") ;  
const bcrypt =  require('bcrypt') ; 
const jwt = require("jsonwebtoken") ;  

const app = express() ;   
 
const  {todoModel , userModel  } = require("./db") ;   

const corsOptions = {
    origin: "*", // Allow requests from any origin (use '*' for testing; restrict in production)
    methods: ["GET", "POST", "PUT" , "DELETE"], // Allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
  };
  
app.use(cors(corsOptions));

app.use(express.json()) ;   

const authMiddleware =  async (req,res,next) =>  { 

    try {
      
    const authHeader = req.headers.authorization ; 
    if(!authHeader){ 
        throw new Error("Authorization header is missing") 
    } 

    const token  = req.headers.authorization.split(" ")[1] ; 

    if(!token) { 
        throw new  Error("Token is missing");
    } 
        

    jwt.verify(token, "praveen@2006"  , (error,result) => { 
        if(error) { 
            res.json({success:'false' ,  message:'authentication error'} ) ; 
            return ; 
        } 
        if(result) { 
            req.userId = result.userId ; 
            next() ; 
            return  ; 
        }
     }  ) 
     
    } 
    catch(e) {  
        res.json({success:'false' , message:`${e.message}`})  ; 
        return ;
    }
   }

app.get("/user/todo" , authMiddleware ,   async  (req,res) => {    

    try {  

   let userId = req.userId ; 

   let user = userModel.findOne({_id:userId}) ;
 
   if(!user) {
    res.json({success:'false' , message: 'authentication error' }) ; 
   }

   console.log("fetching todos")
   const todos = await todoModel.find({userId:userId}) ;   
   console.log("todos fetched") ;
   res.json({success:"true" ,  todos:todos})  ; 
   return ; 
    } 
    catch(error) { 
        console.log(error) ; 
        res.json({success:"false"})
    }
})   

app.post("/user/todo" ,authMiddleware ,  async (req,res)=> {   
    try{  
        let userId = req.userId ; 

        let user = userModel.findOne({_id:userId}) ;
      
        if(!user) {
         res.json({success:'false' , message: 'authentication error' }) ; 
        } 

    const { title , description } =  req.body ;  
    console.log(title) ; 
    console.log("creating new todo "); 
    await todoModel.create( { title:title  , description:description , userId : userId  })  ;  
    
    res.json({success:"true"  })  ;   
    return ; 
}    
     catch(error) {   
        console.log(error) ; 
        res.json({success:"false"}) ; 
        return  ;
     }
}) 

app.delete("/user/todo" ,authMiddleware,   async (req,res) => {   
     
    try{ 
        let userId = req.userId ; 

        let user = userModel.findOne({_id:userId}) ;
      
        if(!user) {
         res.json({success:'false' , message: 'authentication error' }) ; 
        }  

    const todoId = req.query.id ;  
    console.log(todoId) ; 
    const result = await todoModel.deleteOne({_id: todoId  , userId : userId  })   ;  

    if(result.deletedCount === 0 ) {  
        res.json({message:'todoId is incorrect or not authorized to delete the todo'})
    }
    res.json({success:'true'}) ; 
    return  ; 
} 
    catch(e) {  
        console.log(e) ; 
        res.json({success:"false"}) ; 
        return  ; 
    } 
} ) 

app.put("/user/todo" , authMiddleware,   async(req,res) => { 
   
    try{ 

        let userId= req.userId ; 

        let user = userModel.findOne({_id:userId}) ;
      
        if(!user) {
         res.json({success:'false' , message: 'authentication error' }) ; 
        }     

       


      const todoId = req.query.id ;   
      const {title , description} = req.body ; 
       console.log(todoId) ; 

       let authCheck = todoModel.findOne({_id:todoId , userId: userId  } )  

       if(!authCheck) { 
        res.json({message:"you are not authorised to update this or invalid parameters passed", success :'false' }  ) ; 
        return ; 
        }
      

       let updatedTodo = await todoModel.updateOne(  { _id: todoId   }  ,  {  title : title ,  description: description  }  )
       console.log("todo edited") ; 
       res.json({ success:'true' }) ; 
       return  ; 
    } 
    catch(e) {  
         console.log(e) ; 
        res.json({ success : 'false' })
    }
 })


 app.post("/auth/signup" ,  async(req,res) => { 

    try{ 
    const {username , password } = req.body ;   

    

    let user = await userModel.findOne({username:username}) ; 

    if(user) { 
     res.json( { message: "username is alreay in use " , success:'false'  }    ) ; 
     return ; 
    }   
    
    const salt  = await bcrypt.genSalt(10) ; 
    const hashedPassword   = await bcrypt.hash(password,salt) ; 
    
    await userModel.create( { username: username , password:hashedPassword }) ; 

    res.json({success:'true', message: 'account created successfully'}) ; 
}  

    catch(e) {
        console.log(e) ; 
        res.json({success:"false" , message:'internal server error'}) ; 
    } 

 } )  

app.post("/auth/signin" ,async (req,res) => {   
  
try{
  const {username , password} = req.body ; 
   
  let user = await  userModel.findOne({username:username}) ; 
    
 
  if(user ) {  
    
    let compare =  bcrypt.compare(password,user.password)  ; 

    if(!compare) { 
        res.json({ success:'false' , message:'invalid password'  }) ; 
        return  ; 
    }
     
    const jwt_payload = { userId : user._id } 
    const token  = jwt.sign( jwt_payload , "praveen@2006" ) ;     
    res.json({ success:'true' , message:'signed in successfully'  , token:token }) ;  
    return  ; 

  } 

  else { 
    res.json({success:'false' , message:'invalid  username '})
  }      
  } 
 
  catch(e) { 
  console.log(e) ; 
res.json({message:"internal server error" ,  success:'false' } ) ; 
return ; 
} 
}
) ; 



app.listen(8000) ;  