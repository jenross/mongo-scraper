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
        result.img = $(this)
            .children()
            .children()
            .children("figure")
            .children()
            .children("img")
            .attr("src");

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
  
// Route for getting all saved articles from the db
app.get("/saved-articles", function(req, res) {
    db.Articles.find({saved: true})
        .then(function(dbArticles) {
        // If we were able to successfully find Articles, send them back to the client
        res.json(dbArticles);
        })
        .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
    });
});
  
// Delete One from the DB
app.get("/delete/:id", function(req, res) {
    // Remove an article using the objectID
    db.Articles.remove(
      {
        _id: db.Articles.ObjectID(req.params.id)
      },
      function(error, removed) {
        // Log any errors from mongojs
        if (error) {
          console.log(error);
          res.send(error);
        }
        else {
          // Otherwise, send the mongojs response to the browser
          // This will fire off the success function of the ajax request
          console.log(removed);
          res.send(removed);
        }
      }
    );
 });

app.listen(PORT, () => {
    console.log(`🌎 ==> Server now on port ${PORT}!`);
});