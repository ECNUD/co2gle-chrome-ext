var query = { active: true, currentWindow: true };
var trafficData = chrome.extension.getBackgroundPage().trafficData;
var persistentData = chrome.extension.getBackgroundPage().persistentData;

var noDataStr = 'no data';

function callback(tabs) {
  var currentTab = tabs[0];
  var domain = currentTab.url.match(/^[\w-]+:\/*\[?([\w\.:-]+)\]?(?::\d+)?/)[1].replace('www.', '');
  document.getElementById('current_domain').innerHTML = domain;
  var accumulated = chrome.extension.getBackgroundPage().bytesToCO2(Math.max(persistentData.total[domain], 0));
  document.getElementById('footprint_accumulated').innerHTML = accumulated ? accumulated + 'g of CO2' : noDataStr;
  var traffic = Math.max( Math.round(trafficData[currentTab.id] / 1024 / 1024 * 100) / 100, 0 );
  document.getElementById('page_size').innerHTML = traffic ? traffic + ' MB' : noDataStr;
  var grams = Math.max( chrome.extension.getBackgroundPage().bytesToCO2(trafficData[currentTab.id]), 0 );
  document.getElementById('page_footprint').innerHTML = grams ? grams + 'g of CO2' : noDataStr;
  var liters = Math.max( chrome.extension.getBackgroundPage().gramsToLiters(grams), 0 );
  document.getElementById('footprint_volume').innerHTML = liters ? liters + ' Liters' : noDataStr;
  var mate = '<div class="bottle"></div>';
  var bottles = [];
  var sum = liters / 0.5; 
  for (var i = sum; i >= 1; i--) {
  	bottles.push(mate);
  }
  var str = bottles.join('');
  document.getElementById('club_mate').innerHTML = str;
  console.log('currentTab', currentTab.id, trafficData, str, persistentData);
}
chrome.tabs.query(query, callback);
