(function(){
  var tabSelectionChanged = function() {
    chrome.tabs.query({
      active: true,
      lastFocusedWindow: true
    }, function(tabs){
      if(tabs.length > 0) {
        chrome.browserAction.setBadgeText({text:tabs[0].id+""})        
      }
    });
  }
  
  chrome.tabs.onActivated.addListener(function(activeTab){
    tabSelectionChanged();
  });

  chrome.windows.onFocusChanged.addListener(function(windowId){
    tabSelectionChanged();
  });

  tabSelectionChanged();
})();
