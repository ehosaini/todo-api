var express = require('express');
var bodyParser = require('body-parser');

// ES6 way of destructuring an object and creating a var
// that matches an object property with similar a name
var {
  mongoose
} = require('./db/mongoose');

var {
  Todo
} = require('./models/todo');

var {
  User
} = require('./models/user');


app = express();
// parse request's json body into an object prior to passing
// to route handler
app.use(bodyParser.json());

app.post('/todos', (req, res) => {
  var todo = new Todo({
    text: req.body.text
  });

  todo.save().then((todo) => {
    res.send(todo)
  }, (e) => {
    res.status(400).send(e);
  });

});

app.listen(3000, () => {
  console.log('Started server on port 3000');
});
