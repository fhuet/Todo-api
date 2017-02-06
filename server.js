var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');


var app = express();
var PORT = process.env.PORT || 3000;

var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.send('Todo API root');
});

// // GET /todos
app.get('/todos', function (req, res) {
    var query = req.query;
    var where = {};

    if (query.hasOwnProperty('completed') && query.completed === 'true') {
        where.completed = true;
    } else if (query.hasOwnProperty('completed') && query.completed === 'false') {
        where.completed = false;
    }

    if (query.hasOwnProperty('q') && query.q.trim().length > 0) {
        where.description = {
            $like: '%' + query.q.trim() + '%'
        };
        where.description.$like = '%' + query.q.trim() + '%';
    }

    db.todo.findAll({ where: where }).then(function (todos) {
        res.json(todos);
    }, function (e) {
        res.status(500).json(e);
    });
    // var filteredTodos = todos;

    // if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
    //     filteredTodos = _.where(filteredTodos, { completed: true });
    // } else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
    //     filteredTodos = _.where(filteredTodos, { completed: false });
    // }

    // if (queryParams.hasOwnProperty('description') && queryParams.description.trim().length > 0) {
    //     filteredTodos = _.filter(filteredTodos, function (element) {
    //         return element.description.toLowerCase().indexOf(queryParams.description.toLowerCase()) >= 0;
    //     });
    // }

    // res.json(filteredTodos);
    // .then(function () {
    //     // return Todo.findById(1);
    //     return Todo.findAll({
    //         where: {
    //             completed: false
    //         }
    //     });
    // }).then(function (todos) {
    // if (todos) {
    //     todos.forEach(function (todo) {
    //         console.log(todo.toJSON());
    //     });
    // } else {
    //     console.log('No todo found');
    // }
});

// GET /todos/:id
app.get('/todos/:id', function (req, res) {
    var todoId = parseInt(req.params.id, 10);

    db.todo.findById(todoId).then(function (todo) {
        if (todo) {
            res.json(todo);
        } else {
            res.status(404).send();
        }
    }).catch(function (e) {
        res.status(500).send();
    });

});

//POST /todos
app.post('/todos', function (req, res) {
    var body = _.pick(req.body, 'description', 'completed');

    db.todo.create(body).then(function (todo) {
        res.json(todo);
    }).catch(function (e) {
        res.status(400).json(e);
    });

});

//DELETE /todos/:id
app.delete('/todos/:id', function (req, res) {
    var todoId = parseInt(req.params.id, 10),
        matchedTodo = _.findWhere(todos, { id: todoId });

    if (matchedTodo) {
        todos = _.without(todos, matchedTodo);
        res.json(matchedTodo);
    } else {
        res.status(404).send();
    }
});

//PUT /todos/:id
app.put('/todos/:id', function (req, res) {
    var body = _.pick(req.body, 'description', 'completed');
    var todoId = parseInt(req.params.id, 10),
        matchedTodo = _.findWhere(todos, { id: todoId });
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

db.sequelize.sync().then(function () {
    app.listen(PORT, function () {
        console.log('Express listening on port: ' + PORT);
    });
});

