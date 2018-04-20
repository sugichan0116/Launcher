const fs = require('fs');
const markdown = require('markdown').markdown;
const worksPath = "./resources/works/2018yuko/";
var card; //string
var description;
var dirs;

card = fs.readFileSync("./card.html", "utf-8");
description = fs.readFileSync("./description.html", "utf-8");

function ReadDir() {
  fs.readdir(worksPath, function(err, files) {
    if(err) {
      throw err;
    }
    dirs = files;
    console.log(dirs);
  })
}

//ready
$(_ => {
  //load
  ReadDir();

  //event
  if(card == null) console.log("nullpo");

  //delegate
  //ramda can't get this
  $('.Entries').on('click', '.Entry', function() {
    $(this).parent().after($(description));
  });

})
