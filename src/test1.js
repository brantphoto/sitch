//
'use strict';

module.exports = [
    {
        setup: [
            {
                type: 'ADD_USER',
                data: {
                    firstname: 'brant',
                    lastename: 'barger',
                }
            },
            '/login'
        ],
        given: [
            {
                given: "Username is filled in with valid username",
                find: {
                    name: "username"
                },
                event: "sendKeys",
                value: ''
            },
            {
                given: "the password is filled in",
                find: {
                    name: "password"
                },
                event: "sendKeys",
                value: ''
            }
        ],
        when: {
            when: "submit button is clicked",
            find: {
                id: "aa-auth-login-btn"
            },
            event: "click"
        },
        then: {
            then: "you should be taken to the dashboard",
            urlIs: "/dashboard"
        }
    }
];
