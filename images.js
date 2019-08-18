const fs = require("fs");
const md5File = require("md5-file");
const readimage = require("readimage");
var Jimp = require('jimp');

// Set this to true if you want to remove all images larger than 2MB
const removeBig = false;

// Settings
const imageFolder = "./public";
const folders = [
  "generic",
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
  "new-year",
  "easter",
  "liberation",
  "valentine",
  "halloween",
  "christmas"
];
const fileName = "images.json";

const data = {};

for (const folder of folders) {
  let images = [];
  const files = fs.readdirSync(`${imageFolder}/${folder}`);
  for (const file of files) {
    if (file.match(/\.((?:gif|jpg|jpeg|png))(?:[\?#]|$)/i)) {
      const path = `${imageFolder}/${folder}`;
      const hash = md5File.sync(`${path}/${file}`);
      const filetype = file.split(".").pop();
      const name = `${hash}.${filetype}`;
      
      // Check if gifs have multiple frames
      if(filetype == "gif") {
        var gifFile = fs.readFileSync(`${path}/${file}`)
        readimage(gifFile, function (err, image) {
          if (err) {
            console.log("failed to parse the image")
            console.log(err)
          }
          const frames = image.frames.length;
          // If a gif has only a single frame it gets converted into a PNG file
          // so Telegram will show it properly
          if(frames === 1) {
            const pngName = `${path}/${hash}.png`;
            console.log(`${path}/${name} has 1 frame, converting to PNG`)
            Jimp.read(gifFile, (err, image) => {
              if (err) throw err;
              image.write(pngName);
              images.push(pngName);
              // Remove the old gif file
              try {
                fs.unlinkSync(`${path}/${file}`)
              } catch(err) {
                console.error(err)
              }
            });
          // Otherwise also only rename the file
          } else {
            fs.renameSync(`${path}/${file}`, `${path}/${name}`);
            images.push(name);
          }
        })
      // Rename all non gif files right away
      } else {
        fs.renameSync(`${path}/${file}`, `${path}/${name}`);
        images.push(name);
      }

      // Check for filesize, see issue #1
      const { size } = fs.statSync(`${path}/${name}`);
      if (size > 2000000) {
        console.log(`Warning! Size of ${name} is too large!`);
        if (removeBig) {
          console.log("File removed");
          fs.unlinkSync(name);
        }
      }
    }
  }
  data[folder] = images;
}

fs.writeFile(`${imageFolder}/${fileName}`, JSON.stringify(data), err => {
  if (err) throw err;
  console.log("images.json saved");
});
