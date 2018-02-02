// Requiring Node Dependencies:

var express = require("express"); //X
var router = express.Router();
var path = require('path');
var request = require('request'); // used for scraping
var cheerio = require("cheerio"); // used for scraping

// Require all models
var Article = require('../models/Article.js');
var Note = require('../models/Note.js');
var index = require('../models/index.js');

// Routes:
router.get('/', function(req, res){

  res.redirect('/scrape')
  console.log("this initial get route is working!")
});

// A GET route for displaying all of the articles on the npr's music: the record section on the page:

router.get("/scrape", function(req, res) {
  // First, we grab the body of the html with request
  request('https://www.npr.org/sections/therecord/', function (error, response, body) {
      // console.log('error:', error); // Print the error if one occurred
      // console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
      // console.log('body:', body); // Print the HTML for the NPR Records homepage
      var $ = cheerio.load(body);

      // This is to make sure that duplicates are not added to the database..
      var titlesArray = [];

      $("article").each(function(i, element){

        //save an empty result object:
        var result = {};
        title = $(element).find("h2.title > a").text();
        // console.log("the title: ", title);
        summary = $(element).find("p.teaser > a").text();
        // console.log("the summaries: ", summary)
        url = $(element).find("h2.title > a").attr("href");
        // console.log("the urls: ", result.url);
        //create a result object with all of the properties we have scraped:
        result = {
          title: title,
          summary: summary,
          url: url
        }
        // console.log(result)


        // If the current results are not already in the titlesArray...
        if(titlesArray.indexOf(result.title) == -1){

          // push the saved item to our titlesArray to
          titlesArray.push(result.title);

          // Only add the entry to the database if is not already there
          Article.count({ title: result.title, summary: result.summary, url: result.url}, function (err, test){

            // If the count is 0, then the entry is unique and should be saved
            if(test == 0){

              // Using the Article model, create a new entry (note that the "result" object has the exact same key-value pairs of the model)
              var entry = new Article (result);


              // Save the entry to MongoDB
              entry.save(function(err, doc) {
                // log any errors
                if (err) {
                  console.log(err);
                }
                // or log the doc that was saved to the DB
                else {
                  console.log(doc);
                }
              });

            }
            // Log that scrape is working, just the content was already in the Database
            else{
              console.log('Redundant Database Content. Not saved to DB.')
            }

          });
      }

    });


      // Create a new Article using the `result` object built from scraping
      // Article.create(result)
      //   .then(function(dbArticle) {
      //     // View the added result in the console
      //     console.log(dbArticle);
      //   })
      //   .catch(function(err) {
      //     // If an error occurred, send it to the client
      //     return res.json(err);
      //   });


      // });
      // send message back to client after scraping
      res.send("Scrape Complete");
  });
});

// // Route for getting all Articles from the db
router.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  Article.find({})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
router.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
router.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  Note.create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return Article.find({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Export Router to Server.js
module.exports = router;