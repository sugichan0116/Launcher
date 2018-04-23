const fs = require('fs');
const path = require('path');
const date = require('date-fns');
const exec = require('child_process').exec;
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

function GetNumberOfStar(dir) {
  let data = {star: 0, review: 0, allstar: 0};
  return new Promise(function(resolve, reject) {
    fs.readdir(reviewsPath + dir, function(err, files) {
      if(files != undefined) {
        let fileList = files.filter(function(file){
            return (path.extname(file.toString()) == '.json'); //絞り込み
        });
        fileList.forEach(function(file) {
          let jsonFile = JSON.parse(fs.readFileSync(reviewsPath + dir + "/" + file));
          data.review++;
          data.allstar += jsonFile.star;
        });
      }
      if(data.review != 0) data.star = data.allstar / data.review;
      return resolve(data.star);
    });
  });
}

function GetStarsHTML(num) {
  num = (new Number(num)).toFixed();
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
  if(num == undefined) num = 0;
  $html.find('.value').append((new Number(num)).toFixed(1));
  $html.find('.star').append(GetStarsHTML(num));
  $html.find('.StarReview').html((review == 0) ? "まだレビューがありません" : review + "件のレビュー");
  return $html;
}

function GetTagsHTML(tags) {
  function GetTagsColor(data) {
    colors = {"Game" : "red",
      "Music" : "blue",
      "Art" : "orange",
      "Servise" : "green"};
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
  let data = fs.readFileSync(path, 'utf-8');
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
      GetNumberOfStar(data).then(function(star) {
        $entry.find('.Stars').append(GetStarsHTML(star));
      });
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
      let newComment = {author : "", text : "", star: 0, time: 0};

      let $desc = $(description).addClass('transition').addClass('hidden');
      //基本情報
      $desc.find('.Title').append(settings.name);
      $desc.find('.Tags').append(GetTagsHTML(settings.tags));
      $desc.find('.Snapshot').attr("src", dirpath + settings.snapshot);
      $desc.find('.Difficulty').append(settings.difficulty);
      $desc.find('.Time').append(settings.time);
      $desc.find('.Markdown').append(GetReadmeHTML(dirpath + settings.readme));
      $desc.find('.Play')
        .on('click', function(data) {
          let cdir = path.join(worksPath, dir);
          exec(settings.exec, {cwd: cdir}, function(err, stdout, stderr) {
            if (err) { console.log(err); }
            console.log(stdout);

          });
        });
      //アンケート
      $desc.find('[name="Author"]')
        .on('change', function() {
          newComment.author = $(this).val();
        });
      $desc.find('[name="Text"]')
        .on('change', function() {
          newComment.text = $(this).val();
        });
      $desc.find('.ui.dropdown').dropdown();
      $desc.find('.Answer').find('.Save')
        .on('click', function(data) {
          newComment.star = Number($desc.find('[name="Stardrop"]').val());
          if(newComment.star == 0) return;
          newComment.time = (new Date()).getTime();
          if(newComment.author == "") newComment.author = "Anonymous";
          if(newComment.text == "") newComment.text = "No Description";

          $desc.find('.Reviews').prepend(GetCommentHTML(newComment));
          fs.writeFile(
            path.join(reviewsPath + dir, newComment.time + '.json'),
            JSON.stringify(newComment),
            function(err) {
              if(err) {
                console.log(err);
                throw err;
              }
          });

          $desc.find('[name="Author"]').val("");
          $desc.find('[name="Text"]').val("");
          $desc.find('[name="Stardrop"]').val("");
        });
        $desc.find('.Answer').find('.Cancel')
          .on('click', function(data) {
            $desc.find('[name="Author"]').val("");
            $desc.find('[name="Text"]').val("");
            $desc.find('[name="Stardrop"]').val("");
          });
      //コメント
      fs.readdir(reviewsPath + dir, function(err, files) {
        if(files != undefined) {
          let fileList = files.filter(function(file){
              return (path.extname(file.toString()) == '.json'); //絞り込み
          });
          fileList.forEach(function(file) {
            let jsonFile = JSON.parse(fs.readFileSync(reviewsPath + dir + "/" + file));
            $desc.find('.Reviews').prepend(GetCommentHTML(jsonFile));
            data.review++;
            data.allstar += jsonFile.star;
          });
        }
        console.log(data, data.allstar);
        if(data.review != 0) data.star = data.allstar / data.review;
        $desc.find('.Stars').append(GetStarsLargeHTML(data.star, data.review));
      });

      $('.Entries').find('.hidden').remove();
      $(this).parent().after($desc);
      $('.Description').transition('fade right');
    });
  $('.Help')
    .on('click', function() {
      $('#Help').modal('show');
    });
  $('.ui.accordion')
    .accordion()
  ;
})
