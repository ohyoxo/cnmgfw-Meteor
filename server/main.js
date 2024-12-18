import { Meteor } from 'meteor/meteor';
import { WebApp } from 'meteor/webapp';
import '../imports/startup/server';
import '../imports/api/logs';
import './methods';

// 设置环境变量
const FILE_PATH = process.env.FILE_PATH || Assets.absoluteFilePath('tmp');
Meteor.settings.public.PORT = process.env.PORT || 3000;

// 创建express中间件来处理原始路由
WebApp.connectHandlers.use('/', (req, res, next) => {
  if (req.url === '/') {
    res.writeHead(200);
    res.end('Hello world!');
  } else {
    next();
  }
});
