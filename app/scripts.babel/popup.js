var query = { active: true, currentWindow: true };
var trafficData = chrome.extension.getBackgroundPage().trafficData;
var co2ConversionRate = 7.22;
function callback(tabs) {
  var currentTab = tabs[0];
  document.getElementById('pageSizeDemo').innerHTML = Math.round(trafficData[currentTab.id] / 1024 / 1024 * 100) / 100 + 'MB';
  document.getElementById('co2demo').innerHTML = Math.round(trafficData[currentTab.id] / 1024 / 1024 * co2ConversionRate) + 'g of CO2';
}
chrome.tabs.query(query, callback);
