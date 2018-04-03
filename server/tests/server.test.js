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

// dummy seed Todos
const todos = [{
  _id: new ObjectID(),
  text: 'first test todo'
}, {
  _id: new ObjectID(),
  text: 'second test todo'
}]

// delete db entries before each testcase
beforeEach((done) => {
  Todo.remove({}).then(() => {
    Todo.insertMany(todos);
  }).then(() => done());
});

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
