var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;

var todos = [{
    id: 1,
    description: "Phone Lobstie",
    completed: false
},
{
    id: 2,
    description: "Pay rent",
    completed: false
},
{
    id: 3,
    description: "Update Heroku",
    completed: true
}];

app.get('/', function(req, res) {
    res.send('Todo API root');
});

// GET /todos
app.get('/todos', function(req, res){
    res.json(todos);
});

// GET /todos/:id
app.get('/todos/:id', function(req, res) {
    var todoId = req.params.id,
        matchedTodo;
    todos.forEach(function(element){
        if (todoId === element.id.toString()) {
            matchedTodo = element;
        }
    });
    
    if (matchedTodo) {
        res.json(matchedTodo);
    } else {
        res.status(404).send();
    }
});

app.listen(PORT, function() {
    console.log('Express listening on port: ' + PORT);
});