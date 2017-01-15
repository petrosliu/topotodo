var Mongoose = require('mongoose');
var Topo = require('../common/topo');
var Util = require('../common/util');

var todoSchema = new Mongoose.Schema({
    text: { type: String, default: '' },
    done: { type: Boolean, default: false },
    prev: { type: [String], default: [] },
    deadline: { type: Date },
    created_at: { type: Date, required: true },
    updated_at: { type: Date, required: true },
    priority: { type: Number, default: 0 },
    urgency: { type: Number, default: 0 }
});

todoSchema.virtual('alias').get(function () {
    return Util.alias(this.id);
});

todoSchema.set('toObject', {
    virtuals: true
});

todoSchema.set('toJSON', {
    virtuals: true
});

var todoModel = Mongoose.model('Todo', todoSchema);

var Todo = {
    hasUpdated: false,
    model: todoModel,
    buffer: []
}

var getTodos = function (callback) {
    if (Todo.hasUpdated) {
        callback(null, Todo.buffer);
    }
    else {
        Todo.model.find(function (err, todos) {
            if (err) callback(err);
            Todo.buffer = Topo(todos);
            Todo.hasUpdated = true;
            console.log("DB: Load " + todos.length + " todos.");
            callback(err, Todo.buffer);
        });
    }
};

var createTodo = function (newTodo, callback) {
    newTodo.prev = Util.checkVertex(newTodo.prev, Todo.buffer);
    newTodo.created_at = newTodo.updated_at = new Date();
    Todo.model.create(newTodo, function (err, todo) {
        if (err) callback(err);
        console.log("DB: Create todo: " + todo.id);
        Todo.hasUpdated = false;
        getTodos(callback);
    });
}

var updateTodo = function (id, newTodo, callback) {
    newTodo.prev = Util.checkVertex((newTodo.prev || []), Todo.buffer, newTodo.id);
    newTodo.updated_at = new Date();
    Todo.model.update({ _id: id },
        newTodo, function (err, todo) {
            if (err) callback(err);
            console.log("DB: Update todo: " + id);
            Todo.hasUpdated = false;
            getTodos(callback);
        });
}

var deleteTodo = function (id, callback) {
    for (var i = 0; i < Todo.buffer.length; i++) {
        if (Todo.buffer[i].id == id) {
            if (Todo.buffer[i].done) {
                Todo.model.remove({ _id: id },
                    function (err, ret) {
                        if (err) callback(err);
                        console.log("DB: Delete todo: " + id);
                        Todo.hasUpdated = false;
                        getTodos(callback);
                    });
            }
            else {
                var newTodo = Todo.buffer[i];
                newTodo.done = true;
                updateTodo(id, newTodo, callback);
            }
            break;
        }
    }
}

getTodos(Util.noCallback);

module.exports.get = getTodos;
module.exports.create = createTodo;
module.exports.delete = deleteTodo;
module.exports.update = updateTodo;