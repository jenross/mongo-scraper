const router = require("express").Router();
const axios = require("axios");
const cheerio = require("cheerio");

const db = require("../models");

// Define API routes here
router.get("/scrape", function(req, res) {
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

//updates articles to saved
//router.put
  
// Route for getting all saved articles from the db
router.get("/saved-articles", function(req, res) {
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
router.get("/delete/:id", function(req, res) {
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

module.exports = router;