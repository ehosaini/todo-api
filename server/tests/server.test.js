const expect = require('expect');
const request = require('supertest');
const {
  ObjectID
} = require('mongodb');

const {
  app
} = require('./../server');
const {
  Todo
} = require('./../models/todo');
const {
  User
} = require('./../models/user');

const {
  populateTodos,
  todos,
  populateUsers,
  users
} = require('./seed/seed.js');

beforeEach(populateUsers);

beforeEach(populateTodos);

describe('POST Todos', () => {
  it('should post a todo', (done) => {
    var text = 'Lets test this todo';

    request(app)
      .post('/todos')
      .send({
        text
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        // check that todo is persisted to the db
        Todo.find({
          text
        }).then((todos) => {
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe(text);
          done();
        }).catch((e) => done(e));
      })
  });

  it('shouldn\'t post a todo with invalid body data', (done) => {

    request(app)
      .post('/todos')
      .send({
        text: ''
      })
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find().then((todos) => {
          expect(todos.length).toBe(2);
          done();
        }).catch((e) => done(e))
      });
  });
});

describe('GET /todos', () => {
  it('should get all todos', (done) => {
    request(app)
      .get('/todos')
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(2);
      })
      .end(done);
  })
});

describe('GET /todos/:id', () => {
  it('should return a todo doc', (done) => {
    // convert the object id to string
    var id = todos[0]._id.toHexString();

    request(app)
      .get(`/todos/${id}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todos[0].text);
      })
      .end(done);
  });

  it('should return 400 if todo not found', (done) => {
    var nonExistentId = new ObjectID().toHexString();

    request(app)
      .get(`/todos/${nonExistentId}`)
      .expect(404)
      .end(done)
  });

  it('should return 404 for non-object ids', (done) => {
    request(app)
      .get('/todos/123')
      .expect(400)
      .end(done);
  })
});

describe('DELETE /todos/:id', () => {
  it('should delete todo a todo', (done) => {
    var todo = todos[0];
    var todoID = todo._id.toHexString();

    request(app)
      .delete(`/todos/${todoID}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todo.text);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.findById(todoID).then((res) => {
          expect(res).toNotExist();
          done()
        });
      });
  });

  it('should return 404 if todo not found', (done) => {
    var todoID = new ObjectID();

    request(app)
      .delete(`/todos/${todoID.toHexString()}`)
      .expect(404)
      .end(done);
  })

  it('should return 404 if todo is not valid', (done) => {
    var todoID = 1234;

    request(app)
      .delete(`/todos/${todoID}`)
      .expect(400)
      .end(done);
  })
})

describe('PATCH todos/:id', () => {


  it('should update a todo as complete', (done) => {

    var todoID = todos[0]._id.toHexString();

    request(app)
      .patch(`/todos/${todoID}`)
      .send({
        completed: true
      })
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err)
        }

        Todo.findById(todoID).then((todo) => {
          expect(todo.completed).toBe(true);
          done();
        });
      });
  });

  it('should change todo status to false', (done) => {
    var todoID = todos[1]._id.toHexString();

    request(app)
      .patch(`/todos/${todoID}`)
      .send({
        completed: false
      })
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err)
        }

        Todo.findById(todoID).then((todo) => {
          expect(todo.completed).toBe(false);
          done();
        });
      })
  })
});

describe('GET /users/me', () => {
  it('should return user if authenicated', (done) => {
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body._id).toBe(users[0]._id.toHexString());
        expect(res.body.email).toBe(users[0].email);
      })
      .end(done);
  });

  it('should return 401 if not authenticated', (done) => {
    request(app)
      .get('/users/me')
      .expect(401)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });
})

describe('POST /users', () => {
  it('should create a user', (done) => {
    var email = 'testUser@example.com';
    var password = '123qaz#'
    request(app)
      .post('/users')
      .send({
        email,
        password
      })
      .expect(200)
      .expect((res) => {
        expect(res.header['x-auth']).toExist();
        expect(res.body._id).toExist();
        expect(res.body.email).toBe(email);
      })
      .end((err) => {
        if (err) {
          return done(err);
        }

        User.findOne({
          email
        }).then((user) => {
          expect(user.email).toBe(email);
          expect(user.password).toNotBe(password);
          done();
        }).catch((e) => {
          done(e);
        });

      });
  });

  it('should return validation errors if record invalid', (done) => {
    var invalidUser = {
      email: 'testEmail@email.com',
      password: '123rt'
    };

    request(app)
      .post('/users')
      .send(invalidUser)
      .expect(400)
      .end(done)
  });

  it('should return erro if user in user', (done) => {
    var duplicateUser = {
      email: users[0].email,
      password: '123ujht)'
    };

    request(app)
      .post('/users')
      .send(duplicateUser)
      .expect(400)
      .end(done);
  });
});

// describe('POST /users/login', () => {
//   it('should login user and return auth token', (done) => {
//     var email = users[1].email;
//     var password = users[1].password;
//
//     request(app)
//       .post('/users/login')
//       .send({
//         email,
//         password
//       })
//       .expect(200)
//       .expect((res) => {
//         expect(res.headers['x-auth']).toExist();
//       })
//       .end((err, res) => {
//         if (err) {
//           return done(err);
//         }
//
//         User.findById(users[1]._id).then((user) => {
//           expect(user.tokens[1]).toInclude({
//             access: 'auth',
//             token: res.headers['x-auth']
//           });
//           done()
//         }).catch((e) => done(e));
//       });
//   });
//
//   it('should reject invalid login', (done) => {
//     var invalidCredential = {
//       email: users[1].email,
//       password: users[1].password + 1
//     }
//
//     request(app)
//       .post('/users/login')
//       .send(invalidCredential)
//       .expect(400)
//       .expect((res) => {
//         expect(res.header['x-auth']).toNotExist();
//       })
//       .end((err, res) => {
//         if (err) {
//           return done(err);
//         }
//
//         User.findById(users[1]._id).then((user) => {
//           expect(user.tokens.length).toBe(0);
//           done()
//         }).catch((e) => done(e));
//       });
//   })
// });

describe('DELETE /users/me/token', () => {
  it('should logout user and delete token', (done) => {
    var token = users[0].tokens[0].token;
    request(app)
      .delete('/users/me/token')
      .set('x-auth', token)
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err);
        }

        User.findById(users[0]._id).then((user) => {
          expect(user.tokens.length).toBe(0);
          done();
        }).catch((e) => {
          done(e);
        });
      })
  });

  it('should return Error if token is invalid', (done) => {
    var token = users[0].tokens[0].token;
    request(app)
      .delete('/users/me/token')
      .set('x-auth', token + 1)
      .expect(401)
      .end(done);
  });
})