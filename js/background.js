(function(){
  var SERVER = "http://133.130.89.148/";

  var uid = (function () {
    var id = window.localStorage.getItem("id");
    if(!id) {
      id = guid();
      window.localStorage.setItem("id", id);
    }
    return id;
  })();

  var update = function() {
    tabSelectionChanged();
    notifyUpdate();
  }
  var tabSelectionChanged = function() {
    var data = {};
    data["pf"] = "Web";

    chrome.tabs.query({
      active: true,
      lastFocusedWindow: true
    }, function(tabs){
      if(tabs.length > 0) {
        data["url"] = tabs[0].url

        $.ajax({
          method: "GET",
          url: SERVER+"array",
          data: JSON.stringify(data)
        }).done(function(memos){
          console.log("getLogs - success, data:", memos);

          memos = memos.filter(function(m){
            return data["url"] === m.url;
          });
          
          if(memos.length > 0) {
            chrome.browserAction.setBadgeBackgroundColor({color:[255, 187, 153, 255]});
            chrome.browserAction.setBadgeText({text:memos.length+""});
          } else {
            chrome.browserAction.setBadgeText({text:"-"});
            chrome.browserAction.setBadgeBackgroundColor({color: [200, 200, 200, 255]});
          }
        });
      }
    });
  }

  var notifyUpdate = function() {
    console.log("notifyUpdate");

    var data = {};
    data["uid"] = uid;
    data["pf"] = "Web";

    chrome.tabs.query({
      active: true,
      lastFocusedWindow: true
    }, function(tabs){
      if(tabs.length > 0) {
        data["url"] = tabs[0].url
        var reqList = [];
        reqList.push($.ajax({method: "GET", url:SERVER+"array", data: JSON.stringify(data)}));
        reqList.push($.ajax({method: "GET", url:SERVER+"parray", data: JSON.stringify(data)}));
        reqList.push($.ajax({method: "GET", url:SERVER+"rarray", data: JSON.stringify(data)}));

        $.when.apply($, reqList).done(function() {
          var memos = arguments[0][0].filter(function(m){ return data["url"] === m.url });
          var rels = arguments[2][0].filter(function(r){
            return $.inArray(r.bid, memos.map(function(m){ return m.id })) > -1
          });
          var projects = arguments[1][0].filter(function(p){
            return $.inArray(p.id, rels.map(function(r){ return r.pid})) > -1
          });

          console.log("notifyUpdate - selcted projects: ", projects);
          if(projects.length > 0) {
            $.each(projects, function(idx){
              chrome.notifications.create("", {
                type: "basic",
                iconUrl: "icon.png", 
                title: "CodeIP", 
                message: "project " + projects[idx].title + " is updated!!"
              }, function(nid) {
                console.log("notifyUpdate - sent");
                sessionStorage.setItem(nid, projects[idx].url);
                setTimeout(function(){
                  console.log("notifyUpdate - cleared");
                  chrome.notifications.clear(nid);
                }, 5000);
              })
            })
          }
        });
      }
    });
  }

  chrome.notifications.onClicked.addListener(function(nid){
    console.log("notifications.onClicked", nid);
    var url = sessionStorage.getItem(nid);
    if(url) {
      console.log("open project page from notification", url)
      chrome.tabs.create({url: url, active: true});
    }
  });

  chrome.notifications.onClosed.addListener(function(nid){
    console.log("notifications.onClosed");
    sessionStorage.removeItem(nid);
  })
  
  chrome.tabs.onActivated.addListener(function(activeTab){
    console.log("tabs.onActivated");
    update();
  });

  chrome.tabs.onUpdated.addListener(function(activeTab){
    console.log("tabs.onUpdated");
    update();
  });

  chrome.windows.onFocusChanged.addListener(function(windowId){
    console.log("windows.onFocusChanged");
    update();
  });

  chrome.runtime.onMessage.addListener(function(req, sender, sendResponse) {
    console.log("onMessage", req, sender);
    if(req.method === "update" ) {
      update();
    }
  });

  update();
})();
