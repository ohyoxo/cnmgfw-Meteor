import { Meteor } from 'meteor/meteor';
import { WebApp } from 'meteor/webapp';
import '../imports/api/logs';
import '../imports/startup/server/file-handler';

Meteor.startup(() => {
  // 设置基础路由
  WebApp.rawConnectHandlers.use('/', (req, res, next) => {
    if (req.url === '/') {
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end('Hello world!');
    } else {
      next();
    }
  });
});
