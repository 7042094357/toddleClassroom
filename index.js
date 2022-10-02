const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();

const projecctRoute = require('./actions');

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use('/v1',projecctRoute);

app.listen(3000, () => console.log("Server started"));