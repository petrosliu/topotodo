var topo = function (todoList) {
    if (todoList.length === 0) return todoList;

    var todoMap = {}, prevVertex = {}, nextVertex = {}, priority = {}, urgency = {};
    var heads = [];
    todoList.forEach(function (todo) {
        todoMap[todo.id] = todo;
        prevVertex[todo.id] = todo.prev.length;
        nextVertex[todo.id] = nextVertex[todo.id] || [];
        if (todo.prev.length) {
            todo.prev.forEach(function (prevId) {
                nextVertex[prevId] ? nextVertex[prevId].push(todo.id) : nextVertex[prevId] = [todo.id];
            });
            priority[todo.id] = -1;
        }
        else {
            heads.push(todo.id);
            priority[todo.id] = 1;
        }
    });
    var maxPriority = 1;
    while (heads.length) {
        var curr = heads.pop();
        nextVertex[curr].forEach(function (nextId) {
            prevVertex[nextId]--;
            if (prevVertex[nextId] == 0) heads.unshift(nextId);
            priority[nextId] = Math.max(priority[nextId], priority[curr] + (todoMap[curr].done ? 0 : 1));
            maxPriority = Math.max(maxPriority, priority[nextId]);
        });
    }

    todoList.forEach(function (todo) {
        todo.priority = todo.done ? maxPriority : priority[todo.id];
    });

    todoList.sort(function (l, r) {
        if (l.priority !== r.priority) return l.priority - r.priority;

        if (l.done && r.done) return 0;
        if (l.done) return 1;
        if (r.done) return -1;

        if (l.deadline && r.deadline) return l.deadline - r.deadline;
        if (l.deadline) return -1;
        if (r.deadline) return 1;
        return 0;
    });

    if (todoList[0].deadline) todoList[0].urgency = 1;
    for (var i = 1; i < todoList.length; i++) {
        if (todoList[i].done) todoList[i].urgency = -1;
        else if (todoList[i].deadline) {
            if (todoList[i - 1].priority === todoList[i].priority) {
                todoList[i].urgency = todoList[i - 1].urgency + 1;
            }
            else {
                todoList[i].urgency = 1;
            }
        }
        else {
            todoList[i].urgency = 0;
        }
    }

    return todoList;
}

module.exports = topo;