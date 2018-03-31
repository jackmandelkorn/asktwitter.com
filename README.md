# asktwitter.com ![asktwitter.com](https://img.shields.io/github/license/jackmandelkorn/asktwitter.com.svg)
made at [Los Altos Hacks 2018](https://www.losaltoshacks.com/)  
winner of [2nd Place Overall](https://devpost.com/software/asktwitter-com) out of nearly 400 participants  
website live at [https://asktwitter.com/](https://asktwitter.com/)
___  
### About  
###### Front-end
+ asktwitter.com is deployed and distributed using AWS Cloudfront
  + the website files are hosted on AWS S3
  + the site is distributed over HTTPS using an AWS Certificate Manager trusted SSL certificate
+ asktwitter is hand designed and coded, meaning no templates such as bootstrap were used to create it
+ the ```3D View``` implemented in asktwitter is made from scratch, using no 3D APIs such as WebGL (see [forest.js](https://github.com/jackmandelkorn/forest))
###### Back-end
+ asktwitter does all natural language processing on the server side
+ the script is run on AWS Lambda (see [index.js](https://github.com/jackmandelkorn/asktwitter.com/blob/master/js/index.js))
  + the standard version of the [Twitter API](https://developer.twitter.com/en/docs/tweets/search/overview) is used to gather 700 tweets from the last week
  + the [sentiment](https://www.npmjs.com/package/sentiment) module from npm is used to determine the sentiment for each tweet
  + lambda returns the tweets as an object to the front-end, where it is subsequently processed and displayed
+ an AWS IAM user with limited permissions is created so the front-end may invoke the lambda function
