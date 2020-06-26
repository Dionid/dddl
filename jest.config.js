module.exports = {
    globals: {
        'ts-jest': {
            tsConfig: {
                sourceMap: true,
                inlineSourceMap: true
            }
        },
    },
    preset: 'ts-jest',
    testEnvironment: 'node',
};