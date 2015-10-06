'use strict';

// TODO: Use local storage to gather historical data

// traffic data for current session per tab
var trafficData = {};
var persistentData = JSON.parse(localStorage.getItem('ECNUD')) || {}; 
if(!persistentData.total){
	persistentData.total = {};
}

var bytesToPush = 0;

// CO2/Traffic Conversion: 1 MB / 0.722g CO2

chrome.runtime.onInstalled.addListener(details => {
  console.log('previousVersion', details.previousVersion);
});

chrome.webRequest.onHeadersReceived.addListener(
function(details) {
	if(typeof trafficData[details.tabId] === 'undefined'){
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
    if(details.tabId >= 0){
		chrome.tabs.get(details.tabId, function(tab){
			if(!tab || chrome.runtime.lastError) { return; }
	    	var currentTab = tab;
	    	var domain = currentTab.url.match(/^[\w-]+:\/*\[?([\w\.:-]+)\]?(?::\d+)?/)[1].replace('www.', '');
	    	if(typeof persistentData.total[domain] === 'undefined'){
	    		persistentData.total[domain] = 0;
	    	}
	    	persistentData.total[domain] += contentLength;
	    });
	}
},
{urls: ['<all_urls>']},
['responseHeaders']);

chrome.windows.onRemoved.addListener(function(){
	localStorage.setItem('ECNUD', JSON.stringify(persistentData));
});

setInterval(function(){
	console.log('checking bytes to push...');
	if(bytesToPush > 0){
		console.log('pushing');
		fetchival('http://10.211.55.13:3000/pushVolume?bytes=' + bytesToPush, { responseAs: 'text' })
			.get()
  			.catch(function(err) {
				console.log(err);
			});
		bytesToPush = 0; 
	}
}, 3000);