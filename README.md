
# Common: Frontend

Provides an opinionated abstraction to webpack module build/compilation.

The primary function of this package it to provide an easy to use
stylesheet/theme compiler for websites as well as reusable scss scaffolding
files.

## Getting Started

`npm install common-frontend`

*There is no need to install webpack or webpack-cli to compile modules with this
package.*

## Command Line Usage

This package provides a single command line entry point at `common-frontend`

Commands can be run via `package.json` scripts or  using `npx`.

All examples below use `npx` for simplicity.

#### Documentation/Help

View the commands help output for a list of available commands and how to use
them.

```
npx common-frontend help
npx common-frontend [command] -h
```

#### Project Initialisation

To initialise a project for use with this command run the following.

```
npx common-frontend init
```

This will generate the configuration file to use in builds/development server
runs.

#### Building

Builds a project using the [configuration](#configuration)

```
npx common-frontend build

# Dev mode
npx common-frontend build -d

# Watch mode
npx common-frontend build -w
```

#### Development Server

Runs a development server using the [configuration](#configuration)

```
npx common-frontend server

# Dev mode
npx common-frontend server -d
```

## Configuration

Configuration is handled using a standard javascript file.

This file is capable of requiring other modules thus extending the functionality
of this package.

The default [configuration file `.cf.config.js`](assets/config/default.cf.config.js)
will be searched for in the current working directory and child directories
when `build` or `server` commands are executed, if, no config file option is
provided to the command.

Rather than documenting all configuration options here they are detailed in
the [configuration file](assets/config/default.cf.config.js) itself. This file
can be generated in the current working directory by running the
[package init command](#project-initialisation).

## SCSS Framework

This package adds scss scaffolding files as well integration with following
third party packages :
- [bootstrap-sass](https://www.npmjs.com/package/bootstrap-sass)
- [@fortawesome/fontawesome-free](https://www.npmjs.com/package/@fortawesome/fontawesome-free)

### Documentation

The SCSS framework is self documenting.

#### Requirements

Documentation is built using `sassdoc` and this needs to be installed manually.

Install the [sassdoc](http://sassdoc.com/) peerdependency.

`npm install sassdoc`

#### Generating the documentation

```
npm explore @jparkinson1991/common-frontend -- npm run document
```

This will create a `documentation/index.html` file inside this packages
directory, which can be opened in any browser.

To generate and automatically open the documentation page run the following.

```
npm explore @jparkinson1991/common-frontend -- npm run document:open
```

#### Working with the framework

##### Import Aliases

The following import aliases are provided for use
- `_` The path of the configuration file used in builds.
- `__src` The path to the source root defined in configuration.

##### Import Globbing

Globbed imports are available for use on realtive or absolute paths.

Globbed imports **do not** work with aliased or tilde imports.

```
# Good
@import 'partial/*.scss';
@import '/absolute/import/**/*.scss';

# Bad
@import '_/partal/*.scss'
@import ~bootstrap-sass/**/*.scss'
```


## Versioning

[SemVer](http://semver.org/) for versioning. For the versions available,
see the [tags on this repository](https://github.com/JParkinson1991/common-frontend/tags).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE)
file for details
