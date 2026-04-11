module.exports = {
  preset: '@react-native/jest-preset',
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|@react-native-community|@react-navigation|react-native-.*|@reduxjs/toolkit|react-redux|immer)',
  ],
};
