import { Meteor } from 'meteor/meteor';
import { WebApp } from 'meteor/webapp';
import '../imports/startup/server';
import '../imports/api/methods';

Meteor.startup(() => {
  // 服务器启动时的初始化代码
  console.log(`Server is running on port: ${process.env.PORT || 3000}`);
});
