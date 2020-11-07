



const toastr=require('toastr')
const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const port = 5050;
const flash = require("connect-flash");
const session = require("express-session");

const ejs = require("ejs");
const mongoose = require("mongoose");
const uploader = require("express-fileupload");

const db = require("./config/keys");
const dbUrI = db.dbUrl;

app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
    //cookie: { secure: true }
  })
);

//db connection
mongoose
  .connect(dbUrI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((connected) => {
    console.log("db connected");
  })
  .catch((err) => {
    console.log(err);
  });

//express-fileupload middleware
app.use(uploader());
//body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//static files
app.use(express.static(path.join(__dirname, "./public")));
//method override to be used for sending put requests
app.use(methodOverride("_method"));
//flash message
app.use(flash());

//view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.set(express.static(path.join(__dirname, "public")));



//Handling 404

//declaring local variables for displaying FLASH messages
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
 // res.locals.error = req.flash("error");
 // res.locals.user = req.user || null;

  next();
});
// //routes
const homeRoutes=require('./routes/home/index')
const adminRoutes=require('./routes/admin/index')

const { dbUrl } = require("./config/keys");

// //route usages
app.use('/',homeRoutes)
app.use('/admin',adminRoutes)
app.listen(port, () => {
  console.log(`server running on port ${port}`);
});
