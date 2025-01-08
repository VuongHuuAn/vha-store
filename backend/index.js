// IMPORT FROM PACKAGES
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require('passport');

require("dotenv").config();
require('./routes/passport');
// IMPORT FROM OTHER FILES
const authRouter = require("./routes/auth");
const sellerRouter = require("./routes/seller");
const productRouter = require("./routes/product");
const userRouter = require('./routes/user');
const adminRouter = require("./routes/admin");
// INIT
const PORT = process.env.PORT;
const app = express();
const DB = process.env.MONGODB_URL;
// middleware
app.use(
  cors({
    // origin:  "https://vha-store-huuan.vercel.app", 
    origin:  "http://localhost:3001", 
    
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "x-auth-token", "Authorization"],
    credentials: true,
  })
);
app.use(express.json());
app.use(authRouter);
app.use(sellerRouter);
app.use(productRouter);
app.use(userRouter);
app.use(adminRouter);
app.use(passport.initialize());

// Connection
mongoose
  .connect(DB)
  .then(() => {
    console.log("Connection Mongodb Successful");
  })
  .catch((e) => {
    console.log(e);
    console.log("Failed to connect Mongodb");
  });

app.get("/", (req, res) => {
  res.send("Hello from Express!");
});

app.listen(PORT, () => {
  console.log(`connected at port ${PORT}`);
});
