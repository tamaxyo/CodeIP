(function(){
  chrome.tabs.onActivated.addListener(function(activeTab){
    chrome.browserAction.setBadgeText({text:activeTab.tabId+""});
  })
})();
