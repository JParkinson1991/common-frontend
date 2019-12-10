/**
 * @file
 * index.ts
 *
 * @author Josh Parkinson <joshparkinson1991@gmail.com>
 */

import { Command as Commander } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { path as appRoot } from 'app-root-path';
import Application from './console/Application';
import CommandRepository from './console/command/CommandRepository';
import container from './container/container';
import Services from './container/services';

// Determine application version
const applicationVersion = JSON.parse(fs.readFileSync(path.resolve(appRoot, 'package.json')).toString()).version;

// Build the application's command repository
const commandRepository = new CommandRepository()
    .addCommand(container.get(Services.BuildCommand))
    .addCommand(container.get(Services.HelpCommand))
    .addCommand(container.get(Services.InitCommand))
    .addCommand(container.get(Services.ServerCommand))
    .addCommand(container.get(Services.VersionCommand));

// Build and run the application
const commander = new Commander();
const application = new Application(commander, commandRepository);
application.version = applicationVersion;
application.run();
