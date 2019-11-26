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
                    ".ts"
                ]
            }
        }
    },
    rules: {
        "class-methods-use-this": "off",
        "comma-dangle": ["error", "never"],
        "indent": ["error", 4],
        "max-len": ["error", {
            "code": 120
        }],
        "object-property-newline": ["error", {
            "allowAllPropertiesOnSameLine": false
        }],
        "padded-blocks": ["error", {
            "blocks": "never",
            "classes": "always",
            "switches": "never"
        }],


        //Typescript overrides
        "no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars": ["error", {
            "args": "none",
        }],

        "semi": "off",
        "@typescript-eslint/semi": ["error"]
    }

};
