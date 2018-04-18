const fs = require('fs');
const markdown = require('markdown').markdown;
const worksPath = "./resources/works/2018yuko/";

$(_ => {
  fs.readdir(worksPath, function(err, files) {
    if(err) {
      throw err;
    }
    $('.Entries').append('<div>' + files + '</div>');
    files.forEach(function(element) {
      let path = worksPath + element + '/README.md';
      console.log(path);
      try {
        fs.readFile(path, 'utf-8', (err, data) => {
          if(err) throw err;
          console.log(data.toString());
          $('.Entries').append('<div class="Markdown">' + markdown.toHTML(data.toString()) + '</div>');
        });
      } catch(e) {
        console.log(e);
      }
    });
  })

})
