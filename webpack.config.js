const nodeExternals = require('webpack-node-externals');
const path = require('path');
const WebpackNotifierPlugin = require('webpack-notifier');

module.exports = env => {
    const isProduction = (!(env && env.dev));

    const webpackConfig = {
        mode: (isProduction) ? 'production' : 'development',
        entry: {
            'index': './src/index.ts'
        },
        output: {
            filename: '[name].js',
            path: path.resolve(__dirname, 'lib')
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    exclude: '/node_modules/',
                    use: [
                        {
                            loader: 'ts-loader',
                            options: {
                                transpileOnly: (isProduction)
                            }
                        },
                        {
                            loader: 'shebang-loader'
                        },
                        {
                            loader: 'eslint-loader',
                            options: {
                                configFile: path.resolve(__dirname, '.eslintrc.js'),
                                emitWarning: (!isProduction), //Only emit warnings for dev
                                failOnWarning: false,
                                failOnError: isProduction, //Fail production builds with errors
                                fix: true //Always fix
                            }
                        }
                    ]
                }
            ]
        },
        resolve: {
            extensions: [ '.tsx', '.ts', '.js' ],
        },
        devtool: (isProduction) ? false : 'inline-source-map',
        target: 'node',
        node: {
            __dirname: false,
            __filename: false
        },
        externals: [nodeExternals()],
    };

    // Environment specific config options
    if(isProduction){
    }
    else{
        webpackConfig.plugins = [
            new WebpackNotifierPlugin({
                title: 'common-frontend',
                alwaysNotify: false,
                excludeWarnings: false,
                skipFirstNotification: true,
                sound: true
            })
        ];
    }

    return webpackConfig;
};
