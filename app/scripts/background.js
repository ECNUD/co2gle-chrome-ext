'use strict';

// TODO: Use local storage to gather historical data

// traffic data for current session per tab
var trafficData = {};

// CO2/Traffic Conversion: 1 MB / 0.722g CO2

chrome.runtime.onInstalled.addListener(function (details) {
  console.log('previousVersion', details.previousVersion);
});

chrome.webRequest.onHeadersReceived.addListener(function (details) {
  console.log('background cb', details, arguments, details.responseHeaders);
  if (!trafficData[details.tabId]) {
    trafficData[details.tabId] = 0;
  }
  for (var i = 0; i < details.responseHeaders.length; ++i) {
    if (details.responseHeaders[i].name === 'Content-Length') {
      trafficData[details.tabId] += parseInt(details.responseHeaders[i].value, 10);
    }
  }
}, { urls: ['<all_urls>'] }, ['responseHeaders']);
//# sourceMappingURL=background.js.map
