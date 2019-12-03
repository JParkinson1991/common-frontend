/**
 * @file
 * ConfigDataInterface.ts
 *
 * @author Josh Parkinson <joshparkinson1991@gmail.com>
 */

import * as webpack from 'webpack';
import * as WebpackDevServer from 'webpack-dev-server';

/**
 * Interface ConfigData Interface
 *
 * Defines the structure of the configuration data file.
 */
export default interface ConfigDataInterface {
    structure: {
        source_root: string;
        output_root: string;
        font_dir: string;
        font_mappings: {
            [key: string]: string;
        };
        image_dir: string;
        image_mappings: {
            [key: string]: string;
        };
    };

    build: {
        clean: boolean;
        entry: {
            [key: string]: string;
        };
        publicPath: string;
    };

    develop: {
        clean: boolean;
        devtool: string;
        entry: {
            [key: string]: string;
        };
        publicPath: string;
    };

    options: {
        server: WebpackDevServer.Configuration;
        watch: webpack.Options.WatchOptions;
        webpack_notifier: {};
    };
}
