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

function sitch(path, databaseConfig) {
    var tree;
    var results;
    HOST_GLOBAL = databaseConfig.host;

    try {
        tree = JSON.parse(fs.readFileSync(path))
    }
    catch(err) {
        console.error(err);
    }

    setupDatabase(databaseConfig, function(dbClient, cleanDatabaseMethod) {
        let db = dbClient;
        cleanDatabaseMethod(db, () => {
            for (let i = 0; i < tree.main.length; i++) {
                let formattedTests = formatTests(tree.data[tree.main[i]]);
                setupTest(formattedTests, databaseConfig.actions, dbClient)
                    .then(performGiven)
                    .then(performWhen)
                    .then(performThen)
                    .then(() => cleanDatabaseMethod(db));
            }
        });
    });
};

function setupDatabase(databaseConfig, cb) {
    databaseConfig.start(function(databaseClient) {
        cb(databaseClient, databaseConfig.clean)
    });
}

function setupTest(testMasterArray, actionsMethod, dbClient) {

    const array = testMasterArray[0];
    return new Promise((resolve, reject) => {
        try {
            for (let i = 0; i < array.length; i++) {
                if (typeof array[i].setup == 'string') {
                    driver.get(HOST_GLOBAL + array[i].setup);
                    continue;
                }
                else if (array[i].setup.type) {
                    actionsMethod(array[i].setup, dbClient, function() {
                        console.log('ok!');
                    });
                    continue;
                }
                throw 'no url to go to';
            }
            resolve(testMasterArray)
        }
        catch (err) {
            reject(err)
        }
    });
}

function performGiven(array) {
    const givenArray = array[1];
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
                        if (givenArray[index].sendKeys) {
                            element.sendKeys(givenArray[index].sendKeys)
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
                    .then(() => mainResolve(array))
                    .catch((err) => mainResolve(err))
            })
            .catch(err => mainReject(err))
    });
}

function performWhen(testMasterArray) {
    return new Promise((resolve, reject) => {
        const whenArray = testMasterArray[2]
        if (whenArray[0].find) {
            let findKey = Object.keys(whenArray[0].find)[0]
            let element = driver.findElement(By[findKey](whenArray[0].find[findKey]));
            if (whenArray[0].sendKeys) {
                element.sendKeys(whenArray[0].sendKeys)
                    .then(() => {
                        console.log(colors.green('when ' + whenArray[0].when));
                        resolve(testMasterArray)
                    });
                return;
            }
            if (whenArray[0].event) {
                element[whenArray[0].event]()
                    .then(() => {
                        console.log(colors.green('when ' + whenArray[0].when));
                        resolve(testMasterArray)
                    });
                return;
            }
            reject('need to make sure all when objects have a find method');
        }
        reject();


    });
}

function performThen(testMasterArray) {
    const thenArray = testMasterArray[3];
    for (let i = 0; i < thenArray.length; i++) {
        console.log(colors.green('then ' + thenArray[i].then));
        if (thenArray[i].urlIs) {
            let url = HOST_GLOBAL + thenArray[i].urlIs;
            driver.wait(until.urlIs(url), 10000);
            driver.getCurrentUrl()
                .then(currentUrl => {
                    console.log(currentUrl);
                    console.log(url);
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