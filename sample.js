const fs = require('fs');
const markdown = require('markdown').markdown;
const worksPath = "./resources/works/2018yuko/";
var card; //string
var description;
var dirs = {};

card = fs.readFileSync("./card.html", "utf-8");
description = fs.readFileSync("./description.html", "utf-8");

function GetSettings(dir) {
  return JSON.parse(fs.readFileSync(worksPath + dir + "/setting.json"));
}

function ReadDir() {
  fs.readdir(worksPath, function(err, files) {
    if(err) {
      throw err;
    }
    dirs = files;
    console.log(dirs);

    //promise 使いたい
    dirs.forEach(function(data) {
      let $entry = $(card);
      let path = worksPath + data + "/";
      let settings = GetSettings(data);
      let tagHTML = "";
      settings.tags.split(' ').forEach(function(data) {
        tagHTML += '<a class="ui tag label">' + data + '</a>'
      });
      $entry.find('.header').append(settings.name);
      $entry.find('.Tags').append(tagHTML);
      $entry.find('.Snapshot').attr("src", path + settings.snapshot);
      $entry.find('.Time').append(settings.time);
      $entry.find('.Difficulty').append(settings.difficulty);
      $entry.attr('dir', data);
      $('.Entries').append($entry);
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
      let tagHTML = "";
      settings.tags.split(' ').forEach(function(data) {
        tagHTML += '<a class="ui tag label">' + data + '</a>'
      });

      let $desc = $(description).addClass('transition').addClass('hidden');
      $desc.find('.header').append(settings.name);
      $desc.find('.Tags').append(tagHTML);
      $desc.find('.Snapshot').attr("src", path + settings.snapshot);
      $desc.find('.Difficulty').append(settings.difficulty);
      $desc.find('.Time').append(settings.time);

      $('.hidden').remove();
      $(this).parent().after($desc);
      $('.Description').transition('fade right');
    });
})
