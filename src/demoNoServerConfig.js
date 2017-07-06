// @flow
'use strict'
require('dotenv').config();
const sitch = require('./index');
let host = '';
if (typeof process.env.HOST == 'string') {
    host = host + process.env.HOST;
};
const tree = require('./test1');

sitch(tree, host);