$(_ => {

  $('h1').text('Yukari')
    .append('<p>child</p>')
    .on('click', function(e) {
      $(this).hide();
    });
})
