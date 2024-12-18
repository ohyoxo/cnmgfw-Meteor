import { Meteor } from 'meteor/meteor';
import { WebApp } from 'meteor/webapp';
import fs from 'fs';
import path from 'path';

const FILE_PATH = process.env.FILE_PATH || Assets.absoluteFilePath('tmp');
const subTxtPath = path.join(FILE_PATH, 'log.txt');

// 设置日志路由
WebApp.connectHandlers.use('/log', (req, res, next) => {
  fs.readFile(subTxtPath, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.writeHead(500);
      res.end("Error reading log.txt");
    } else {
      res.writeHead(200, {
        'Content-Type': 'text/plain; charset=utf-8'
      });
      res.end(data);
    }
  });
});
