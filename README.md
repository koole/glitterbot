<div align="center">
<img src="https://glitterbot.dekoolecentrale.nl/logo.png" width="256px">

# Glitterbot

### _Your teams daily source of motivation_

[![dependencies Status](https://david-dm.org/appmantle/glitterbot/status.svg)](https://david-dm.org/appmantle/glitterbot)
[![Code Climate](https://img.shields.io/codeclimate/issues/appmantle/glitterbot.svg)](https://codeclimate.com/github/appmantle/glitterbot)
[![Code Climate](https://codeclimate.com/github/appmantle/glitterbot/badges/gpa.svg)](https://codeclimate.com/github/appmantle/glitterbot)
![License](https://img.shields.io/github/license/appmantle/glitterbot.svg)

<br>
<br>
</div>

Glitterbot is a free and open source [Slack](http://slack.com) bot. The bot improves your team's productivity by boosting your teams morale each morning. Glitterbot accomplishes this morale boost by posting a new Glitterplaatje at the start of each day.

For more information, visit the [Glitterbot website](https://glitterbot.dekoolecentrale.nl/).

### After adopting Glitterbot, how much more productive is your team?

> Glitterbot has greatly improved our teams morale. It makes our employees feel like their work has a higher purpose. Each new Glitterplaatje gives us a way to recognize our team members for a job well done.
>
> _- [Bert-Jan Verwer](https://github.com/verwer)_

> Glitterbot is polluting the chat.
>
> _- [Ryan Warsaw](https://github.com/ryanwarsaw)_

> I love Glitterbot! Waking up every day and receiving my daily dose of motivation from Glitterbot always boosts my productivity 🤔🙏
>
> _- [Kailan Blanks](https://github.com/kailan)_

### What Glitterbot looks like
![Slack screenshot](example.png)

## Usage
You can host the Glitterplaatjes on your own web server, or use the Appmantle Glitter CDN as the source for the images. The Glitter CDN will always be up-to-date allowing you and your team to receive the latest and greatest Glitterplaatjes.

This bot is written in JavaScript and requires Node.js to run.

### Setup
1. Create a new coming webhook on slack and select the channel you want your Glitterplaatjes to be send to
2. Clone Glitterbot to your own machine
3. Install all dependencies by running `npm install`
4. Start the bot using `node glitterbot.js --webhook [URL]`, where `[URL]` the incoming webhook you just made.


### Using your own images
If you don't like the Glitterplaatjes (What?!), Glitterbot can also send your team your own custom images. 

1. Follow the instructions in the [koole/glittercdn](https://github.com/koole/glittercdn) repository.

2. Change the source of the image host to your new host using the `--source` option.

### Configuration
You can add these options when running Glitterbot to change settings.

Option | Usage
--- | ---
`-w, --webhook <url>` | Required: The URL of your incoming Slack webhook. You can configure these for in the [Slack App Directory](slack.com/apps/manage/custom-integrations)
`-i, --instant` | When using this flag, the bot will instantly send an image to your Slack without starting a Cronjob.
`-c, --cron [cron]` | CRON string used for scheduling messages (default: 00 09 * * 1-5)
`-s, --source [url]` | The path to where images.json and all images are hosted. By default this is our Glitter CDN.
`-h, --help` | Output usage information

## Contributing
### Adding new Glitterplaatjes
To add new Glitterplaatjes follow the instructions in the [koole/glittercdn](https://github.com/koole/glittercdn) repository.

### Improving code
At Appmantle, we're always open to outside contributions to our projects. If you've ran into a bug or have found any code or documentation to improve, feel free to make a pull request with a bugfix or other improvements. If you don't know how to fix a bug yourself, just open a new issue and we'll try to fix it.
