module.exports = {

    /**
     * Project structure configuration
     *
     * The following configuration is used to define and provide context of the
     * structure of both the project's source files and output build files.
     *
     * @property {string} source_root
     *     The path to the sources file directory.
     *     Path can be absolute or relative to the location of this file
     * @property {string} output_root
     *     The path to the wanted output directory.
     *     Compiled assets will exist under this directory
     *     Path can be absolute or relative to the location of this file
     * @property {string} font_dir
     *     The name of the fonts directory used in this project.
     *     Source/compile context:
     *         Files found under directories/subdirectories with this name will
     *         be treat and processed as a font.
     *     Output context:
     *         Output files will be placed in a parent directory with a name
     *         matching this value. Original source directory structure will be
     *         preserved but path will be prefixed if required.
     *         Example:
     *             Source: ./src/module/assets/webfonts/fontfile.rtf
     *             Output: ./dist/fonts/module/assets/webfonts/fontfile.rtf
     *         Source directory structure can be altered via font_mappings.
     * @property {Object.<string,string>} font_mappings
     *     Used to alter the paths of the output font files.
     *     During build output directory structure of fonts is preserved, the
     *     path to the source fill be replicated in the output folder, a mapping
     *     can be used to alter the path used when the font file is output.
     *     Key:
     *         The pattern/substring of the font to match
     *     Value:
     *         The new directory name/slug/path to set against the matched file.
     *         This value will be prefixed with font_dir value as required.
     *     Example:
     *         font_mapping: {
     *             'somepackage/assets/webfonts': 'somepackage'
     *         }
     *         Source file: /node_modules/somepackage/assets/webfonts/font.rtf
     *         Output file: /fonts/somepackage/font.rtf
     * @property {string} image_dir
     *     Functions in the exact same way as the font_dir config option but
     *     for images.
     * @property {Object.<string,string>} image_mappings
     *     Functions in the exact same way as the font_mappings config option
     *     but images.
     */
    structure: {
        source_root: './src',
        output_root: './dist',
        font_dir: 'fonts',
        font_mappings: {},
        image_dir: 'images',
        image_mappings: {}
    },

    /**
     * Project build configuration.
     *
     * The following configuration dictates what is being built.
     *
     * @property {boolean} clean
     *     Should the contents of the output directory be deleted prior to
     *     build. This option can be used to ensure orphans are removed from
     *     previous build and it is recommended to have this option enabled
     *     well building for production.
     * @property {Object.<string,string>} entry
     *     The build entry files.
     *     Key:
     *         The name of the output bundle.
     *         Relative to structure.output_root
     *         Can be provided as a path to nest output.
     *     Value:
     *         The entry file.
     *         Relative to structure.source_root
     *     See: https://webpack.js.org/configuration/entry-context/#entry
     * @property {string} publicPath
     *     The accessible path to the structure.output_root.
     *     This value is used to rewrite assets url's etc during build.
     *     In the context of web servers/websites it is where the
     *     structure.output_root is relative to the web root.
     *     Path can be either absolute or relative to this file.
     *     See: https://webpack.js.org/configuration/output/#outputpublicpath
     */
    build: {
        clean: true,
        entry: {},
        publicPath: '/path/to/output_root/from/access/root'
    },

    /**
     * Development configuration.
     *
     * The following configuration dictates how the project should be built
     * in a development context. These configuration options will come into
     * play when development mode is enabled during builds/watch/server etc.
     *
     * @property {string} devtool
     *     The webpack development tool to use during development builds.
     *     See: https://webpack.js.org/configuration/devtool/
     *
     * NOTE:
     * All properties in the build configuration object can be overridden here.
     * Simply match the property name and provide the override values.
     * Examples being:
     *     disable clean in development,
     *     use different entry files,
     *     etc.
     */
    develop: {
        devtool: 'inline-source-map'
    },

    /**
     * Compilation/packaging/plugins options.
     *
     * Configuration dictates various plugin and build options used by this
     * package.
     *
     * @property {Object<string,string>} aliases
     *     Defines path aliases for assets, allowing them to be imported
     *     under that alias rather than the full path.
     *     This package provides the default aliases:
     *         _     : The path to this configuration file
     *         __src : The path to the structure.source_root directory
     *     See: https://webpack.js.org/configuration/resolve/#resolvealias
     * @property {false|Object} imagemin
     *     Image minification plugin options.
     *     Set to false to disable the image min plugin.
     *     See: https://www.npmjs.com/package/imagemin-webpack-plugin
     *     IMPORTANT: Due to the processing time of image minification on
     *     larger projects the plugin will be only be enabled during production
     *     builds. It will not run for watch/server or development mode builds.
     * @property {false|Object} notifier
     *     Build notifier plugin options.
     *     Set to false to disable.
     *     See: https://www.npmjs.com/package/webpack-notifier
     *     IMPORTANT: Notifications only enabled on watch/server runs.
     * @property {false|Object} postcss
     *     Postcss plugin options.
     *     Set to false to disable.
     *     See: https://github.com/postcss/postcss-loader
     *     Non standard config options:
     *         useDefaults {boolean}:
     *             If set to true the following plugins with default config
     *             will be enabled: postcss-cssnext, cssnano
     * @property {Object} server
     *     The webpack dev server configuration.
     *     Used when the server is run.
     *     See: https://webpack.js.org/configuration/dev-server/
     * @property {Object} watch
     *     The webpack watch options
     *     Used when a watched build is run.
     *     See: https://webpack.js.org/configuration/watch/#watchoptions
     */
    options: {
        aliases: {},
        imagemin: {},
        notifier: {},
        postcss: {
            useDefaults: true,
        },
        server: {
            host: 'localhost',
            port: 8080
        },
        watch: {}
    }
};
