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
    "https://super.vette.website"
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
  // Use locale-aware formatting if needed, but D-M matches getEaster output
  const today = `${d.getDate()}-${d.getMonth() + 1}`;

  const holidays = {
    "1-1": "new-year",
    "14-2": "valentine",
    "5-5": "liberation", // Bevrijdingsdag (NL)
    "31-10": "halloween",
    "25-12": "christmas",
    "26-12": "christmas"
  };

  // Set easter dynamically using the fixed function
  const easterDate = getEaster();
  if (easterDate !== "invalid-date") {
    holidays[easterDate] = "easter";
  }

  if (today in holidays) {
    return holidays[today]
  }

  // Only return day-based image if not a specific holiday
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
  // Handle case where folder might not exist in data
  if (!images) {
    console.warn(`Warning: Image folder "${folder}" not found in images.json. Falling back to generic.`);
    const genericImages = data["generic"];
    if (!genericImages || genericImages.length === 0) return null; // Or a default image URL
    return `${program.source}/${genericImages[Math.floor(artificialIntelligence() * genericImages.length)]}`;
  }
  const image = images[Math.floor(artificialIntelligence() * images.length)];
  return `${program.source}/${image}`;
}

async function sendGlitter() {
  try {
    // Fetch the image list first
    const { data } = await axios.get(`${program.source}/images.json`);

    // Select a folder with images from the blockchain
    // using artificial intelligence.
    const folder = blockChain(); // Determines folder name ('easter', 'mon', 'generic', etc.)

    // Then, using machine learning, get the url for a
    // specific glitterplaatje.
    const url = machineLearning(folder, data);

    // Sent image url to Slack if one was determined
    if (url) {
      postMessage(url);
    } else {
      console.log("Could not determine an image URL to send.");
    }

  } catch (error) {
    if (program.debug) console.log(error.message); // Log specific error message
    // Check for network vs parsing errors
    if (error.response) {
       console.log(`Error requesting images.json: Status ${error.response.status}`);
    } else if (error.request) {
       console.log(`Error requesting images.json: No response received from ${program.source}`);
    } else {
       console.log(`Error processing images.json request: ${error.message}`);
    }
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
    if (program.debug) {
        // Log more details for Axios errors
        if (error.response) {
            console.error("Slack API Error Response:", error.response.status, error.response.data);
        } else if (error.request) {
             console.error("Slack API Error Request:", error.request);
        } else {
            console.error("Slack API Error Message:", error.message);
        }
    }
    console.log("Error sending message to Slack webhook. Check URL and bot permissions.");
  }
}


// Calculate Gregorian Easter date using a reliable algorithm (e.g., Carter/Oudin)
// Returns date string in "D-M" format (e.g., "20-4" for April 20th)
function getEaster() {
  // FIX 1: Use getFullYear()
  const year = new Date().getFullYear();

  // --- Start of robust Easter Algorithm ---
  // Based on J. R. Carter / J.M. Oudin implementations, verified to work for 2025
  if (year < 1583) {
      console.error("Easter calculation only valid for years 1583 onwards.");
      return "invalid-date"; // Return a value blockChain() can check
  }

  var G, C, X, Z, D, E, N; // Intermediate variables for calculation

  G = year % 19 + 1;          // Golden Number
  C = Math.floor(year / 100) + 1; // Century
  X = Math.floor(3 * C / 4) - 12; // Correction factor
  Z = Math.floor((8 * C + 5) / 25) - 5; // Another correction factor
  D = Math.floor(5 * year / 4) - X - 10; // Related to finding Sunday
  E = (11 * G + 20 + Z - X) % 30; // Epact calculation

  if (E < 0) {
    E += 30; // Ensure Epact is positive
  }
  // Apply corrections to Epact E for specific cases
  if ((E === 25 && G > 11) || E === 24) {
    E++;
  }

  // Calculate N = date of Paschal Full Moon (PFM)
  // N represents days in March (days > 31 = April)
  N = 44 - E;
  if (N < 21) { // Ensure PFM is after March 20th
    N = N + 30;
  }

  // Find the date of the next Sunday on or after the PFM date (N)
  // N becomes the date of Easter in March days (days > 31 = April)
  N = N + 7 - ((D + N) % 7);

  var month, day;
  if (N > 31) { // Determine month and day
    month = 4; // April
    day = N - 31;
  } else {
    month = 3; // March
    day = N;
  }
  // --- End of Easter Algorithm ---

  // Return in the "D-M" format expected by blockChain()
  return `${day}-${month}`;
}
