// require('dotenv').config()
const mongoose = require("mongoose");

// mongoose.connect('',{
// console.log(process.env.dataBase)
var url = "mongodb://localhost:27017/stockx";
mongoose.set("strictQuery", false);
mongoose
  .connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("mongoose connect successfully");
  })
  .catch((err) => {
    console.log(err);
  });
