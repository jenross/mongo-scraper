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

mongoose.connect("mongodb://localhost/nyt-scraper", { useNewUrlParser: true });

// Define API routes here
app.get("/scrape", function(req, res) {
    // First, we grab the body of the html with axios
    axios.get("https://www.nytimes.com/section/books").then(function(response) {
      // Then, we load that into cheerio and save it to $ for a shorthand selector
      let $ = cheerio.load(response.data);
  
      // Now, we grab every h2 within an article tag, and do the following:
      $("div.css-1l4spti").each(function(i, element) {
        // Save an empty result object
        let result = {};
  
        // Add the text and href of every link, and save them as properties of the result object
        result.title = $(this)
            .children()
            .children("h2")
            .text().trim();
        result.link = $(this)
            .children()
            .attr("href");
        result.description = $(this)
            .children()
            .children("p")
            .text().trim();

        // Create a new Article using the `result` object built from scraping
        db.Articles.create(result)
          .then(function(dbArticles) {
            // View the added result in the console
            console.log(dbArticles);
          })
          .catch(function(err) {
            // If an error occurred, log it
            console.log(err);
          });
      });
  
        // Send a message to the client
        res.send("Scrape Complete");
    });
});
  
// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
// Grab every document in the Articles collection
    db.Articles.find({})
        .then(function(dbArticles) {
        // If we were able to successfully find Articles, send them back to the client
        res.json(dbArticles);
        })
        .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
    });
});
  
// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
// Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.Articles.findOne({ _id: req.params.id })
        // ..and populate all of the notes associated with it
        // .populate("note")
        .then(function(dbArticles) {
        // If we were able to successfully find an Article with the given id, send it back to the client
        res.json(dbArticles);
        })
        .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
    });
});
  
  // Route for saving/updating an Article's associated Note
// app.post("/articles/:id", function(req, res) {
// // Create a new note and pass the req.body to the entry
//     db.Note.create(req.body)
//         .then(function(dbNote) {
//         // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
//         // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
//         // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
//         return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
//         })
//         .then(function(dbArticle) {
//         // If we were able to successfully update an Article, send it back to the client
//         res.json(dbArticle);
//         })
//         .catch(function(err) {
//         // If an error occurred, send it to the client
//         res.json(err);
//     });
// });

app.listen(PORT, () => {
    console.log(`🌎 ==> Server now on port ${PORT}!`);
});