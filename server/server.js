// Aaron Renfroe 2017
// External Libraries
const _ = require('lodash');
const express = require('express');
const parser = require('body-parser');
const {ObjectID} = require('mongodb');
const cors = require('cors');


// Local imports
var {authenticate} = require('./middleware/authenticate');
var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');
var {Post} = require('./models/post');
var {GetEvents} = require('./utils/users-events');


// Globals 
var port = process.env.PORT || 3000;
var app = express();
app.use(parser.json()); 
app.use(cors({origin: 'http://localhost:4200', exposedHeaders: 'x-auth'}));

//cors
app.options('*', cors())

// User
// POST /users / create
app.post('/api/user', (req, res) => {
    
    var body = _.pick(req.body, ['email', 'password', 'privleges']);
    if(!body.privleges){
        body.privleges = 'user';
    }

    var user = new User(body);
  
    user.save().then(() => {
      return user.generateAuthToken();
    }).then((token) => {
      res.header('x-auth', token).send(user);
    }).catch((e) => {
      res.status(400).send(e);
    })
  });

  app.get('/api/user/me', authenticate, (req, res) => {
     res.send(req.user);
  });

  app.get('/api/user', authenticate ,(req, res) => {
    let user = req.user;

    if(user.privleges === 'admin'){
        User.find().then((users) => {
            res.send(users);
        });
    }else{
        res.status(400).send();
    }
  });
  
  app.post('/api/user/login', (req, res) => {
      var body = _.pick(req.body, ['email', 'password']);

      User.findByCredentials(body.email, body.password).then((user) => {
          // Good
          user.generateAuthToken().then((token) => {
              res.header('x-auth', token).send(user);
          });
      }).catch((err) => {
          // user not found with creds
          res.status(400).send(err); 
      });
      
  });
  
  
  app.delete('/api/user/me',authenticate, (req, res) => {

      var body = _.pick(req.body, ['email', 'password']);
      req.user.removeToken(req.token).then(() => {
          //resolve
          res.status(200).send();
      }, () => {
          // reject
          res.status(400).send();
      });
      
  });

// get post for user 
// would be called by mobile APP
app.post('/api/posts',(req, res) => {
    var id = req.body['1'];
    var apiToken = req.body['ApiToken'];
    var codeWord = req.body['Jesus'];
    console.log(id, apiToken, codeWord);
    
    // Make CT REquest
    // Get Array of Event ID's
    //Post.findByEventArray([]);
    GetEvents(id, apiToken).then((response) => {
        res.send(response.data);
    }).catch((err) => {
        res.status(401).send();
    })
    
});

// All Other Endpoints will be called by post creation website

// get all post
app.get('/api/post', authenticate,(req, res) => {
    var body = req.body;
    res.send("get post");
});

// create Post
app.post('/api/post', authenticate,(req, res) => {
    var body = req.body;
    res.send("creat post");
});

// delete Post
app.delete('/api/post/:id', authenticate,(req, res) => {
    var id = req.params['id'];
    res.send("delete post");
});

// update post
app.patch('/api/post/:id', authenticate, (req, res) => {
    var id = req.params['id'];
    res.send("update post");
});


app.listen(port, () => {
    console.log(`Serving on port:   ${port}`);
});