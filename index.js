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
        const srcPath = path.join(process.cwd(), 'files');

        let driverFilePath = await (async () => {
            let defaultPath = path.join(srcPath, 'drivers.txt');
            return await promptly.prompt(
                `Driver File? [${ defaultPath }]`,
                { default: defaultPath });
        })();


        const driverFileInterface = readline.createInterface({
            input: openFile(driverFilePath),
            crlfDelay: Infinity
        });

        let drivers = await processDriverFile(driverFileInterface);

        let routesFilePath = await (async () => {
            let defaultPath = path.join(srcPath, 'routes.txt');
            return await promptly.prompt(
                `Routes File? [${ defaultPath }]`,
                { default: defaultPath }
            );
        })();

        const routeFileInterface = readline.createInterface({
            input: openFile(routesFilePath),
            crlfDelay: Infinity
        });

        let assignments = await assignDriversToRoutes(routeFileInterface, drivers);

        console.log('Routes assigned successfully!', assignments);
        const sum = assignments.reduce((accumulator, assignment) => {
            return accumulator + assignment.suitabilityScore;
        }, 0);
        console.log('Total Suitability Score', sum);
        console.log('Average Suitability Score', sum / assignments.length);
        console.log('Total Routes assigned', assignments.length);
    } catch (error) {
        console.log('Error assigning routes.', error);
    }
};

main();

