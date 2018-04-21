const fs = require("fs");
const util = require("util");
const md5File = require("md5-file");

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
      const name = `${path}/${hash}.${file.split(".").pop()}`;
      fs.renameSync(`${path}/${file}`, name);
      images.push(name);
    }
  }
  data[folder] = images;
}

fs.writeFile(`${imageFolder}/${fileName}`, JSON.stringify(data), err => {
  if (err) throw err;
  console.log("images.json saved");
});
