require('./config/config.js');
const express = require('express');
const bodyParser = require('body-parser');


// ES6 way of destructuring an object and creating a var
// that matches an object property with similar a name
const {
  mongoose
} = require('./db/mongoose');

const {
  Todo
} = require('./models/todo');

const {
  User
} = require('./models/user');

// mongodb driver utility
const {
  ObjectID
} = require('mongodb');

const {
  _
} = require('lodash');



var app = express();
const port = process.env.PORT;

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

// GET a specific todo
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

// DELETE todos
app.delete('/todos/:id', (req, res) => {
  var todoID = req.params.id;
  if (!ObjectID.isValid(todoID)) {
    return res.status(400).send({
      error: 'That is not valid todo ID.'
    });
  }
  Todo.findOneAndRemove({
    _id: todoID
  }).then((todo) => {
    if (!todo) {
      return res.status(404).send('Couldn\'nt find that todo.');
    }
    var message = 'todo was removed';
    res.status(200).send({
      message,
      todo
    })
  }).catch((e) => res.status(400).send())
});

// UPDATE a todo
app.patch('/todos/:id', (req, res) => {
  var todoID = req.params.id;
  var body = _.pick(req.body, ['text', 'completed']);

  if (!ObjectID.isValid(todoID)) {
    return res.status(400).send({
      error: 'That is not valid todo ID.'
    });
  }

  if (_.isBoolean(body.completed) && body.completed) {
    body.completeAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completeAt = null;
  }

  Todo.findByIdAndUpdate(todoID, {
    $set: body
  }, {
    new: true
  }).then((todo) => {
    if (!todo) {
      res.status(404).send({
        error: 'todo not found'
      });
    }

    res.status(200).send({
      todo
    });
  }).catch((e) => {
    res.status(404).send();
  })
});

app.listen(port, () => {
  console.log(`Started server on port ${port}`);
});

// exports app for use in the test modules
module.exports = {
  app
};
