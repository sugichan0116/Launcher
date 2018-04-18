const fs = require('fs');
var content;

$(_ => {
  try {
    let json = fs.readFileSync('./resources/works/2018yuko/test.json', 'utf-8');
    content = JSON.parse(json);
  } catch(err) {

  }
  $('h1').text('Yukari')
    .append('<p>star : ' + content.stars + '</p>')
    .on('click', function(e) {
      $(this).hide();
    });
})
