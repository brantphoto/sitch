### Sitch - End To End Testing Framework

## Introduction

## why use

## JSON format of a test

## Installation

Using npm install with the following terminal command:

`npm install --save-dev sitch`

Next you'll need to make sure Chromedriver is installed. If using homebrew it's as easy as typing in the following terminal command:

`brew update`

`brew install chromedriver`

## Running Tests

Let's say you have your json file. Here's what running you test might look like:

```
// index.js

var sitch = require('sitch');

sitch.run('./test.json');
```

In the command line:

`node index`

## compiling at test

Writing tests can be easy and done in your favorite language. Initially, we are writing test builder in javascript but eventually Java and Python will also be ready.

```
import {url, findByName, findById, actions}

const test1 = [
    {
        setup: addUser({username:'sarah',password: 'password'});
    },
    {
        setup: url('www.google.com')
    },
    {
        given: 'username is filled in',
        find: findByName('username'),
        sendKeys: 'sarah'
    },
    {
        given: 'password is filled in',
        find: findByName('password'),
        sendKeys: 'badpassword',
    },
    {
        when: '',
        find: findById('button-id'),
        action: actions.click
    {
        then: 'you should be on the user password',
        urlIs: url('')

];

const test2 = [
    {
        setup: test1
    },
    {
        when: '',

    },
    {
        then: '',
    }

]
```
