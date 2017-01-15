var alias = function(id){
    return id?id.substring(id.length - 6):null;
}

var checkVertex = function (prev, buffer, id) {
    var newPrev = [];
    for (var i = 0; i < prev.length; i++) {
        var repeated = false;
        for (var j = 0; j < newPrev.length; j++) {
            if (alias(newPrev[j]) == alias(prev[i])) {
                repeated = true;
                break;
            }
        }
        if (repeated) continue;
        for (var j = 0; j < buffer.length; j++) {
            if (buffer[j].alias == alias(prev[i])) {
                if(alias(id) !== alias(prev[i])){
                    newPrev.push(buffer[j].id);
                }
                break;
            }
        }
    }
    return newPrev;
}

var callback = function (res) {
    if(res) return function (err, ret) {
        if (err) res.send(err);
        else res.json(ret);
    }
    return function(){};
}

module.exports.alias = alias;
module.exports.checkVertex = checkVertex;
module.exports.callback = callback;
module.exports.noCallback = callback();