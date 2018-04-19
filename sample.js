const fs = require('fs');
const markdown = require('markdown').markdown;
const worksPath = "./resources/works/2018yuko/";
var $card, $cards;
var $description;

function readCard() {
  //カードの読み込み
  fs.readFile("./card.html", "utf-8", (err, data) => {
    if(err) throw err;
    $card = $(data);
    $cards = $('<div class="ui horizontal segments">').append($card).append($card);
    $card.on("click", (event) => {
      console.log($(this));
      $(this).after("<div>");
    })
    $('.Entries').append($cards);
  });
}

$(_ => {
  //デスクリプションの読み込み
  fs.readFile("./description.html", "utf-8", function (err, data) {
    if(err) throw err;
    $description = $(data);
    readCard();
  });

  fs.readdir(worksPath, function(err, files) {
    if(err) {
      throw err;
    }
    $('.Entries').append('<div>' + files + '</div>');
    files.forEach(function(element) {
      let path = worksPath + element + '/README.md';
      try {
        fs.readFile(path, 'utf-8', (err, data) => {
          if(err) throw err;
          console.log(data.toString());
          $('.Markdown').append(markdown.toHTML(data.toString()));
        });
      } catch(e) {
        console.log(e);
      }
    });
  })

})
