var Botkit = require('botkit');
var CronJob = require('cron').CronJob;
var request = require('request');
var timezone = 'America/Los_Angeles';

var controller = Botkit.slackbot({});
var webhookUrl = process.env.SLACK_WEBHOOK_URL;

// If you want to use your own server, change this to the place you host the gitterbot /public folder
// This folder needs to include the images.json file
const IMAGE_SOURCE = 'http://glitter.appmantle.com/';

// Default cronjob sends a new glitter every weekday at 9:00. 
const CRON = '00 09 * * 1-5';

// If Slack webhook url not provided, exit gracefully.
if (webhookUrl === '') {
    console.log('Please provide a Slack webhook URL');
    process.exit(1);
}

var glitterbot = controller.spawn({});
glitterbot.configureIncomingWebhook({ url: webhookUrl });

function sendGlitter() {
    // Get the list of images from the image source
    request(`${IMAGE_SOURCE}images.json`, function (error, response, body) {
        if (!error && response.statusCode == 200) {

            // Parse image.json
            const imageData = JSON.parse(body);

            // Choose if a generic image or a day specific image should be sent
            // There's a 25% chance a generic image gets chosen
            let type = '';
            if (Math.floor(Math.random() * 4) === 3) {
                type = 'generic';
            } else {
                const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
                const date = new Date();
                type = days[date.getDay()];
            }

            // Get a random image of the chosen image type
            let glitterImage = imageData[type][Math.floor(Math.random() * imageData[type].length)];
            let glitterUrl = `${IMAGE_SOURCE + type}/${glitterImage}`;

            // Sent image to Slack as Glitterbot
            request.post(webhookUrl, {
                form: {
                    payload: JSON.stringify({
                        'icon_emoji': ':sparkles:',
                        'username': 'Glitterbot',
                        'text': glitterUrl
                    })
                }
            });

            console.log('Sent image ' + glitterUrl);
        } else {
            console.log(`Error requesting images.json from ${IMAGE_SOURCE}`);
        }
    });
}

// crontab
// eslint-disable-next-line no-unused-vars
const glitter = new CronJob(CRON, sendGlitter, null, true, timezone);

console.log('Running');