const axios = require("axios");
const schedule = require("node-schedule");
const program = require("commander");

// Define command line options and documentation.
program
  .option(
    "-w, --webhook <url>",
    "\x1b[1mRequired: The incoming webhook for your Slack team\x1b[0m"
  )
  .option("-i, --instant", "Run bot once without starting cronjob")
  .option(
    "-c, --cron [cron]",
    "CRON string used for scheduling messages",
    "00 09 * * 1-5"
  )
  .option(
    "-s, --source [url]",
    "The path to where images.json and all images are hosted",
    "https://glitter.appmantle.com"
  )
  .option("-d, --debug", "Log complete axios error messages")
  .parse(process.argv);

// If users didn't provide a Slack webhook URL, close the bot.
if (!program.webhook) {
  console.log("Please provide a Slack webhook URL");
  program.help();
}

// If there is no instant flag, start a cronjob and send a message
// so the user knows it's running.
if (!program.instant) {
  console.log("Glitterbot is running");
  schedule.scheduleJob(program.cron, sendGlitter);
} else {
  sendGlitter();
}

async function sendGlitter() {
  try {
    // Choose if a generic image or a day specific image should be sent.
    // There's a 25% chance a generic image gets chosen.
    if (Math.random() > 0.75) {
      var folder = "generic";
    } else {
      const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
      var folder = days[new Date().getDay()];
    }

    // Fetch the list of all images, and then select a
    // random image of the previously chosen image type.
    const { data } = await axios.get(`${program.source}/images.json`);
    const images = data[folder];
    const image = images[Math.floor(Math.random() * images.length)];
    const url = `${program.source}/${folder}/${image}`;

    // Sent image url to Slack
    postMessage(url);
  } catch (error) {
    if (program.debug) console.log(error);
    console.log(`Error requesting images.json from ${program.source}`);
  }
}

// Posts a Slack message to the webhook as Glitterbot.
async function postMessage(text) {
  try {
    await axios.post(program.webhook, {
      icon_emoji: ":sparkles:",
      username: "Glitterbot",
      text
    });
    console.log("Sent message: " + text);
  } catch (error) {
    if (program.debug) console.log(error);
    console.log("Error sending message to Slack webhook");
  }
}
