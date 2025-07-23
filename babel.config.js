module.exports = {
  presets: ['module:@react-native/babel-preset',
            '@babel/preset-typescript'    
  ],
    plugins: [
    ['react-native-worklets-core/plugin'],
    ['@babel/plugin-proposal-optional-chaining'],
    ['@babel/plugin-transform-shorthand-properties'],
    ['@babel/plugin-transform-arrow-functions'],
    ['@babel/plugin-proposal-nullish-coalescing-operator'],
    ['@babel/plugin-transform-template-literals']
  ],
};
