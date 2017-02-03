var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');

var app = express();
var PORT = process.env.PORT || 3000;

var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function(req, res) {
    res.send('Todo API root');
});

// // GET /todos
// app.get('/todos', function(req, res){
//     var queryParams = req.query;
//     var filteredTodos = todos;

//     // if has property && completed === 'true'
//     //  filteredTodos = _.where(filteredTodos, ?)
//     // else if 
//     if (!_.isEmpty(queryParams) && queryParams.completed === 'true')
//     {
//         queryParams.completed = true;
//         filteredTodos = _.where(todos,queryParams);
//     } 
//     else if (!_.isEmpty(queryParams) && queryParams.completed === 'false') 
//     {
//         queryParams.completed = false;
//         filteredTodos = _.where(todos,queryParams);
//     } 
//     res.json(filteredTodos);
// });

// GET /todos?completed=true
app.get('/todos', function (req, res) {
    var queryParams = req.query;
    var filteredTodos = todos;

    if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
        filteredTodos = _.where(filteredTodos, {completed: true});
    } else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
        filteredTodos = _.where(filteredTodos, {completed: false});
    }

    if (queryParams.hasOwnProperty('description') && queryParams.description.trim().length > 0) {
        filteredTodos = _.filter(filteredTodos, function(element){
            return element.description.toLowerCase().indexOf(queryParams.description.toLowerCase()) >= 0;
        });
    }

    res.json(filteredTodos);
});

// GET /todos/:id
app.get('/todos/:id', function(req, res) {
    var todoId = parseInt(req.params.id, 10),
        matchedTodo = _.findWhere(todos, {id: todoId});
    
    if (matchedTodo) {
        res.json(matchedTodo);
    } else {
        res.status(404).send();
    }
});

//POST /todos
app.post('/todos', function(req, res){
    var body = _.pick(req.body, 'description', 'completed');

    if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
        return res.status(400).send();
    }

    body.id = todoNextId++;
    body.description = body.description.trim();
    todos.push(body);
    res.json(body);
});

//DELETE /todos/:id
app.delete('/todos/:id', function(req, res) {
    var todoId = parseInt(req.params.id, 10),
        matchedTodo = _.findWhere(todos, {id: todoId});
    
    if (matchedTodo) {
        todos = _.without(todos,matchedTodo);
        res.json(matchedTodo);
    } else {
        res.status(404).send();
    }
});

//PUT /todos/:id
app.put('/todos/:id', function(req, res){
    var body = _.pick(req.body, 'description', 'completed');
    var todoId = parseInt(req.params.id, 10),
        matchedTodo = _.findWhere(todos, {id: todoId});
    var validAttributes = {};

    if (!matchedTodo) {
        res.status(404).send();
    }

    if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
        validAttributes.completed = body.completed;
    } else if (body.hasOwnProperty('completed')) {
        return res.status(400).send();
    }

    if (body.hasOwnProperty('descrition') && _.isString(body.description) && body.description.trim().length > 0) {
        validAttributes.description = body.description.trim();
    } else if (body.hasOwnProperty('description')) {
        return res.status(400).send();
    }

    _.extend(matchedTodo, validAttributes);
});


app.listen(PORT, function() {
    console.log('Express listening on port: ' + PORT);
});