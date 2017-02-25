const request = require('request');
const schedule = require('node-schedule');

// The incoming webhook URL for your Slack team
// This is the only value you NEED to change for this bot to work.
const SLACK_WEBHOOK_URL = '';

// If you want to use your own server, change this to the place you host the gitterbot /public folder
// This folder needs to include the images.json file
const IMAGE_SOURCE = 'http://glitter.appmantle.com/';

// Default cronjob sends a new Glitterplaatje every weekday at 9:00. 
const CRON = '00 09 * * 1-5';

console.log('Started Glitterbot');

// If users didn't set a Slack webhook URL, close the bot. 
if(SLACK_WEBHOOK_URL === '') {
    console.log('Please add your Slack incoming webhook URL to index.js');
    process.exit(1);
}

schedule.scheduleJob(CRON, () => {

    // Get the list of images from the image source
    request(IMAGE_SOURCE + 'images.json', function (error, response, body) {
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
            let glitterUrl = IMAGE_SOURCE + type + '/' + glitterImage;

            // Sent image to Slack as Glitterbot
            request.post(SLACK_WEBHOOK_URL, {
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
            console.log('Error requesting images.json from ' + IMAGE_SOURCE);
        }
    });
});