var DB = require('mongoose'),
    config = require('./config');

DB.connect('mongodb://' + config.DB.Username + ':' + config.DB.Password + '@' + config.DB.Address);

DB.connection.on('error', console.error.bind(console, 'Connection Error: '));

DB.connection.once('open', function(callback) {
    console.log('Connection Successful!');
});

module.exports = DB;