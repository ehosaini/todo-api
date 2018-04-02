const expect = require('expect');
const request = require('supertest');

const {
  app
} = require('./../server');
const {
  Todo
} = require('./../models/todo');

// dummy seed Todos
const todos = [{
  text: 'first test todo'
}, {
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

describe('GET todos', () => {
  it('should get all todos', (done) => {
    request(app)
      .get('/todos')
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(2);
      })
      .end(done);
    // .end((err, res) => {
    //   if (err) {
    //     return done(err);
    //   }
    //   Todo.count().then((todos) => {
    //     expect(todos).toBe(2);
    //   }).catch((e) => done(e));
    //   done();
    // })
  })
})
