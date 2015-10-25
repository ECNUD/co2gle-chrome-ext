'use strict';

var query = { active: true, currentWindow: true };
var trafficData = chrome.extension.getBackgroundPage().trafficData;
var persistentData = chrome.extension.getBackgroundPage().persistentData;

function callback(tabs) {
  var currentTab = tabs[0];
  var domain = currentTab.url.match(/^[\w-]+:\/*\[?([\w\.:-]+)\]?(?::\d+)?/)[1].replace('www.', '');
  document.getElementById('current_domain').innerHTML = domain;
  document.getElementById('footprint_accumulated').innerHTML = chrome.extension.getBackgroundPage().bytesToCO2(persistentData.total[domain]) + 'g of CO2';
  document.getElementById('page_size').innerHTML = Math.round(trafficData[currentTab.id] / 1024 / 1024 * 100) / 100 + ' MB';
  var grams = chrome.extension.getBackgroundPage().bytesToCO2(trafficData[currentTab.id]);
  document.getElementById('page_footprint').innerHTML = grams + 'g of CO2';
  var liters = chrome.extension.getBackgroundPage().gramsToLiters(grams);
  document.getElementById('footprint_volume').innerHTML = liters + ' Liters';
  var mate = '<div class="bottle"></div>';
  var bottles = [];
  var sum = liters / 0.5;
  for (var i = sum; i >= 0; i--) {
    bottles.push(mate);
  }
  var str = bottles.join('');
  document.getElementById('club_mate').innerHTML = str;
  console.log('currentTab', currentTab.id, trafficData, str, persistentData);
}
chrome.tabs.query(query, callback);
//# sourceMappingURL=popup.js.map
