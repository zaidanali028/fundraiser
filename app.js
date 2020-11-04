




const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const port = 5050;
const ejs = require("ejs");
const mongoose = require("mongoose");
const uploader = require("express-fileupload");

const db = require("./config/keys");
const dbUrI = db.dbUrl;


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

//view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.set(express.static(path.join(__dirname, "public")));


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
