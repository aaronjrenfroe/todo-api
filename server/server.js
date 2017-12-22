// Aaron Renfroe 2017
// External Libraries
const _ = require('lodash');
const express = require('express');
const parser = require('body-parser');
const {ObjectID} = require('mongodb');

// Local imports
var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');

// Globals 
var port = 3000;
var app = express();
app.use(parser.json());

// get by id
app.get('/api/todo/:id', (req, res) => {
    var id = req.params['id'];
    if(!ObjectID.isValid(id)){
        res.status(404).send("Invalid ID");
        
    }else{
        Todo.findById(id).then((doc) => {
            if(doc){
                res.send(docs);
            }else{
                res.status(400).send();
            }
        }, (err) => {
            res.status(400).send(err);
        });
    }
});

// get all
app.get('/api/todo', (req, res) => {
    Todo.find().then((docs) => {
        res.send(docs);
    }, (err) => {
        res.status(400).send(err);
    });
});

// create
app.post('/api/todo', (req, res) => {
    var body = req.body;
    var todo = new Todo(body);
    todo.save().then((doc) => {
        res.send({
            status: 'good',
            created : doc
        });
    }, (err) => {
        res.status(400).send({
                status: 'bad',
                result : err 
        });
    }
    );  
});

// delete
app.delete('/api/todo/:id', (req, res) => {
    
    var id = req.params['id'];
    Todo.findByIdAndRemove(id)
        .then((doc) => {
            // returning the removed doc
            res.send(doc);
        }, (err) => {
            res.status(400).send(err);
        });
});

// update
app.patch('/api/todo/:id', (req, res) => {

    var id = req.params['id'];
    var body =  _.pick(req.body, ['completed', 'task']); // Picking out wanted properties
    
    if(!ObjectID.isValid(id)){
        res.status(404).send("Invalid ID");
    }else{
        var id = req.params['id'];
        if(_.isBoolean(body.completed) && body.completed){
            body.completedAt = Date.now();
        }else{
            body.completedAt = null;
            body.completed = false;
        }

        Todo.findByIdAndUpdate(id,{$set: body}, {new: true}).then((doc) => {
            if(!doc){
                res.status(400).send();
            }else{
                res.send(doc);
            }
        }, (err) => {
            res.status(400).send(err);
        });
    }
});


// User
// create
app.post('/api/user', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);

    var user = new User(body);

    user.save().then(() => {
        return user.generateAuthToken();
        //res.send({status: 'good', created : doc });
    }).then((token) => {
        res.header('x-auth', token).send({status: 'good', user : doc, token });
    }).catch((err) => {
        res.status(400).send({ status: 'bad', result : err });
    });
});

app.listen(port, () => {
    console.log('Serving on port: ' + port);
});