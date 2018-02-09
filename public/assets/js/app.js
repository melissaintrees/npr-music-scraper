// set up event handlers/ajax calls for each button clicked:
// - scrape articles
// - save article to database and it goes to saved page
// - delete article from database and saved page
// - add note (from saved page: once an article is on the saved page, you can then add a note)
// - delete note (from saved page)


// // Grab the articles as a json
// $.getJSON("/articles", function(data) {
//   // For each one
//   for (var i = 0; i < data.length; i++) {
//     // Display the apropos information on the page
//     $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].url + "<br />" + data[i].summary + "</p>");
//   }
// });

// Handler for scraping
// $("#scrape").on("click", function () {
//   $.ajax({
//     method: "GET",
//     url: "/scrape",
//   }).done(function (data) {
//     console.log(data)
//     window.location = "/"
//   })
// });

// //Handler for Saving an article
// $(".save").on("click", function () {
//   var thisId = $(this).attr("data-id");
//   $.ajax({
//     method: "POST",
//     url: "/articles/save/" + thisId
//   }).done(function(data){
//     window.location = "/"
//   })
// });


// // Whenever someone clicks a p tag
// $(document).on("click", "p", function() {
//   // Empty the notes from the note section
//   $("#notes").empty();
//   // Save the id from the p tag
//   var thisId = $(this).attr("data-id");

//   // Now make an ajax call for the Article
//   $.ajax({
//     method: "GET",
//     url: "/articles/save/" + thisId
//   })
//     // With that done, add the note information to the page
//     .then(function(data) {
//       console.log(data);
//       // The title of the article
//       $("#notes").append("<h2>" + data.title + "</h2>");
//       // An input to enter a new title
//       $("#notes").append("<input id='titleinput' name='title' >");
//       // A textarea to add a new note body
//       $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
//       // A button to submit a new note, with the id of the article saved to it
//       $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

//       // If there's a note in the article
//       if (data.note) {
//         // Place the title of the note in the title input
//         $("#titleinput").val(data.note.title);
//         // Place the body of the note in the body textarea
//         $("#bodyinput").val(data.note.body);

//       }
//     });
// });

// function savenote(event) {
//   event.preventDefault();
//   var id = $(this).attr("value");
//   var obj = {
//     title: $("#titleinput").val().trim(),
//     body: $("#bodyinput").val().trim()
//   };
//   $.post("/article/" + id, obj, function(data) {
//     window.location.href = "/";
//   });
// }

// When you click the savenote button
// $(document).on("click", "#savenote", savenote) ;
// {
  // // Grab the id associated with the article from the submit button
  // var thisId = $(this).attr("data-id");

  // // Run a POST request to change the note, using what's entered in the inputs
  // $.ajax({
  //   method: "POST",
  //   url: "/articles/" + thisId,
  //   data: {
  //     // Value taken from title input
  //     title: $("#titleinput").val(),
  //     // Value taken from note textarea
  //     body: $("#bodyinput").val()
  //   }
  // })
  //   // With that done
  //   .then(function(data) {
  //     // Log the response

  //     // Empty the notes section
  //     $("#notes").empty();
  //   });

  // // Also, remove the values entered in the input and textarea for note entry
  // $("#titleinput").val("");
  // $("#bodyinput").val("");
// });
