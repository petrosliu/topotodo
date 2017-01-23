var Todo = require('./models/todo');
var Util = require('./common/util');

var routes = function (app) {
    app.get('/api/todos', function (req, res) {
        Todo.get(Util.callback(res));
    });

    app.post('/api/todos', function (req, res) {
        Todo.create({
            text: req.body.text,
            prev: (req.body.prev ? req.body.prev.split(/[^0-9a-z]+/) : []),
            deadline: req.body.deadline
        }, Util.callback(res));
    });

    app.delete('/api/todos/:id', function (req, res) {
        Todo.delete(req.params.id, Util.callback(res));
    });

    app.post('/api/todos/:id', function (req, res) {
        if (!req.body.prev || req.body.prev.constructor !== Array) {
            req.body.prev = req.body.prev ? req.body.prev.split(/[^0-9a-z]+/) : [];
        }
        Todo.update(req.params.id, req.body, Util.callback(res));
    });

    app.get('*', function (req, res) {
        res.sendFile(path.join(__dirname, './build', 'index.html'));
    });
};

module.exports = routes;
