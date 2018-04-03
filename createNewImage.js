const { convert } = require('convert-svg-to-jpeg');

const fs = require('fs');
const util = require('util');
const writeFile = util.promisify(fs.writeFile);

async function svgToJpegFile(svgString, filename) {
	const jpeg = await convert(svgString);
	await writeFile(filename, jpeg);
};

var jsdom;

try {
    jsdom = require("jsdom/lib/old-api.js"); // jsdom >= 10.x
} catch (e) {
    jsdom = require("jsdom"); // jsdom <= 9.x
}

jsdom.env(
    "<html><body></body></html>", // CREATE DOM HOOK
    ['http://d3js.org/d3.v3.min.js'], // JS DEPENDENCIES online 

    async function(err, window) {

        // D3JS CODE * * * * * * * * * * * * * * * * * * * * * * * *
        var svg = window.d3.select("body")
            .append("svg")
            .attr("width", 100)
            .attr("height", 100);

        svg.append("rect")
            .attr("id", "rect1")
            .attr("x", 10)
            .attr("y", 10)
            .attr("width", 85)
            .attr("height", 80)
            .style("fill", "green");
        // END (D3JS) * * * * * * * * * * * * * * * * * * * * * * * *

        //PRINTING OUT SELECTION
        svgString = window.d3.select("body").html();
        svgString = svgString.slice(svgString.indexOf("<svg"));
        // convert string to jpg file
        await svgToJpegFile(svgString, 'testing1.jpg');
        var imageAsBase64 = fs.readFileSync('testing1.jpg', 'base64');
        console.log(imageAsBase64)
    } // end function
);
