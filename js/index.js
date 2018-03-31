//server-side nodeJS that runs in AWS Lambda

var Twitter = require('twitter');
var sentiment = require('sentiment');
var moment = require('moment');
var AWS = require('aws-sdk');

var comprehend = new AWS.Comprehend();
var count = 100;
var blob = "";
var client = new Twitter({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token_key: process.env.ACCESS_TOKEN_KEY,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
});

exports.handler = (event, context, callback) => {
  if (event.count) {
    count = event.count;
  }
  search(event.query,count,6,function(data){
    callback(null,data);
  });
};

function scanSentiment(tweets,callback,i,total) {
  if (!i) {
    i = 0;
  }
  if (!total) {
    total = 0;
  }
  var tweet = tweets.statuses[i];
  var text = tweet.full_text;
  tweets.statuses[i].sentiment = sentiment(text).score;
  total += parseInt(sentiment(text).score);
  if (i < (tweets.statuses.length - 1)) {
    i++;
    scanSentiment(tweets,callback,i,total);
  }
  else {
    (callback)(tweets,total);
  }
}

function search(query,qcount,i,callback,obj) {
  if (!obj) {
    obj = new Object();
    obj.data = new Array();
    obj.totals = new Array();
  }
  var params = {
    q: query,
    count: qcount,
    result_type: "mixed",
    until: moment().subtract(i,"days").format("YYYY-MM-DD"),
    tweet_mode: "extended"
  };
  client.get('search/tweets.json', params, function(error, tweets, response) {
    if (!error) {
      scanSentiment(tweets,function(data,total){
        obj.data.push(data);
        obj.totals.push(total);
        i--;
        if (i < 0) {
          (callback)(obj);
        }
        else {
          search(query,qcount,i,callback,obj);
        }
      });
    }
  });
}
