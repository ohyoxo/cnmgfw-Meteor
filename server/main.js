import { Meteor } from 'meteor/meteor';
import { WebApp } from 'meteor/webapp';
import '../imports/startup/server';
import '../imports/api/logs';
import './methods';

// 设置环境变量
const FILE_PATH = process.env.FILE_PATH || Assets.absoluteFilePath('tmp');
const PORT = process.env.PORT || 3000;

// 创建临时目录
if (!fs.existsSync(FILE_PATH)) {
  fs.mkdirSync(FILE_PATH, { recursive: true });
  console.log(`${FILE_PATH} is created`);
}

// 设置基本路由
WebApp.connectHandlers.use('/', (req, res) => {
  res.writeHead(200);
  res.end('Hello world!');
});

Meteor.startup(() => {
  console.log(`Server is running on port: ${PORT}`);
});
