#!/usr/bin/env node

const program = require('commander');
const path = require('path');
const readline = require('readline');
const promptly = require('promptly');

const {
    openFile,
    processDriverFile,
    assignDriversToRoutes,
} = require('./lib');

program
    .version('1.0.0')
    .name('driver-routes')
    .description('Tool to assign drivers to routes')
    .parse(process.argv);

const main = async () => {
    try {
        let driverFilePath = await (async () => {
            return await promptly.prompt('Driver File? [./files/drivers.txt]', { default: '' });
        })();

        const srcPath = path.join(process.cwd(), 'files');

        const driverFileInterface = readline.createInterface({
            input: openFile(driverFilePath ? driverFilePath : path.join(srcPath, 'drivers.txt')),
            crlfDelay: Infinity
        });

        let drivers = await processDriverFile(driverFileInterface);

        let routesFilePath = await (async () => {
            return await promptly.prompt('Routes File? [./files/routes.txt] ', { default: '' });
        })();

        const routeFileInterface = readline.createInterface({
            input: openFile(routesFilePath ? routesFilePath : path.join(srcPath, 'routes.txt')),
            crlfDelay: Infinity
        });

        let assignments = await assignDriversToRoutes(routeFileInterface, drivers);

        console.log('Routes assigned successfully!', assignments);
        const sum = assignments.reduce((accumulator, assignment) => {
            return accumulator + assignment.suitabilityScore;
        }, 0);
        console.log('Total Suitability Score', sum);
        console.log('Total Routes assigned', assignments.length);
    } catch (error) {
        console.log('Error assigning routes.', error);
    }
};

main();

