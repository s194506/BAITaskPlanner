import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

// loading cordova.js for specific platform (only when dev)
if (process.env.NODE_ENV === 'development') {
  const scriptEl = document.createElement('script');
  scriptEl.src = `/cordova-${getOS()==='iOS'?'ios':getOS()==='Android'?'android':'browser'}/cordova.js`
  document.body.appendChild(scriptEl);
}
document.addEventListener('deviceready', startApp);


// mount the app in <div id="root"/>
function startApp() {
  ReactDOM.render((
    <App/>
  ), document.getElementById('root'));
}

window.getOS = getOS;
function getOS() {
  var userAgent = window.navigator.userAgent,
      platform = window.navigator.platform,
      macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
      windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'],
      iosPlatforms = ['iPhone', 'iPad', 'iPod'],
      os = null;

  if (macosPlatforms.indexOf(platform) !== -1) {
    os = 'Mac OS';
  } else if (iosPlatforms.indexOf(platform) !== -1) {
    os = 'iOS';
  } else if (windowsPlatforms.indexOf(platform) !== -1) {
    os = 'Windows';
  } else if (/Android/.test(userAgent)) {
    os = 'Android';
  } else if (!os && /Linux/.test(platform)) {
    os = 'Linux';
  }

  return os;
}

