const fs = require('fs');
var content;
const worksPath = "./resources/works/2018yuko/";
var dirs;
$(_ => {
  console.log("first");
  fs.readdir(worksPath, function(err, files) {
    if(err) {
      throw err;
    }
    console.log(files[0]);
    files.forEach(function(element) {
      console.log(element);
      //dirs += element.toString();
      dirs = files;
      $('h1').text('Yukari')
        .append('<p>dir : ' + dirs + '</p>')
        .on('click', function(e) {
          $(this).hide();
        });
    });
  })
  console.log("second");

})
