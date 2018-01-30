// Requiring Node Dependencies:

var express = require("express"); //X
var exphbs  = require('express-handlebars'); //XX
var bodyParser = require("body-parser"); //XX
var mongoose = require("mongoose"); //X

var logger = require("morgan"); // Used for debugging
var request = require('request'); // used for scraping
var cheerio = require("cheerio"); // used for scraping


// Initialize Express
var app = express();
//Use morgan logger for debugging
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({
  extended: false
}));

// Use express.static to serve public folder
app.use(express.static(process.cwd() + '/public'));

// Config Express-Handlebars
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// Configuring the database using Mongoose Connect to the Mongo DB via the local host if called, if deployed to heroku use the mongod_uri

var localMongo =  'mongodb://localhost/mongoHeadlines';
var MONGODB_URI = process.env.MONGODB_URI;

if (process.env.MONGODB_URI){
  mongoose.connect(process.env.MONGODB_URI);
}
else {
  mongoose.connect(localMongo);
};

mongoose.Promise = Promise;
var db = mongoose.connection;

db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

db.once("open", function() {
  console.log("Mongoose connected successfully.");
});

// Require all models
var Article = require('./models/Article.js');
var Note = require('./models/Note.js');
var index = require('./models/index.js');

//Import the Routes
var router = require('./config/routes.js');
app.use('/', router);

// Start the server
var PORT = process.env.PORT || 3000
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
