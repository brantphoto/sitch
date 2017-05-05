var sitch = require('./index');
var MongoClient = require('mongodb').MongoClient;
var Server = require('mongodb').Server;


sitch.run('./test.json', {
    actions: actions,
    start: start,
    clean: clean,
});

function actions(action, dbClient, cb) {
    switch (action.type) {
        case 'ADD_USER':
            return dbClient.collection('users').insertOne(action.data, {w: 1}, function() {
                cb();
            });
    }
    return null;
}

function start(cb) {
    var url = 'mongodb://localhost:27017/sitch';

    MongoClient.connect(url, function (err, db) {
        cb(db);
    });
};

function clean(dbClient, cb) {
    console.log('YYYYYYYY', dbClient)
    dbClient.dropDatabase(function() {
        cb();
    });
}