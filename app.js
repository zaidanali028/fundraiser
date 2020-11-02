const { log } = require("console");
const express = require("express");
const app = express();
const mongoose=require('mongoose')
const path=require('path')
const port = 5050;
const ejs = require("ejs");
const uploader = require("express-fileupload");
const db = require("./config/keys");
const dbUrI = db.dbUrl;
const methodOverride = require("method-override");



//view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.set(express.static(path.join(__dirname, "public")));


//routes
const homeRoutes=require('./routes/home/index')
const adminRoutes=require('./routes/admin/index')

//body-parser
app.use(express.urlencoded({extended:false}))

//method override middleware
app.use(methodOverride("_method"));


//joining my public files with my app
app.use(express.static(path.join(__dirname, "./public")));


//route usages
app.use('/',homeRoutes)
app.use('/admin',adminRoutes)
//db connection
mongoose
  .connect(dbUrI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((connected) => {
    console.log("db connected");
  })

  app.use(function (req,res,next){
	res.status(404).render('admin/page404');
});

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
