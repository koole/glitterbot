const fs = require('fs');
var getPixels = require('get-pixels')
var GifEncoder = require('gif-encoder');
const util = require('util');

var jsdom;
try {
    jsdom = require("jsdom/lib/old-api.js"); // jsdom >= 10.x
} catch (e) {
    jsdom = require("jsdom"); // jsdom <= 9.x
}

const { convert } = require('convert-svg-to-jpeg');

const writeFile = util.promisify(fs.writeFile);

async function svgToJpegFile(svgString, filename) {
    const jpeg = await convert(svgString);
    await writeFile(filename, jpeg);
};

const numberOfBars = 10;
const imageSize = 500;

jsdom.env(
    "<html><body></body></html>", // CREATE DOM HOOK
    ['http://d3js.org/d3.v3.min.js'], // JS DEPENDENCIES online 

    async function(err, window) {
        var pics = [];
        var colors = [];
        for (var i = 0; i < numberOfBars; i++) {
            colors.push("#000000".replace(/0/g, function() { return (~~(Math.random() * 16)).toString(16); }));
        }

        for (var frame = 0; frame < numberOfBars; frame++) {
            var svg = window.d3.select("body")
                .append("svg")
                .attr("width", imageSize)
                .attr("height", imageSize);
            for (var i = 0; i < numberOfBars; i++) {
                svg.append("rect")
                    .attr("id", "rect" + i)
                    .attr("x", i * imageSize / numberOfBars)
                    .attr("y", i * imageSize / numberOfBars)
                    .attr("width", imageSize)
                    .attr("height", imageSize)
                    .style("fill", colors[(i + frame) % numberOfBars]);
            }
            svg.append("text")
                .attr("font-family", "sans-serif")
                .attr("font-size", Math.round(imageSize / numberOfBars) + "px")
                .attr("x", "50%")
                .attr("y", "50%")
                .attr("alignment-baseline", "middle")
                .attr("text-anchor", "middle")
                .attr("fill", "white")
                .text('Monday✨')

            var svgString = window.d3.select("body").html();
            svgString = svgString.slice(svgString.indexOf("<svg"));
            // convert string to jpg file
            await svgToJpegFile(svgString, `testing${frame}.jpg`);
            // var imageAsBase64 = fs.readFileSync(`testing${frame}.jpg`, 'base64');
            pics.push(`testing${frame}.jpg`)
            console.log(window.d3.select("body").html())
            window.d3.select("svg").remove();
            console.log(window.d3.select("body").html())
            // console.log("data:image/jpeg;base64," + imageAsBase64);
        }

        var gif = new GifEncoder(imageSize, imageSize);
        var file = fs.createWriteStream('img.gif');

        gif.pipe(file);
        gif.setRepeat(0);
        gif.setQuality(20);
        gif.setDelay(100);
        gif.writeHeader();

        var addToGif = function(images, counter = 0) {
            getPixels(images[counter], function(err, pixels) {
                gif.addFrame(pixels.data);
                gif.read();
                if (counter === images.length - 1) {
                    gif.finish();
                } else {
                    addToGif(images, ++counter);
                }
            })
        }
        addToGif(pics);

        const imgurUploader = require('imgur-uploader');

        // imgurUploader(fs.readFileSync('img.gif'), { title: 'Hello!' }).then(data => {
        //     console.log(data);
        // });
    }
);