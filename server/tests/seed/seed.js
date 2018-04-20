const {
  ObjectID
} = require('mongodb');

const jwt = require('jsonwebtoken');

const {
  Todo
} = require('./../../models/todo.js');

const {
  User
} = require('./../../models/user.js');


// dummy seed Users
const userOneID = new ObjectID();
const userTwoID = new ObjectID();
const userThreeID = new ObjectID();

const users = [{
    _id: userOneID,
    email: 'ehsan@example.com',
    password: 'userOnePass',
    tokens: [{
      access: 'auth',
      token: jwt.sign({
        _id: userOneID.toHexString(),
        access: 'auth'
      }, 'abc123').toString()
    }]
  },
  {
    _id: userTwoID,
    email: 'testUser@gmail.com',
    password: 'somePassword',
  },
  {
    _id: userThreeID,
    email: 'user3@gmail.com',
    password: 'user3Password',
  }
];

// dummy seed Todos
const todos = [{
  _id: new ObjectID(),
  text: 'first test todo',
  _creator: userOneID
}, {
  _id: new ObjectID(),
  text: 'second test todo',
  completed: true,
  completeAt: 5000,
  _creator: userTwoID
}];

const populateTodos = (done) => {
  Todo.remove({}).then(() => {
    Todo.insertMany(todos);
  }).then(() => done());
};

const populateUsers = (done) => {
  User.remove({}).then(() => {
    var userOne = new User(users[0]).save();
    var userTwo = new User(users[1]).save();
    var userThree = new User(users[2]).save();

    return Promise.all([userOne, userTwo, userThree]);
    // return Promise.all([userTwo, userThree]);

  }).then(() => done());
};



module.exports = {
  populateTodos,
  todos,
  populateUsers,
  users
};