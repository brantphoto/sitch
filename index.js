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
        if (!tree.data[tree.main[i]][0]["url"]) {
            console.log('no url');
            break;
        }
        let x = runSteps(tree.data[tree.main[i]]);
        if (!x) break;
    }

}

function runSteps(steps) {
    var result = [];
    for (var i = 0; i < steps.length; i++) {
        if (steps[i].given && steps[i].url) {
            driver.get(steps[i].url);
            console.log(colors.green('given ' + steps[i].given));
        } else if (steps[i].given && steps[i].find) {
            console.log(colors.green('given ' + steps[i].given));
            let findKey = Object.keys(steps[i].find)[0]
            let element = driver.findElement(By[findKey](steps[i].find[findKey]));
            if (steps[i].sendKeys) {
                element.sendKeys(steps[i].sendKeys);
                continue;
            }
        } else if (steps[i].when && steps[i].find) {
            console.log(colors.green('when ' + steps[i].when));
            let findKey = Object.keys(steps[i].find)[0]
            let element = driver.findElement(By[findKey](steps[i].find[findKey]));
            if (steps[i].sendKeys) {
                element.sendKeys(steps[i].sendKeys);
                continue;
            }
            if (steps[i].event) {
                element[steps[i].event]();
            }
        }
        else if (steps[i].then) {
            console.log(colors.green('when ' + steps[i].then));
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
    return result;
}

exports.runExperimental = function createStructuredArray(testArray) {
    var step = 0
    var finalArray = [[],[],[],[]];
    for(var i = 0; i < testArray; i++) {
        switch (step) {
            case 0:
                if (testArray[i].setup) {
                    finalArray[step].push(testArray[i]);
                    continue;
                }
                if (testArray[i].given) {
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
                    step++;
                    continue;
                }
                throw 'need to order better';
            case 2:
                if (testArray[i].when && finalArray[step].length === 0) {
                    finalArray[step].push(testArray[i]);
                    continue;
                }
                if (testArray[i].then) {
                    step++;
                    continue;
                }
                throw 'need to order better';
            case 3:
                if (testArray[i].then && finalArray[step].length === 0) {
                    finalArray[step].push(testArray[i]);
                    continue;
                }
        }
    }
}
