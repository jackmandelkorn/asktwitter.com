//jack mandelkorn

AWS.config.update({region: 'us-east-1'});
AWS.config.credentials = new AWS.Credentials("******************", "**********************************");
var lambda = new AWS.Lambda();
var globalObj;
var days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
var view3d = false;
var dim = 7000;
var currentPoint = 0;
var message3d = true;

init();

function init() {
  $(".view3d").css("opacity","0");
  $(".view3d").css("display","none");
  $(".view3d").css("transform","translateY(100px)");
  Chart.defaults.global.defaultFontColor = 'white';
  Chart.defaults.global.defaultFontSize = 15;
  Chart.defaults.global.defaultFontFamily = "'Roboto', sans-serif";
  Chart.defaults.global.legend.display = false;
  Chart.defaults.global.tooltips.position = "nearest";
  Chart.defaults.global.tooltips.intersect = false;
  Chart.defaults.global.tooltips.backgroundColor = "rgba(0,0,0,0.7)";
  Chart.defaults.scale.gridLines.color = "rgba(255,255,255,0)";
  Chart.defaults.scale.gridLines.zeroLineColor = "rgba(255,255,255,0)";
  Chart.defaults.scale.gridLines.display = false;
  Chart.defaults.scale.ticks.display = false;
  document.getElementById("chart").width = Math.floor(window.innerWidth * 0.6);
  $("#main-search").on("change keypress keydown keyup paste",function(){
    var obj = document.getElementById("main-search");
    var button = document.getElementById("main-search-button");
    if (obj.value.trim().length > 0 && obj.value.trim().length < 25) {
      button.className = "";
    }
    else {
      button.className = "disabled";
    }
  });
  $("#main-search").keypress(function(e) {
    var keycode = (e.keyCode ? e.keyCode : e.which);
    if (keycode == '13') {
      search();
    }
  });
  $("#main-search").focus();
  $('html, body').animate({
    scrollTop: 0
  }, 500);
}

function search(data) {
  if (data) {
    var text = data;
  }
  else {
    var obj = document.getElementById("main-search");
    var text = obj.value.trim();
  }
  if (text.length > 0 && text.length < 25) {
    var payload = {
      query: text
    };
    var query = text;
    var params = {
      FunctionName: "asktwitter",
      Payload: JSON.stringify(payload)
    };
    removeSearchUI();
    lambda.invoke(params, function(err, data) {
      if (err) {
        console.log(err, err.stack);
        error();
      }
      else {
        globalObj = JSON.parse(data.Payload);
        if (!globalObj.totals) {
          error();
        }
        else {
          queryDisplay(query);
          bigNumber(globalObj.totals[6]);
          generateChart(globalObj.totals);
          generateTopics(globalObj.data);
          selectPoint(6);
          removePostSearchUI();
        }
      }
    });
  }
}

function queryDisplay(data) {
  var add = "";
  if (data.charAt(0) === "#") {
    add = "#";
    data = data.substr(1);
  }
  document.getElementById("query-display").innerHTML = "Results for <span class='emphasize'>\"" + add + "<b>" + (data) + "</b>\"</span>";
}

function bigNumber(data) {
  data = parseInt(data);
  var sign = "+";
  if (data < 0) {
    sign = "-";
  }
  document.getElementById("big-number").innerHTML = "<span id='sign'>" + sign + "</span>" + Math.abs(data);
  var average = 0;
  for (var i = 0; i < globalObj.totals.length; i++) {
    average += globalObj.totals[i];
  }
  average = Math.round(average / globalObj.totals.length);
  document.getElementById("sentiment-average").innerHTML = '<span style="color:white;">' + average + '</span> points average';
}

function selectPoint(index) {
  currentPoint = index;
  var labelArr = new Array();
  for (var i = 1; i < 7; i++) {
    labelArr.push(days[moment().subtract((7 - i),"days").day()]);
  }
  labelArr.push("Today");
  document.getElementById("selected-point").innerHTML = labelArr[index];
  document.getElementById("selected-point-2").innerHTML = labelArr[index];
  generateTweets(index);
  generateTopics(globalObj.data);
}

function generateTweets(index) {
  $(".card").remove();
  $(".card-title").remove();
  $(".view3d-panel").remove();
  Panel.all = new Array();
  var positive = document.getElementById("positive-results");
  var negative = document.getElementById("negative-results");
  var positiveTotal = 0;
  var negativeTotal = 0;
  var tweets = globalObj.data[index].statuses;
  for (var i = 0; i < tweets.length; i++) {
    var card = document.createElement("div");
    card.className = "card";
    var tagContainer = document.createElement("p");
    tagContainer.style.textAlign = "right";
    var tag = document.createElement("span");
    tag.className = "card-tag";
    tag.innerHTML = tweets[i].sentiment + " points";
    tagContainer.appendChild(tag);
    var body = document.createTextNode(tweets[i].full_text);
      var photo = document.createElement("img");
      photo.src = tweets[i].user.profile_image_url_https;
      photo.className = "card-profile-image";
      var profile = document.createElement("p");
      profile.className = "card-profile";
      var profileText = document.createTextNode("@" + tweets[i].user.screen_name);
      profile.appendChild(photo);
      profile.appendChild(profileText);
    card.appendChild(profile);
    card.appendChild(body);
    if (tweets[i].entities.media !== undefined) {
      if (tweets[i].entities.media.length > 0) {
        for (var a = 0; a < tweets[i].entities.media.length; a++) {
          if (tweets[i].entities.media[a].type === "photo") {
            var img = document.createElement("img")
            img.src = tweets[i].entities.media[a].media_url_https;
            img.className = "card-image";
            card.appendChild(img);
          }
        }
      }
    }
    card.appendChild(tagContainer);
    var mult = 1;
    if (tweets[i].metadata.result_type === "popular") {
      mult = 2;
    }
    card.style.order = 10000 - (Math.abs(tweets[i].sentiment) * mult);
    if (tweets[i].sentiment > 0) {
      if (view3d) {
        var width = Math.round((window.innerWidth * 0.3) - 15);
        var height = $(card).outerHeight();
        var x = Math.round((Math.random() * dim) - (dim / 2));
        var y = Math.round((Math.random() * dim) - (dim / 2));
        new Panel(width,height,x,0,y,Math.round(Math.random() * 180),card);
      }
      else {
        positive.appendChild(card);
        positiveTotal++;
      }
    }
    else if (tweets[i].sentiment < 0) {
      if (view3d) {
        var width = Math.round((window.innerWidth * 0.3) - 15);
        var height = $(card).outerHeight();
        var x = Math.round((Math.random() * dim) - (dim / 2));
        var y = Math.round((Math.random() * dim) - (dim / 2));
        new Panel(width,height,x,0,y,Math.round(Math.random() * 180),card);
      }
      else {
        negative.appendChild(card);
        negativeTotal++;
      }
    }
  }
  if (!view3d) {
    if (positive.childNodes.length > 1) {
      var title = document.createElement("h4");
      title.className = "card-title";
      title.innerHTML = "Positive <span style='opacity:0.5;'>(" + positiveTotal + ")</span>";
      positive.appendChild(title);
    }
    if (negative.childNodes.length > 1) {
      var title = document.createElement("h4");
      title.className = "card-title";
      title.innerHTML = "Negative <span style='opacity:0.5;'>(" + negativeTotal + ")</span>";
      negative.appendChild(title);
    }
  }
}

function generateChart(data) {
  var ctx = document.getElementById('chart').getContext('2d');
  var labelArr = new Array();
  for (var i = 1; i < 7; i++) {
    labelArr.push(days[moment().subtract((7 - i),"days").day()]);
  }
  labelArr.push("Today");
  var chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labelArr,
        datasets: [{
          backgroundColor: 'rgba(255, 255, 255, 0.4)',
          borderColor: 'white',
          borderWidth: 10,
          borderCapStyle: "round",
          pointBorderWidth: 0,
          pointRadius: 15,
          pointHoverRadius: 15,
          pointBackgroundColor: 'rgba(255,255,255,0.5)',
          pointHoverBackgroundColor: 'rgba(255,255,255,0.5)',
          pointBorderColor: 'rgba(255,255,255,0)',
            data: data
        }]
      },
      options: {
        onClick: function (data1,data2) {
          selectPoint(data2[0]._index);
          $('html, body').animate({
              scrollTop: $("#tweets-anchor").offset().top - 20
          }, 500);
        },
        layout: {
          padding: {
            left: 0,
            right: 0,
            top: 20,
            bottom: 20
          }
        }
      }
  });
}


function removePostSearchUI() {
  $(".post-search-ui").css("transform","translateY(100px)");
  $(".post-search-ui").css("opacity","0");
  setTimeout(function(){
    $(".post-search-ui").remove();
    $(".result-ui:not(.flex)").css("display","inline");
    $(".result-ui.flex").css("display","flex");
    $(".result-ui").css("opacity","1");
  },500);
}

function removeSearchUI() {
  $(".search-ui").css("transform","translateY(100px)");
  $(".search-ui").css("opacity","0");
  setTimeout(function(){
    $(".search-ui").remove();
    $(".post-search-ui").css("display","inline");
    $(".post-search-ui").css("opacity","1");
  },500);
}

function toggle3d() {
  if (view3d) {
    $("body > :not(.keep3d)").css("display","");
    $(".view3d").css("opacity","0");
    $(".view3d").css("transform","translateY(100px)");
    $('html, body').animate({
        scrollTop: $("#tweets-anchor").offset().top - 120
    }, 500);
    setTimeout(function(){
      $(".view3d").css("display","none");
      $("body > :not(.keep3d)").css("opacity","");
      $("body > :not(.keep3d)").css("transform","");
    },500);
    view3d = false;
  }
  else {
    $(".view3d").css("display","");
    $("body > :not(.keep3d)").css("opacity","0");
    $("body > :not(.keep3d)").css("transform","translateY(100px)");
    setTimeout(function(){
      $(".view3d").css("opacity","1");
      $(".view3d").css("transform","");
      $("body > :not(.keep3d):not(.view3d)").css("display","none");
    },500);
    view3d = true;
  }
  selectPoint(currentPoint);
}

function generateTopics(data) {
  var zMax = 256;
  var blob = "";
  var parent = document.getElementById("topic-container");
  $(".topic").remove();
  var sub = data[currentPoint].statuses;
  for (var a = 0; a < sub.length; a++) {
    blob += " " + sub[a].full_text;
  }
  blob = clean(blob.trim());
  var topics = nlp(blob).topics().data();
  var arr = new Array();
  for (var i = 0; i < topics.length; i++) {
    var text = topics[i].text.trim();
    if (!arr.includes(text)) {
      arr.push(text);
    }
  }
  var max = 20;
  if (arr.length < 20) {
    max = arr.length;
  }
  if (view3d) {
    for (var i = 0; i < arr.length; i++) {
      var element = document.createElement("div");
      element.className = "topic";
      element.style.backgroundColor = "white";
      element.style.color = "black";
      element.innerHTML = arr[i];
      var height = 39;
      var x = Math.round((Math.random() * dim) - (dim / 2));
      var y = Math.round((Math.random() * dim) - (dim / 2));
      var z = Math.round(Math.random() * zMax);
      new Panel(false,height,x,z,y,Math.round(Math.random() * 180),element);
    }
  }
  else {
    for (var i = 0; i < max; i++) {
      var element = document.createElement("div");
      element.className = "topic";
      element.innerHTML = arr[i];
      parent.appendChild(element);
    }
  }
}

function clean(str) {
  return str.toLowerCase().replace(/[^a-zA-Z0-9\s]+/g, "");
}

function backToTop() {
  $('html, body').animate({
    scrollTop: 0
  }, 1000);
}

function error() {
  $("#error-message").css("display","inline-block");
  $(".post-search-ui").css("transform","translateY(100px)");
  $(".post-search-ui").css("opacity","0");
  setTimeout(function(){
    $(".post-search-ui").remove();
    $("#error-message").css("opacity","1");
  },500);
}
