const fs = require('fs');
const path = require('path');
const date = require('date-fns');
const markdown = require('markdown').markdown;
const worksPath = "./resources/works/2018yuko/";
const reviewsPath = "./resources/reviews/2018yuko/";
var card, star, comment;
var description;
var dirs = {};

card = fs.readFileSync("./card.html", "utf-8");
description = fs.readFileSync("./description.html", "utf-8");
star = fs.readFileSync("./star.html", "utf-8");
comment = fs.readFileSync("./comment.html", "utf-8");

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
  $html.find('.value').append(num);
  $html.find('.star').append(GetStarsHTML(num));
  $html.find('.StarReview').html(review + "件のレビュー");
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

function GetCommentHTML(json) {
  console.log(json);
  $html = $(comment);
  $html.find('.author').append(json.author);
  $html.find('.text').append(json.text);
  $html.find('.date').append(date.distanceInWords(new Date(json.time), new Date()) + " ago");
  $html.find('.rating').append('<i class="icon star"></i>'.repeat(json.star));
  return $html;
}

//ready
$(_ => {
  //load
  ReadDir();

  console.log(new Date(1524396765830), date.distanceInWords(new Date(2018, 3, 12), new Date()));

  //delegate
  //ramda can't get this
  $('.Entries')
    .on('click', '.Entry', function() {
      const dir = $(this).attr('dir');
      const dirpath = worksPath + dir + "/";
      const settings = GetSettings(dir);
      let data = {star: 0, review: 0, allstar: 0};

      let $desc = $(description).addClass('transition').addClass('hidden');
      $desc.find('.Title').append(settings.name);
      $desc.find('.Tags').append(GetTagsHTML(settings.tags));
      $desc.find('.Snapshot').attr("src", dirpath + settings.snapshot);
      $desc.find('.Difficulty').append(settings.difficulty);
      $desc.find('.Time').append(settings.time);
      $desc.find('.Markdown').append(GetReadmeHTML(dirpath + settings.readme));
      fs.readdir(reviewsPath + dir, function(err, files) {
        let fileList = files.filter(function(file){
            return (path.extname(file.toString()) == '.json'); //絞り込み
        })
        fileList.forEach(function(file) {
          let jsonFile = JSON.parse(fs.readFileSync(reviewsPath + dir + "/" + file));
          $desc.find('.Reviews').append(GetCommentHTML(jsonFile));
          data.review++;
          data.allstar += jsonFile.star;
        });

        console.log(data, data.allstar);
        if(data.review != 0) data.star = data.allstar / data.review;
        $desc.find('.Stars').append(GetStarsLargeHTML(data.star, data.review));
      })

      $('.hidden').remove();
      $(this).parent().after($desc);
      $('.Description').transition('fade right');
    });
  $('.Help')
    .on('click', function() {
      $('#Help').toggle();
    });
  $('.ui.accordion')
    .accordion()
  ;
})
