// @flow
'use strict'
require('dotenv').config();
const sitch = require('./index');
const MongoClient = require('mongodb').MongoClient;
const Server = require('mongodb').Server;
let host = '';
if (typeof process.env.HOST == 'string') {
    host = host + process.env.HOST;
};
const tree = require('./test1');

sitch(tree, {
    host: host,
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
    cb();
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
