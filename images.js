const fs = require("fs");
const util = require("util");
const md5File = require("md5-file");

// Set this to true if you want to remove all images larger than 2MB
const removeBig = false;

// Settings
const imageFolder = "./public";
const folders = ["generic", "mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const fileName = "images.json";

const data = {};

for (const folder of folders) {
  let images = [];
  const files = fs.readdirSync(`${imageFolder}/${folder}`);
  for (const file of files) {
    if (file.match(/\.((?:gif|jpg|jpeg|png))(?:[\?#]|$)/i)) {
      const path = `${imageFolder}/${folder}`;
      const hash = md5File.sync(`${path}/${file}`);
      const name = `${hash}.${file.split(".").pop()}`;
      fs.renameSync(`${path}/${file}`, `${path}/${name}`);
      images.push(name);

      // Check for filesize, see issue #1
      const {size} = fs.statSync(`${path}/${name}`);
      if(size > 2000000) {
        console.log(`Warning! Size of ${name} is too large!`)
        if(removeBig) {
          console.log("File removed")
          fs.unlinkSync(name)
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
