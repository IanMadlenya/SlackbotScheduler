var fs = require('fs');
var logger = require('morgan');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var express = require('express');
var request = require('request');
var client = require('./rtm-client.js')
var app = express();
var bodyParser = require('body-parser');
//var index = require('./routes/index.js');
app.use(logger('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
var app = express();

var Slack = require('@slack/client');
var RtmClient = Slack.RtmClient;
var RTM_EVENTS = Slack.RTM_EVENTS;

var token;


var CLIENT_ID = process.env.CLIENT_SECRET
var CLIENT_SECRET = process.env.CLIENT_ID
const PORT=4390;

// Start our server
app.listen(PORT, function () {
    //Callback triggered when server is successfully listening. Hurray!
    console.log("Example app listening on port " + PORT);
});


// This route handles GET requests to our root ngrok address and responds with the same "Ngrok is working message" we used before
app.get('/', function(req, res) {
    res.send('Ngrok is working! Path Hit: ' + req.url);
});

//This route handles get request to a /oauth endpoint. We'll use this endpoint for handling the logic of the Slack oAuth process behind our app.
app.get('/oauth', function(req, res) {
    // When a user authorizes an app, a code query parameter is passed on the oAuth endpoint. If that code is not there, we respond with an error message
    if (!req.query.code) {
        res.status(500);
        res.send({"Error": "Looks like we're not getting code."});
        console.log("Looks like we're not getting code.");
    } else {
        // If it's there...

        // We'll do a GET call to Slack's `oauth.access` endpoint, passing our app's client ID, client secret, and the code we just got as query parameters.
        request('https://slack.com/api/oauth.access?client_id=' + CLIENT_ID + '&client_secret=' + CLIENT_SECRET + '&code=' + req.query.code,
            function(error, response, body) {
              var responseJson = JSON.parse(body);
              if(responseJson.ok) {
                // var botAccessToken = responseJson['bot']['bot_access_token'];
                // var botUserId = responseJson['bot']['bot_user_id'];
                // var teamId = responseJson['team_id'];
                // connectToTeam(botAccessToken);
                res.json(body);
              } else {
                console.error('could not exchange token ' + responseJson);
              }
            }
          );
    }
});



function processMessage(message, rtm) {
  var locationName = message.text;
  var query = (isNaN(locationName) ? 'q=' + locationName : 'zip=' + locationName) + '&units=imperial&APPID=' + WEATHER_API_KEY;
  rtm.sendMessage('I\'ll get you the current weather for "' + locationName + '"', message.channel, function() {
    // getAndSendCurrentWeather(locationName, query, message.channel, rtm);
  });
}

// Route the endpoint that our slash command will point to and send back a simple response to indicate that ngrok is working
app.post('/command', function(req, res) {
    res.send('Your ngrok tunnel is up and running!');
});

app.post('/interactive', function(req,res){

})

// app.use((req, res, next) => {
//   var err = new Error('Not Found');
//   err.status = 404;
//   next(err);
// });
//
//
// // error handler
// app.use((err, req, res, next) => {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};
//
//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });
// export default app;
