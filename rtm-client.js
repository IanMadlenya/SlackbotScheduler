var mongoose = require('mongoose');
var models = require('./models');
var {User} = require('./models');
var slackID;


/**
 * Example for creating and working with the Slack RTM API.
 */

/* eslint no-console:0 */

var axios = require('axios');
const timeZone = "2017-07-17T14:26:36-0700";
const identifier = 20150910;


var messageButtons = {
          "attachments": [
              {
                  "fallback": "You are unable to choose a game",
                  "callback_id": "wopr_game",
                  "color": "#3AA3E3",
                  "attachment_type": "default",
                  "actions": [
                      {
                          "name": "yes",
                          "text": "Yes",
                          "type": "button",
                          "value": "true"
                      },
                      {
                          "name": "no",
                          "text": "No",
                          "type": "button",
                          "value": "false"
                      }
                  ]
              }
          ]
      }

var {RtmClient, WebClient, CLIENT_EVENTS, RTM_EVENTS} = require('@slack/client');
//same as var RtmClient = require('@slack/client').RtmClient

var token = process.env.SLACK_API_TOKEN || '';

var { RtmClient, WebClient, CLIENT_EVENTS, RTM_EVENTS } = require('@slack/client');
// var RtmClient = require('@slack/client').RtmClient;
// var RTM_EVENTS = require('@slack/client').RTM_EVENTS;

var token = process.env.SLACK_API_TOKEN;
console.log(token);
var notPending = true;
var rtm = new RtmClient(token);
var web = new WebClient(token);
rtm.start();

rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
  var dm = rtm.dataStore.getDMByUserId(message.user); //gets the channel ID for the specific conversation between one user and bot
  const userId = message.user;

  User.findOne({slackID: userId}).exec(function(err, user){
    if(err){console.log(err)
    } else {
      if(!user){
        rtm.sendMessage('Please visit the following link to activate your account ' + process.env.DOMAIN + '/oauth?auth_id='+userId, message.channel);
      } else {
        //IF THE USER HAS RESPONDED TO THE PREVIOUS INTERACTIVE MESSAGE, set awaitingResponse tp false again
        if(message.subtype && message.subtype === 'message_changed') {
            awaitingResponse = false;
            return;
        }
        if( !dm || dm.id !== message.channel || message.type !== 'message') {
            console.log('MESSAGE WAS NOT SENT TOA  DM SO INGORING IT');
            return;
        }
        processMessage(message, rtm);
      }
    }
  })
});

rtm.on(RTM_EVENTS.REACTION_ADDED, function handleRtmReactionAdded(reaction) {
  console.log('Reaction added:', reaction);
});

rtm.on(RTM_EVENTS.REACTION_REMOVED, function handleRtmReactionRemoved(reaction) {
  console.log('Reaction removed:', reaction);
});

rtm.start();


function processMessage(message, rtm) {
  axios.get('https://api.api.ai/api/query',{
    params: {
      v: 20150910,
      lang: 'en',
      timezone: '2017-07-17T16:55:33-0700',
      query: message.text,
      sessionId: message.user
    },
    headers: {
      Authorization: `Bearer ${process.env.API_AI_TOKEN}`
    }
  })
  .then(function({data}){
    if (data.result.actionIncomplete){
      console.log('first ',data.result);
      //console.log(data.result);
      rtm.sendMessage(data.result.fulfillment.speech, message.channel)
    }else if (!data.result.actionIncomplete && Object.keys(data.result.parameters).length !== 0){
      //console.log('inside ',data.result);
      notPending = false;
      web.chat.postMessage(message.channel,
        `Creating reminder for ${data.result.parameters.subject} on ${data.result.parameters.date}`,
        {
          "attachments": [
              {
                  "fallback": "You are unable to choose a game",
                  "callback_id": "wopr_game",
                  "color": "#3AA3E3",
                  "attachment_type": "default",
                  "actions": [
                      {
                          "name": "yes",
                          "text": "Yes",
                          "type": "button",
                          "value": "true"
                      },
                      {
                          "name": "no",
                          "text": "No",
                          "type": "button",
                          "value": "false"
                      }
                  ]
              }
          ]
      })
    }else{
      console.log('last ',data.result);
      rtm.sendMessage(data.result.fulfillment.speech, message.channel)
    }
  })
  .catch(function(err){
    console.log('error');
  })
}
