import { Meteor } from 'meteor/meteor';
import { WebApp } from 'meteor/webapp';
import fs from 'fs';
import path from 'path';

const FILE_PATH = process.env.FILE_PATH || './tmp';
const subTxtPath = path.join(FILE_PATH, 'log.txt');

if (Meteor.isServer) {
  // 确保目录存在
  if (!fs.existsSync(FILE_PATH)) {
    fs.mkdirSync(FILE_PATH);
    console.log(`${FILE_PATH} is created`);
  } else {
    console.log(`${FILE_PATH} already exists`);
  }

  // 设置日志路由
  WebApp.rawConnectHandlers.use('/log', (req, res) => {
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
}
