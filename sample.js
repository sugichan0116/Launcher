const fs = require('fs');
const markdown = require('markdown').markdown;
const worksPath = "./resources/works/2018yuko/";
var card, star;
var description;
var dirs = {};

card = fs.readFileSync("./card.html", "utf-8");
description = fs.readFileSync("./description.html", "utf-8");
star = fs.readFileSync("./star.html", "utf-8");

function GetSettings(dir) {
  return JSON.parse(fs.readFileSync(worksPath + dir + "/setting.json"));
}

function GetStarsHTML(num) {
  if(0 <= num && num <= 5) {
    let starHTML = "";
    for(let n = 0; n < 5; n++) {
      const fill = (n < num) ? "" : "outline";
      starHTML += '<i class="icon large star ' + fill + ' yellow"></i>';
    }
    return starHTML;
  }
  return "";
}

function GetStarsLargeHTML(num, review) {
  $html = $(star);
  review = review + "件のレビュー";
  console.log(review);
  $html.find('.value').append(num);
  $html.find('.star').append(GetStarsHTML(num));
  $html.find('.StarReview').html(review);
  return $html;
}

function GetTagsHTML(tags) {
  function GetTagsColor(data) {
    colors = {"Game" : "red",
      "Music" : "blue",
      "Art" : "orange"};
    for(var key in colors) {
      if(data == key) {
        return colors[key];
      }
    }
    return "";
  }
  let tagHTML = "";
  tags.split(' ').forEach(function(data) {
    tagHTML += '<a class="ui tag ' + GetTagsColor(data) + ' label">' + data + '</a>'
  });
  return tagHTML;
}

function GetReadmeHTML(path) {
  let data = fs.readFileSync(path, 'utf-8')
  return markdown.toHTML(data.toString());
}

function ReadDir() {
  fs.readdir(worksPath, function(err, files) {
    if(err) {
      throw err;
    }
    dirs = files;
    console.log(dirs);

    //promise 使いたい
    let Row = 3;
    let $parent;
    dirs.forEach(function(data, num) {
      if(num % Row == 0) {
        $parent = $('<div class="ui horizontal segments">');
      }
      console.log(num);
      let $entry = $(card);
      let path = worksPath + data + "/";
      let settings = GetSettings(data);
      $entry.find('.header').append(settings.name);
      $entry.find('.Tags').append(GetTagsHTML(settings.tags));
      $entry.find('.Snapshot').attr("src", path + settings.snapshot);
      $entry.find('.Time').append(settings.time);
      $entry.find('.Difficulty').append(settings.difficulty);
      $entry.find('.Stars').append(GetStarsHTML(3));
      $entry.attr('dir', data);
      $parent.append($entry);
      if((num + 1) % Row == 0 || dirs.length - 1 == num) {
        $('.Entries').append($parent);
      }
    });

  })
}

//ready
$(_ => {
  //load
  ReadDir();

  console.log(dirs);

  //delegate
  //ramda can't get this
  $('.Entries')
    .on('click', '.Entry', function() {
      const dir = $(this).attr('dir');
      const path = worksPath + dir + "/";
      const settings = GetSettings(dir);

      let $desc = $(description).addClass('transition').addClass('hidden');
      $desc.find('.Title').append(settings.name);
      $desc.find('.Tags').append(GetTagsHTML(settings.tags));
      $desc.find('.Snapshot').attr("src", path + settings.snapshot);
      $desc.find('.Difficulty').append(settings.difficulty);
      $desc.find('.Time').append(settings.time);
      $desc.find('.Stars').append(GetStarsLargeHTML(3.2, 144));
      $desc.find('.Markdown').append(GetReadmeHTML(path + settings.readme));

      $('.hidden').remove();
      $(this).parent().after($desc);
      $('.Description').transition('fade right');
    });
})
