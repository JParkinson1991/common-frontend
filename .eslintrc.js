module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: "./tsconfig.json"
    },
    plugins: [
        '@typescript-eslint'
    ],
    extends: [
        'airbnb-base',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
    ],
    settings: {
        "import/resolver": {
            "node": {
                "extensions": [
                    ".ts",
                ]
            }
        }
    },
    rules: {
        "brace-style": ["error", "stroustrup"],
        "class-methods-use-this": "off",
        "comma-dangle": ["error", "never"],
        "indent": ["error", 4, {
            "SwitchCase": 1
        }],
        "max-len": ["error", {
            "code": 120
        }],
        "no-param-reassign": "off",
        "object-property-newline": ["error", {
            "allowAllPropertiesOnSameLine": false
        }],
        "padded-blocks": ["error", {
            "blocks": "never",
            "classes": "always",
            "switches": "never"
        }],

        //Typescript overrides
        "@typescript-eslint/no-inferrable-types": "off",
        "no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars": ["error", {
            "args": "none",
        }],
        "semi": "off",
        "@typescript-eslint/semi": ["error"]
    }

};
