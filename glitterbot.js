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

// Returns a random number between 0 and 1
function artificialIntelligence() {
  return Math.random();
}

// Choose if a generic image or a day specific image should be sent.
// There's a 25% chance a generic image gets chosen.
function blockChain() {
  const d = new Date();
  // const today = `${d.getDate()}-${d.getMonth() + 1}`;
  const today = "14-2"

  const holidays = {
    "1-1": "new-year",
    "14-2": "valentine",
    "5-5": "liberation",
    "31-10": "halloween",
    "25-12": "christmas",
    "26-12": "christmas"
  };
  // Set easter dynamically
  holidays[getEaster()] = "easter"

  if (today in holidays) {
    return holidays[today]
  }

  if (artificialIntelligence() > 0.75) {
    return "generic";
  }

  const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  return days[new Date().getDay()];
}

// Fetch the list of all images, and then select a
// random image of the previously chosen image type.
function machineLearning(folder, data) {
  const images = data[folder];
  const image = images[Math.floor(artificialIntelligence() * images.length)];
  return `${program.source}/${folder}/${image}`;
}

async function sendGlitter() {
  try {
    // Select a folder with images from the blockchain
    // using artificial intelligence.
    const folder = blockChain();

    // Then, using machine learning, get the url for a
    // specific glitterplaatje.
    const { data } = await axios.get(`${program.source}/images.json`);
    const url = machineLearning(folder, data);

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

function getEaster() {
  const year = new Date().getYear();
  var f = Math.floor,
    // Golden Number - 1
    G = year % 19,
    C = f(year / 100),
    // related to Epact
    H = (C - f(C / 4) - f((8 * C + 13) / 25) + 19 * G + 15) % 30,
    // number of days from 21 March to the Paschal full moon
    I = H - f(H / 28) * (1 - f(29 / (H + 1)) * f((21 - G) / 11)),
    // weekday for the Paschal full moon
    J = (year + f(year / 4) + I + 2 - C + f(C / 4)) % 7,
    // number of days from 21 March to the Sunday on or before the Paschal full moon
    L = I - J,
    month = 3 + f((L + 40) / 44),
    day = L + 28 - 31 * f(month / 4);

  return `${day}-${month}`;
}
