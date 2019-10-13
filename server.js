const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const logger = require('morgan');
const axios = require("axios");
const cheerio = require("cheerio");

const db = require("./models");

const PORT = process.env.PORT || 8000;
const app = express();

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

mongoose.connect("mongodb://localhost/nyt-scraper", { useNewUrlParser: true });

const routes = require('./routes/routes.js');
app.use(routes);


app.listen(PORT, () => {
    console.log(`🌎 ==> Server now on port ${PORT}!`);
});