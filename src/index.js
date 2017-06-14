// @flow
'use strict';

var webdriver = require('selenium-webdriver');
var By = webdriver.By;
var until = webdriver.until;
var colors = require('colors');
var fs = require('fs');
var driver = new webdriver.Builder()
    .forBrowser('chrome')
    .build();

var HOST_GLOBAL = '';

function sitch(tree: Tree, databaseConfig: DatabaseConfig) {
    HOST_GLOBAL = databaseConfig.host;
    setupDatabase(tree, databaseConfig, setupDBCallback)

    function setupDBCallback(tree, dbClient, cleanDatabaseMethod) {
        if (dbClient && cleanDatabaseMethod) {
            cleanDatabaseMethod(dbClient, () => {
                runTests(tree, databaseConfig, dbClient);
            });
            return;
        }
        else {
            runTests(tree, databaseConfig, dbClient);
        }
    }
};

function setupDatabase(tree, databaseConfig, cb) {
    if (databaseConfig.start) {
        databaseConfig.start(databaseClient => {
            cb(tree, databaseClient, databaseConfig.clean)
        });
        return;
    }
    cb(tree, null, null);
}

function runTests(tree, databaseConfig, dbClient) {
    for (let i = 0; i < tree.length; i++) {
        setupTest(tree[i], databaseConfig.actions, dbClient)
            .then(performGiven)
            .then(performWhen)
            .then(performThen)
            .then(() => {
                if (databaseConfig.clean && dbClient) {
                    finalClean(databaseConfig, dbClient)
                }
            });
    }
}

function finalClean(databaseConfig, dbClient) {
    if (databaseConfig != null && databaseConfig.clean != null) {
        databaseConfig.clean(dbClient, () => {
        });
    }
}

function setupTest(testObject: Test, actionsMethod, dbClient): Promise<any> {
    const array = Array.isArray(testObject.setup) ? testObject.setup : [];
    return new Promise((resolve, reject) => {
        try {
            for (let i = 0; i < array.length; i++) {
                if (typeof array[i] == 'string') {
                    driver.get(HOST_GLOBAL + array[i]);
                    continue;
                }
                else if (array[i] && array[i].type && array[i].data) {
                    if (!actionsMethod) throw 'No action handler defined';
                    actionsMethod(array[i], dbClient, function() {
                        console.log('ok!');
                    });
                    continue;
                }
            }
            resolve(testObject)
        }
        catch (err) {
            reject(err)
        }
    });
}

function performGiven(testObject) : Promise<any> {
    let givenArray = Array.isArray(testObject.given) ? testObject.given : [];
    return new Promise((mainResolve, mainReject) => {
        const domElements = Promise.all(givenArray.map((given) => {
            return new Promise((resolve, reject) => {
                let findKey = Object.keys(given.find)[0];
                driver.findElement(By[findKey](given.find[findKey]))
                    .then(element => resolve(element))
                    .catch(err => reject(err));
            });
        }));

        domElements
            .then(elementsArray => {
                const actionsSuccessful = Promise.all(elementsArray.map((element, index) => {
                    return new Promise((resolve, reject) => {
                        if (givenArray[index].event === 'sendKeys') {
                            element.sendKeys(givenArray[index].value)
                                .then(() =>  {
                                    console.log(colors.green('given ' + givenArray[index].given));
                                    resolve()
                                })
                                .catch(() => reject())
                            return;
                        }
                        reject();
                    });

                }));

                actionsSuccessful
                    .then(() => mainResolve(testObject))
                    .catch((err) => mainResolve(err))
            })
            .catch(err => mainReject(err))
    });
}

function performWhen(testObject: Test) : Promise<any> {
    return new Promise((resolve, reject) => {
        if (testObject.when.find) {
            let element;
            if (typeof testObject.when.find.id === 'string') {
                element = driver.findElement(By.id(testObject.when.find.id))
            }
            else if (typeof testObject.when.find.name === 'string') {
                element = driver.findElement(By.name(testObject.when.find.name));
            }
            if (!element) return reject();

            if (testObject.when.event === 'sendKeys') {
                element.sendKeys(testObject.when.value)
                    .then(() => {
                        console.log(colors.green('when ' + testObject.when.when));
                        resolve(testObject)
                    });
                return;
            }
            if (testObject.when.event === 'click') {
                element.click()
                    .then(() => {
                        console.log(colors.green('when ' + testObject.when.when));
                        resolve(testObject)
                    });
                return;
            }
            reject('need to make sure all when objects have a find method');
        }
        reject();


    });
}

function performThen(testObject) {
    const thenArray = Array.isArray(testObject.then) ? testObject.then : [testObject.then];
    for (let i = 0; i < thenArray.length; i++) {
        console.log(colors.green('then ' + thenArray[i].then));
        if (thenArray[i].urlIs) {
            let url = HOST_GLOBAL + thenArray[i].urlIs;
            driver.wait(until.urlIs(url), 10000);
            driver.getCurrentUrl()
                .then(currentUrl => {
                    if (currentUrl === url) {
                        console.log(colors.green('PASS'));
                    }
                })
                .catch(() => {
                    colors.red('then ' + thenArray[i].then)
                });
        }
    }
}

function formatTests(testArray) {
    var step = 0
    var finalArray = [[],[],[],[]];
    for(let i = 0; i < testArray.length; i++) {
        switch (step) {
            case 0:
                if (testArray[i].setup) {
                    finalArray[step].push(testArray[i]);
                    continue;
                }
                if (testArray[i].given) {
                    finalArray[step + 1].push(testArray[i]);
                    step++;
                    continue;
                }
                throw 'need to order better';
            case 1:
                if (testArray[i].given) {
                    finalArray[step].push(testArray[i]);
                    continue;
                }
                if (testArray[i].when) {
                    finalArray[step + 1].push(testArray[i]);
                    step++;
                    continue;
                }
                throw 'need to order better';
            case 2:
                if (testArray[i].when) {
                    throw 'cant have two whens in the same test';
                }
                if (testArray[i].then) {
                    finalArray[step + 1].push(testArray[i]);
                    step++;
                    continue;
                }
                throw 'needs to be a when or then next'
            case 3:
                if (testArray[i].then) {
                    throw 'cant have multiple thens'
                }
                continue;
        }
    }
    return finalArray;
}

module.exports = sitch;
