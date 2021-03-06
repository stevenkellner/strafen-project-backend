module.exports = {
    root: true,
    env: {
        es6: true,
        node: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:import/errors',
        'plugin:import/warnings',
        'plugin:import/typescript',
        'google',
        'plugin:@typescript-eslint/recommended',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: ['tsconfig.json', 'tsconfig.dev.json'],
        sourceType: 'module',
    },
    ignorePatterns: [
        '/lib/**/*', // Ignore built files.
        '/docs/**/*', // Ignore documentation files.
    ],
    plugins: [
        '@typescript-eslint',
        'import',
    ],
    rules: {
        'quotes': ['error', 'single'],
        'indent': ['error', 4],
        'max-len': ['warn', 120],
        'require-jsdoc': ['warn', {
            'require': {
                'FunctionDeclaration': true,
                'MethodDefinition': true,
                'ClassDeclaration': true,
                'ArrowFunctionExpression': true,
                'FunctionExpression': true,
            },
        }],
        'no-case-declarations': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        // "@typescript-eslint/explicit-module-boundary-types": "off",
        // "@typescript-eslint/no-unused-vars": "off",
        'curly': 'off',
        'arrow-parens': 'off',
        'padded-blocks': 'off',
        'new-cap': 'off',
        'prefer-rest-params': 'off',
        // "no-caller": "off",
        '@typescript-eslint/no-namespace': 'off',
        'object-curly-spacing': ['warn', 'always'],
        // "import/export": "off",
        // "no-extend-native": "off",
        // "valid-jsdoc": "off",
        // "no-irregular-whitespace": "off",
        // "no-prototype-builtins": "off",
        '@typescript-eslint/no-inferrable-types': 'off',
        'no-trailing-spaces': 'warn',
        'no-prototype-builtins': 'off',
    },
};
