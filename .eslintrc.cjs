module.exports = {
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    root: true,
    env: {
        browser: true,
        node: true,
    },
    rules: {
        "no-empty": ["error", {"allowEmptyCatch": true}]
    },
    ignorePatterns: ["dist/assets/*"]
};
