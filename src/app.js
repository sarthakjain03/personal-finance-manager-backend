const express = require("express");

const app = express();

app.use("/test", (req, res) => { // This is called a route handler
    res.send("Testing the server");
});

app.use("/hello", (req, res) => {
    res.send("Testing the Helloooooo");
});

app.use("/", (req, res) => {
  res.send("Hello from the server");
});

app.listen(7777, () => {
  console.log("Server is running on port 7777...");
});
