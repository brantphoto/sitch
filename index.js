var webdriver = require('selenium-webdriver');
var By = webdriver.By;
var until = webdriver.until;
var colors = require('colors');
var fs = require('fs');
var driver = new webdriver.Builder()
    .forBrowser('chrome')
    .build();

exports.run = function(path) {
    var tree;
    var results;
    try {
        tree = JSON.parse(fs.readFileSync(path))
        console.log(tree);
    }
    catch(err) {
        console.error(err);
    }

    for (var i = 0; i < tree.main.length; i++) {
        let formattedTests = formatTests(tree.data[tree.main[i]]);
        setupTest(formattedTests[0])
        performGiven(formattedTests[1])
        performWhen(formattedTests[2])
        performThen(formattedTests[3])
    }
}

function setupTest(array) {
    for (var i = 0; i < array.length; i++) {
        if (typeof array[i].setup == 'string') {
            driver.get(array[i].setup);
            continue;
        }
        throw 'no url to go to';
    }
}

function performGiven(array) {
    for (var i = 0; i < array.length; i++) {
        if (array[i].find) {
            console.log(colors.green('given ' + array[i].given));
            let findKey = Object.keys(array[i].find)[0]
            let element = driver.findElement(By[findKey](array[i].find[findKey]));
            if (array[i].sendKeys) {
                element.sendKeys(array[i].sendKeys);
                continue;
            }
        }
    }
}

function performWhen(steps) {
    for (var i = 0; i < steps.length; i++) {
        if (steps[i].find) {
            console.log(colors.green('when ' + steps[i].when));
            let findKey = Object.keys(steps[i].find)[0]
            let element = driver.findElement(By[findKey](steps[i].find[findKey]));
            if (steps[i].sendKeys) {
                element.sendKeys(steps[i].sendKeys);
                continue;
            }
            if (steps[i].event) {
                element[steps[i].event]();
                continue;
            }
            throw 'need to make sure all when objects have a find method'
        }
    }
}

function performThen(steps) {
    for (let i = 0; i < steps.length; i++) {
        console.log(colors.green('then ' + steps[i].then));
        if (steps[i].urlIs) {
            let url = steps[i].urlIs;
            driver.wait(until.urlIs(steps[i].urlIs, 10000))
            driver.getCurrentUrl()
            .then(currentUrl => {
                if (currentUrl === url) {
                    console.log(colors.green('PASS'));
                }
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
                console.log('step 1', testArray[i]);
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
                    throw 'cant have multile thens'
                }
                continue;
        }
    }
    return finalArray;
}
