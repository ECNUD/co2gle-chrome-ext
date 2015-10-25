'use strict';

// TODO: Use local storage to gather historical data

// traffic data for current session per tab
var trafficData = {};
var persistentData = JSON.parse(localStorage.getItem('ECNUD')) || {};
if (!persistentData.total) {
	persistentData.total = {};
}

var co2ConversionRate = 7.22;
var pushIntervalTime = 500;
var bytesToPush = 0;

function bytesToCO2(bytes) {
	return Math.round(bytes / 1024 / 1024 * co2ConversionRate);
}

function gramsToLiters(grams) {
	return Math.round(grams * (559 / 1000) * 1000) / 1000;
}

// CO2/Traffic Conversion: 1 MB / 0.722g CO2

chrome.runtime.onInstalled.addListener(function (details) {
	console.log('previousVersion', details.previousVersion);
});

chrome.webRequest.onHeadersReceived.addListener(function (details) {
	if (typeof trafficData[details.tabId] === 'undefined') {
		trafficData[details.tabId] = 0;
	}
	var contentLength = 0;

	for (var i = 0; i < details.responseHeaders.length; ++i) {
		if (details.responseHeaders[i].name.toLowerCase() === 'content-length') {
			contentLength = parseInt(details.responseHeaders[i].value, 10);
			break;
		}
	}

	trafficData[details.tabId] += contentLength;
	bytesToPush += contentLength;

	// Update historic data
	if (details.tabId >= 0) {
		chrome.tabs.get(details.tabId, function (tab) {
			if (!tab || chrome.runtime.lastError) {
				return;
			}
			var currentTab = tab;
			var domain = currentTab.url.match(/^[\w-]+:\/*\[?([\w\.:-]+)\]?(?::\d+)?/)[1].replace('www.', '');
			if (typeof persistentData.total[domain] === 'undefined') {
				persistentData.total[domain] = 0;
			}
			persistentData.total[domain] += contentLength;
		});
	}
}, { urls: ['<all_urls>'] }, ['responseHeaders']);

chrome.windows.onRemoved.addListener(function () {
	localStorage.setItem('ECNUD', JSON.stringify(persistentData));
});

var pushing = false;
setInterval(function () {
	if (gramsToLiters(bytesToCO2(bytesToPush)) > 0 && !pushing) {
		pushing = true;
		var temp = bytesToPush;
		bytesToPush = 0;
		console.log('Pushing', temp, gramsToLiters(bytesToCO2(temp)));
		fetchival('http://10.211.55.13:3000/pushVolume?bytes=' + temp, { responseAs: 'text' }).get()['catch'](function (err) {
			console.log(err);
		});
		pushing = false;
	}
}, pushIntervalTime);
//# sourceMappingURL=background.js.map
