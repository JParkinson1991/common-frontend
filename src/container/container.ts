/**
 * @file
 * container.ts
 *
 * @author Josh Parkinson <joshparkinson1991@gmail.com>
 */

import { Container } from 'inversify';
import 'reflect-metadata';
import * as inquirer from 'inquirer';
import HelpCommand from '../console/command/commands/HelpCommand';
import InitCommand from '../console/command/commands/InitCommand';
import VersionCommand from '../console/command/commands/VersionCommand';
import ConsoleOutput from '../console/io/ConsoleOutput';
import ConsoleOutputInterface from '../console/io/ConsoleOutputInterface';
import Services from './services';
import Path from '../utility/Path';
import ConfigLoader from '../config/ConfigLoader';
import String from '../utility/String';
import WebpackRunner from '../webpack/WebpackRunner';
import BuildCommand from '../console/command/commands/BuildCommand';
import ServerCommand from '../console/command/commands/ServerCommand';

const container = new Container();

// Internal Classes
container.bind<ConsoleOutputInterface>(Services.ConsoleOutput).to(ConsoleOutput);
container.bind<ConfigLoader>(Services.ConfigLoader).to(ConfigLoader);
container.bind<Path>(Services.Path).to(Path);
container.bind<String>(Services.String).to(String); // eslint-disable-line @typescript-eslint/ban-types
container.bind<WebpackRunner>(Services.WebpackRunner).to(WebpackRunner);

// Application Commands
container.bind<BuildCommand>(Services.BuildCommand).to(BuildCommand);
container.bind<HelpCommand>(Services.HelpCommand).to(HelpCommand);
container.bind<InitCommand>(Services.InitCommand).to(InitCommand);
container.bind<ServerCommand>(Services.ServerCommand).to(ServerCommand);
container.bind<VersionCommand>(Services.VersionCommand).to(VersionCommand);

// Third Party
container.bind<inquirer.Inquirer>(Services.Inquirer).toConstantValue(inquirer);

export default container;
