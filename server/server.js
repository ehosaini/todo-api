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

const {
  authenticate
} = require('./middleware/authenticate');


var app = express();
const port = process.env.PORT;

// parse request's json body into an object prior to passing
// to route handler
app.use(bodyParser.json());

// GET todos
app.get('/todos', authenticate, (req, res) => {
  Todo.find({
    _creator: req.user._id
  }).then((todos) => {
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
app.post('/todos', authenticate, (req, res) => {
  var todo = new Todo({
    text: req.body.text,
    _creator: req.user._id
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


// POST User
app.post('/users', (req, res) => {
  var userInfo = _.pick(req.body, ['email', 'password']);

  var user = new User(userInfo);

  user.save().then(() => {
    return user.generateAuthToken();
  }).then((token) => {
    res.header('x-auth', token).send(user);
  }).catch((e) => {
    res.status(400).send(e);
  });

});

// authenticate user
app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user);
});

// Login user
app.post('/users/login', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);

  User.findByCrednetial(body.email, body.password).then((user) => {
    return user.generateAuthToken().then((token) => {
      res.header('x-auth', token).send(user);
    });

  }).catch((e) => {
    res.status(400).send(e);
  })

});

// logout user
app.delete('/users/me/token', authenticate, (req, res) => {
  req.user.removeToken(req.token).then(() => {
    res.status(200).send();
  }).catch((e) => {
    res.status(400).send()
  });
});


app.listen(port, () => {
  console.log(`Started server on port ${port}`);
});


// exports app for use in the test modules
module.exports = {
  app
};