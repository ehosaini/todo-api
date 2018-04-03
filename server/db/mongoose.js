var mongoose = require('mongoose');

// mongoose to use the built-in promise library
mongoose.Promise = global.Promise;

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/TodoApp');

module.exports = {
  mongoose
}
