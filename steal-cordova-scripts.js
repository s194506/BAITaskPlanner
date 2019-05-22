const { stealThings } = require('./__utils');

function filterCB(fileOrDirPath, fileOrDirName, ext, isDirectory) {
  return (isDirectory || ext === 'js') && fileOrDirName !== 'cordova-js-src'
}

const whatToSteal = [
  {
    name: 'ios',
    from: './platforms/ios/platform_www',
    to: './public/cordova-ios',
    filterCB
  },
  {
    name: 'android',
    from: './platforms/android/platform_www',
    to: './public/cordova-android',
    filterCB
  },
  {
    name: 'browser',
    from: './platforms/browser/platform_www',
    to: './public/cordova-browser',
    filterCB
  }
];

(async () => {
  await stealThings(whatToSteal);
})()