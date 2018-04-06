const fs = require('fs');
var getPixels = require('get-pixels')
var GifEncoder = require('gif-encoder');
const imgurUploader = require('imgur-uploader');
const util = require('util');

const { convert } = require('convert-svg-to-jpeg');

const writeFile = util.promisify(fs.writeFile);

async function svgToJpegFile(svgString, filename) {
    const jpeg = await convert(svgString);
    await writeFile(filename, jpeg);
};

const numberOfBars = 15;
const imageSize = 500;
const types = ['vert', 'horiz', 'corner', 'burst'];
const type = types[Math.floor(Math.random() * types.length)];
var shape = 'rect';
if (type === 'burst' && Math.random() < 0.5) shape = 'circle';

module.exports = async function(day) {

    var pics = [];
    var colors = [];
    var textColors = [];
    var svgStrings = [];

    for (var i = 0; i < numberOfBars; i++) {
        colors.push("#000000".replace(/0/g, function() { return (~~(Math.random() * 16)).toString(16); }));
    }

    for (var i = 0; i < day.length; i++) {
        textColors.push("#000000".replace(/0/g, function() { return (~~(Math.random() * 16)).toString(16); }));
    }

    for (var frame = 0; frame < numberOfBars; frame++) {
        var svgString = `<svg width="${imageSize}" height="${imageSize}">`

        for (var i = 0; i < numberOfBars; i++) {
            var x = i * imageSize / numberOfBars;
            if (type === 'horiz') x = 0;
            if (type === 'burst') x /= 2;
            var y = i * imageSize / numberOfBars;
            if (type === 'vert') y = 0;
            if (type === 'burst') y /= 2;
            var width = imageSize;
            if (type === 'burst') width *= (numberOfBars - i) / (numberOfBars);
            var height = imageSize;
            if (type === 'burst') height *= (numberOfBars - i) / (numberOfBars);
            var fill = colors[(i + frame) % numberOfBars];
            if (shape === 'rect') {
                svgString += `<rect x=${x} y=${y} width="${width}" height="${height}" style="fill: ${fill};"></rect>`
            } else {
                svgString += `<circle cx="50%" cy="50%" r="${width/2}" style="fill: ${fill};"></circle>`
            }
        }

        const fontSize = Math.round(imageSize / 10) + "px";
        const theta = 2 * Math.PI * frame / numberOfBars;
        const textX = (5 * Math.cos(theta) + 50).toFixed(2);
        const textY = (5 * Math.sin(theta) + 50).toFixed(2);
        var dayText = '';

        // Multicolored string
        for (var i = 0; i < day.length; i++) {
            const fill = textColors[(i + frame) % day.length];
            const letter = day.charAt(i);
            dayText += `<tspan style="fill:${fill};alignment-baseline:middle;text-anchor=middle">${letter}</tspan>`
        }

        svgString += `<text font-family="sans-serif" font-size="${fontSize}" x="${textX}%" y="${textY}%" alignment-baseline="middle" text-anchor="middle">✨${dayText}✨</text>`
        const numberOfSparkles = 8 + Math.round(Math.random()*10);

        for (var i = 0; i < numberOfSparkles; i++) {
            const sparkleX = Math.round(Math.random()*imageSize);
            const sparkleY = Math.round(Math.random()*imageSize);
            const sparkleSize = 15 + Math.floor(Math.random()*8);
            svgString += `<text font-family="sans-serif" font-size="${sparkleSize}px" x="${sparkleX}" y="${sparkleY}" alignment-baseline="middle" text-anchor="middle" fill="white">✨</text>`
        }

        svgString += '</svg>'
        svgStrings.push(svgString);
    }

    var frameNumber = 0;
    for (const s of svgStrings) {
        await svgToJpegFile(s, `frame${frameNumber}.jpg`);
        pics.push(`frame${frameNumber}.jpg`)
        frameNumber++;
    }

    var gif = new GifEncoder(imageSize, imageSize);
    var file = fs.createWriteStream('glitter.gif');

    gif.pipe(file);
    gif.setRepeat(0);
    gif.setQuality(5);
    gif.setDelay(100);
    gif.writeHeader();

    var renderGif = new Promise((resolve, reject) => {
        var addToGif = function(images, counter = 0) {
            getPixels(images[counter], function(err, pixels) {
                if (err) reject(err);
                gif.addFrame(pixels.data);
                gif.read();
                if (counter === images.length - 1) {
                    gif.finish();
                    resolve();
                } else {
                    addToGif(images, ++counter);
                }
            })
        }
        addToGif(pics);
    })

    return renderGif
        .then(() => {
            return new Promise((resolve, reject) => {
                file.on('close', () => {
                    resolve(imgurUploader(fs.readFileSync('glitter.gif'), { title: 'Hello!' }));
                })
            });
        })
        .then(data => data.link);
};