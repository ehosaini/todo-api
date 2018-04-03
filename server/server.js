const express = require('express');
const bodyParser = require('body-parser');


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

// mongodb driver utility
var {
  ObjectID
} = require('mongodb');



var app = express();
// parse request's json body into an object prior to passing
// to route handler
app.use(bodyParser.json());

// GET todos
app.get('/todos', (req, res) => {
  Todo.find().then((todos) => {
    // ES6 syntax for {todos: todos}
    res.send({
      todos
    });
  }, (e) => {
    res.status(400).send(e);
  });
});

// GET an specific todo
app.get('/todos/:id', (req, res) => {

  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(400).send({
      error: 'ID is not valid'
    });
  }

  Todo.findById(id).then((todo) => {
    if (!todo) {
      res.status(404).send();
    }
    res.send({
      todo
    });
  }).catch((e) => res.status(400).send());

});

// POST todos
app.post('/todos', (req, res) => {
  var todo = new Todo({
    text: req.body.text
  });

  todo.save().then((todo) => {
    res.send(todo);
  }, (e) => {
    res.status(400).send(e);
  });

});

app.listen(3000, () => {
  console.log('Started server on port 3000');
});

// exports app for use in the test modules
module.exports = {
  app
};
