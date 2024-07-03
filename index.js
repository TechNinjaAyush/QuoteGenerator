import express from "express";
import bodyParser from "body-parser";
import mysql from "mysql";
import ejs from "ejs";

const app = express();
const port = 3000;

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "intel@core77",
  database: "quote"
});

db.connect((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("Successfully connected");
  }
});
//Designing a authentication page 
app.get("/" , (req , res )=>{
   res.render("authentication.ejs");

}) ; 
app.post("/login" ,(req , res)=>{
    let{email , password} = req.body ; 


}); 

app.post("/register" , (req , res)=>{
    let{email , password} = req.body ; 
    

}) ; 

app.listen(port, () => {
  console.log(`Server is running at port ${port}`);
});
