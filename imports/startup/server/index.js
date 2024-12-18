import { Meteor } from 'meteor/meteor';
import fs from 'fs';
import path from 'path';

// 设置文件路径
const FILE_PATH = process.env.FILE_PATH || './tmp';

// 确保目录存在
Meteor.startup(() => {
  if (!fs.existsSync(FILE_PATH)) {
    fs.mkdirSync(FILE_PATH);
    console.log(`${FILE_PATH} is created`);
  } else {
    console.log(`${FILE_PATH} already exists`);
  }
});
