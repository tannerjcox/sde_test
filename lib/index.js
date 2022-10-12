const parser = require('parse-address');
const fs = require('fs');

const openFile = (filePath) => {
    return fs.createReadStream(filePath);
};

const calculateSuitabilityScore = (driver, route) => {
    let suitabilityScore = 1;
    if (!(route.streetNameLength % 2)) {
        suitabilityScore *= driver.vowels * 1.5;
    } else {
        suitabilityScore *= driver.consonants;
    }

    if (checkFactors(route.rowFactors, driver.rowFactors)) {
        suitabilityScore *= 1.5;
    }

    return suitabilityScore;
};

const processDriverFile = async (fileInterface) => {
    let drivers = [];
    const vowels = 'aeiou';
    const consonantRegex = new RegExp(`(?![${vowels}])[a-z]`, 'gi');
    const vowelRegex = new RegExp(`[${vowels}]`, 'gi');

    for await (const driverName of fileInterface) {
        drivers.push({
            name: driverName,
            vowels: driverName.match(vowelRegex)?.length || 0,
            consonants: driverName.match(consonantRegex)?.length || 0,
            rowFactors: buildFactorArray(driverName.length),
        });
    }

    return drivers;
};

const assignDriversToRoutes = async (fileInterface, drivers) => {
    let assignments = [];

    let unassignedDrivers = drivers;
    for await (const address of fileInterface) {
        let addressObject = parser.parseLocation(address);
        let routeObject = {
            address: address,
            parsed: addressObject,
            streetNameLength: addressObject.street.length,
            rowFactors: buildFactorArray(addressObject.street.length),
        };

        let { maxKey, maxScore } = getMaxScoreForRoute(unassignedDrivers, routeObject);

        assignments.push({
            driver: unassignedDrivers[maxKey].name,
            address: address,
            suitabilityScore: maxScore
        });
        unassignedDrivers.splice(maxKey, 1);
    }

    return assignments;
};

const getMaxScoreForRoute = (unassignedDrivers, routeObject) => {

    let maxKey = 0;
    let maxScore = 1;
    let newScore = 1;

    for (let key in unassignedDrivers) {
        newScore = calculateSuitabilityScore(unassignedDrivers[key], routeObject);
        if (newScore > maxScore) {
            maxScore = newScore;
            maxKey = key;
        }
    }

    return { maxKey, maxScore };
};

const buildFactorArray = number => [...Array(number + 1).keys()].filter(i => number % i === 0 && i !== 1);


const checkFactors = (one, two) => {
    return !!one.filter(element => two.includes(element));
};

module.exports = {
    openFile,
    processDriverFile,
    assignDriversToRoutes,
};
