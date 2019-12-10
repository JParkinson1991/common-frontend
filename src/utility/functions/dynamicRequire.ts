/**
 * @file
 * DynamicRequire.ts
 *
 * @author Josh Parkinson <joshparkinson1991@gmail.com>
 */

/**
 * Dynamically require modules
 *
 * The following utility function can be used to bypass webpack's
 * (if applicable) module resolution at runtime. Useful for module requirements
 * that need determining at runtime, for example, configuration containing
 * modules.
 *
 * @param {string} module
 *    The module to require
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function (module: string): any {
    // eslint-disable-next-line @typescript-eslint/camelcase,@typescript-eslint/ban-ts-ignore
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/camelcase,no-undef
    const requireFunc = typeof __webpack_require__ === 'function' ? __non_webpack_require__ : require;
    return requireFunc(module);
}
