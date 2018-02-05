// Requiring Node Dependencies:

var express = require("express"); //X
var exphbs = require('express-handlebars'); 

var router = express.Router();

var path = require('path');
var mongoose = require('mongoose');
var request = require('request'); // used for scraping

var cheerio = require("cheerio"); // used for scraping

// Set mongoose to leverage built in JavaScript ES6 Promises instead of relying on callbacks.
mongoose.Promise = Promise;

// Require all models
var Article = require('../models/Article.js');
var Note = require('../models/Note.js');
var index = require('../models/index.js');

// for the handlebars route: { "saved": false },
// Routes:
// This route reads all the articles in the database and renders it to the index.handlebars page
router.get('/', function(req, res){
  Article.find({"saved": false}, function(error, data) {
    var hbsObject = {
      articles: data
    };
    console.log(hbsObject);
    res.render("index", hbsObject);
  });
});
// a route that takes you to a handlebars page with the saved articles.
router.get("/saved", function(req, res){
  Article.find({"saved": true})
  .populate("notes")
  .exec(function(error, articles){
    var hbsObject = {
      article: articles
    };
    res.render("saved", hbsObject);
  });
});

 // This gets the articles from the npr's music: the record section, saves them to a db and displays

router.get("/scrape", function(req, res) {
  // First, we grab the body of the html with request
  request('https://www.npr.org/sections/therecord/', function (error, response, body) {
      // console.log('error:', error); // Print the error if one occurred
      // console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
      // console.log('body:', body); // Print the HTML for the NPR Records homepage
      // then load cheerio with the $ var.
      var $ = cheerio.load(body);

      // This is to make sure that duplicates are not added to the database..
      var titlesArray = [];

      $("article").each(function(i, element) {

        //save an empty result object:
        var result = {};
        // traverse site to get the proper selectors and save in vars
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

       //   // If the current results are not already in the titlesArray...
      //   if(titlesArray.indexOf(result.title) == -1){

      //     // push the saved item to our titlesArray to
      //     titlesArray.push(result.title);

      //     // Only add the entry to the database if is not already there
      //     Article.count({ title: result.title, summary: result.summary, url: result.url}, function (err, test){

      //       // If the count is 0, then the entry is unique and should be saved
      //       if(test == 0){

       // Creates a new db entry using the Article Model with the result object and stores it in the entry var. 
        var entry = new Article(result);
        
        // saves the entry to the db!
        entry.save(function(err, doc){
          if (err) {
            console.log(err);
          }
          else {
            console.log(doc);
          }
        })
        
      //       }
      //       // Log that scrape is working, just the content was already in the Database
      //       else{
      //         console.log('Redundant Database Content. Not saved to DB.')
      //       }

      //     });
      // }

    });
      // send message back to client after scraping
      res.send("Scrape Complete");
  });
});

// // Route for getting all Articles from the db
router.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  Article.find({}, function(error, doc) {
    //Log Errors
    if (errror){
      console.log(error);
    }
    else {
      // send article doc to browser as json
      res.json(doc);
    }
  });
});

// Route for grabbing a specific Article by id, populate it with it's note

router.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  Article.findOne({ "_id": req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    // now, make the query
    .exec(function(error, doc) {
      if (error) {
        console.log(error)
      } 
      // If we were able to successfully find an Article with the given id, send it back to the client
      else {
        res.send(doc);
      }
    });
});

// Route for saving an article
router.post("articles/save/:id", function(req, res){
  // find the article id and update it's saved property to true
  Article.findOneAndUpdate({ "_id": req.params.id}, {"saved": true })
  // then run the query:
  .exec(function (error, doc) {
    if (error) {
      console.log(error)
    }
    // If we were able to successfully find an Article, and update the boolen, send doc to the broweser
    else {
      res.send(doc);
    }
  });

});


// Delete an article
router.post("/articles/delete/:id", function (req, res) {
  // Use the article id to find and update its saved boolean
  Article.findOneAndUpdate({ "_id": req.params.id }, { "saved": false, "notes": [] })
    // run the query
    .exec(function (error, doc) {
      // Log any errors
      if (error) {
        console.log(error);
      }
      else {
        // Or send the document to the browser
        res.send(doc);
      }
    });
});

// Route for saving/updating an Article's associated Note
router.post("/notes/save/:id", function (req, res) {
  // Create a new note and pass the req.body to the entry
  var newNote = new Note({
    body: req.body.text,
    article: req.params.id
  });
  console.log(req.body);
  
  Note.create(req.body)
    .then(function (dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function (dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.send(dbArticle);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.send(err);
    });
});


// Export Router to Server.js
module.exports = router;