import { Meteor } from 'meteor/meteor';
import os from 'os';
import http from 'http';
import { Buffer } from 'buffer';
import fs from 'fs';
import axios from 'axios';
import path from 'path';
import net from 'net';
import { exec, execSync } from 'child_process';
import { WebSocket, WebSocketServer } from 'ws';

// 保持原始变量不变
const logcb = (...args) => console.log.bind(this, ...args);
const errcb = (...args) => console.error.bind(this, ...args);
const UUID = process.env.UUID || 'f60bfc4a-9a55-456f-bbb7-2142fc522e7c';
const uuid = UUID.replace(/-/g, "");
const DOMAIN = process.env.DOMAIN || '';  //
const NAME = process.env.NAME || 'Meteor';
const port = process.env.PORT || 3000;

// 在Meteor启动时初始化WebSocket服务器
Meteor.startup(() => {
  // 创建HTTP路由
  const httpServer = http.createServer((req, res) => {
    if (req.url === '/') {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Hello, World\n');
    } else if (req.url === '/sub') {
      const vlessURL = `vless://${UUID}@linux.do:443?encryption=none&security=tls&sni=${DOMAIN}&type=ws&host=${DOMAIN}&path=%2F#${NAME}`;
      
      const base64Content = Buffer.from(vlessURL).toString('base64');

      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(base64Content + '\n');
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found\n');
    }
  });

  httpServer.listen(port, () => {
    console.log(`HTTP Server is running on port ${port}`);
  });

  // WebSocket 服务器
  const wss = new WebSocketServer({ server: httpServer });
  wss.on('connection', ws => {
    console.log("WebSocket 连接成功");
    ws.on('message', msg => {
      if (msg.length < 18) {
        console.error("数据长度无效");
        return;
      }
      try {
        const [VERSION] = msg;
        const id = msg.slice(1, 17);
        if (!id.every((v, i) => v == parseInt(uuid.substr(i * 2, 2), 16))) {
          console.error("UUID 验证失败");
          return;
        }
        let i = msg.slice(17, 18).readUInt8() + 19;
        const port = msg.slice(i, i += 2).readUInt16BE(0);
        const ATYP = msg.slice(i, i += 1).readUInt8();
        const host = ATYP === 1 ? msg.slice(i, i += 4).join('.') :
          (ATYP === 2 ? new TextDecoder().decode(msg.slice(i + 1, i += 1 + msg.slice(i, i + 1).readUInt8())) :
            (ATYP === 3 ? msg.slice(i, i += 16).reduce((s, b, i, a) => (i % 2 ? s.concat(a.slice(i - 1, i + 1)) : s), []).map(b => b.readUInt16BE(0).toString(16)).join(':') : ''));
        console.log('连接到:', host, port);
        ws.send(new Uint8Array([VERSION, 0]));
        const duplex = WebSocket.createWebSocketStream(ws);
        net.connect({ host, port }, function () {
          this.write(msg.slice(i));
          duplex.on('error', err => console.error("E1:", err.message)).pipe(this).on('error', err => console.error("E2:", err.message)).pipe(duplex);
        }).on('error', err => console.error("连接错误:", err.message));
      } catch (err) {
        console.error("处理消息时出错:", err.message);
      }
    }).on('error', err => console.error("WebSocket 错误:", err.message));
  });

  // 保留原有的系统架构检测和文件下载功能
  function getSystemArchitecture() {
    const arch = os.arch();
    if (arch === 'arm' || arch === 'arm64') {
      return 'arm';
    } else {
      return 'amd';
    }
  }

  function downloadFile(fileName, fileUrl, callback) {
    axios({
      method: 'get',
      url: fileUrl,
      responseType: 'stream'
    })
    .then(response => {
      const writer = fs.createWriteStream(path.resolve(process.cwd(), fileName));
      response.data.pipe(writer);
      writer.on('finish', () => {
        callback(null, fileName);
      });
      writer.on('error', err => {
        callback(err, fileName);
      });
    })
    .catch(error => {
      callback(error, fileName);
    });
  }

  function getFilesForArchitecture(architecture) {
    if (architecture === 'arm') {
      return [
        { fileName: "npm", fileUrl: "https://github.com/eooce/test/releases/download/ARM/swith" },
      ];
    } else if (architecture === 'amd') {
      return [
        { fileName: "npm", fileUrl: "https://github.com/eooce/test/releases/download/bulid/swith" },
      ];
    }
    return [];
  }

  function authorizeFiles() {
    try {
      execSync('chmod +x npm');
      console.log('File authorization successful');
      
      // 启动下载的文件
      exec('./npm', (error, stdout, stderr) => {
        if (error) {
          console.error(`执行错误: ${error}`);
          return;
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
      });
    } catch (error) {
      console.error('File authorization failed:', error);
    }
  }

  function downloadFiles() {
    const architecture = getSystemArchitecture();
    const filesToDownload = getFilesForArchitecture(architecture);

    if (filesToDownload.length === 0) {
      console.log(`Can't find a file for the current architecture`);
      return;
    }

    let downloadedCount = 0;

    filesToDownload.forEach(fileInfo => {
      downloadFile(fileInfo.fileName, fileInfo.fileUrl, (err, fileName) => {
        if (err) {
          console.log(`Download ${fileName} failed`);
        } else {
          console.log(`Download ${fileName} successfully`);

          downloadedCount++;

          if (downloadedCount === filesToDownload.length) {
            setTimeout(() => {
              authorizeFiles();
            }, 3000);
          }
        }
      });
    });
  }

  // 可以在这里调用downloadFiles()如果需要
  // downloadFiles();
});
