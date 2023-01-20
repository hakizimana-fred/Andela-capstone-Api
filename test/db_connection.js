const mongoose = require('mongoose');
const DB_CONNECTION = require('../constants/DB_CONNECTION');
mongoose.Promise = global.Promise;
require('dotenv').config();


console.log(DB_CONNECTION, 'test');


mongoose.connect(DB_CONNECTION);


mongoose.connection
  .once('open', () => console.log('connected'))
  .on('error', (error) => {
    console.warn('Error: ', error);
  });

beforeEach((done) => {
  mongoose.connection.collections.users.drop(() => {
    done();
  });
});
