require('dotenv').config();
var sitch = require('./lib/index');
var MongoClient = require('mongodb').MongoClient;
var Server = require('mongodb').Server;


sitch('./test.json', {
    host: process.env.HOST,
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
        if (err) throw err;
        cb(db);
        db.close();
    });
};

function clean(dbClient, cb) {
    dbClient.dropDatabase(function() {
        cb();
    });
}
