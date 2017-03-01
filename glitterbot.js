const request = require('request');
const schedule = require('node-schedule');
const program = require('commander');

// If you want to use your own server, change this to the place you host the gitterbot /public folder
// This folder needs to include the images.json file
const IMAGE_SOURCE = 'http://glitter.appmantle.com/';

// Default cronjob sends a new Glitterplaatje every weekday at 9:00. 
const CRON = '00 09 * * 1-5';

console.log('Started Glitterbot');

program
  .version('0.0.1')
  .option('-i, --instant', 'Run bot once without starting cronjob')
  .option('-h, --webhook', 'The incoming webhook for you Slack')
  .parse(process.argv);

// If users didn't set a Slack webhook URL, close the bot. 
if (!program.webhook === '') {
    console.log('Please add your Slack incoming webhook URL to index.js');
    process.exit(1);
}

if (!program.instant) {
    schedule.scheduleJob(CRON, sentGlitter());
} else {
    sentGlitter();
}

function sentGlitter() {
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
            request.post(program.webhook, {
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