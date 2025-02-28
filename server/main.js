import { Meteor } from 'meteor/meteor';
import '../imports/api/websocket-server.js';

Meteor.startup(() => {
  console.log('Meteor server has started');
});
