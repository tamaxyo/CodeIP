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
  
  var guid = function () {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  }

  var getMemos = function() {
    var data = {};
    data["uid"] = uid;
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
          
          $("#memos").html(
            memos.map(function(m){
              return '<option value="' + m.memo + '"></option>';
            }).join("")
          );
        }).fail(function(xhr, status){
          console.log("getLogs - fail, status: ", status);
        }).always(function(){
          console.log("getLogs - always")
        });
      }
    })
  };

  var getProjects = function() {
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
          
          if (projects.length > 0) {
            $("#related").show();
            $("#projects").html(
              projects.map(function(p){
                return '<a target="_blank" href="' + p.url + '" title="' + p.description + '">' + p.title + '</a>'
              }).join("<br />")
            );
          } else {
            $("#related").hide();
          } 
        }).fail(function(xhr, status){
          console.log("getProjects - fail, status: ", status);
        }).always(function(){
          console.log("getProjects - always")
        });
      }
    })
  };

  var sendMemo = function() {
    var data = {};
    data["uid"] = uid;
    data["pf"] = "Web";
    data["memo"] = $("#memo").val();
    data["rate"] = $("#rate").val();

    chrome.tabs.query({
      active: true,
      lastFocusedWindow: true
    }, function(tabs){
      if(tabs.length > 0) {
        data["url"] = tabs[0].url
        console.log("sendMemo - ", data);
        $.ajax({
          method: "POST", 
          url: SERVER+"books/add",
          data: data //JSON.stringify(data)
        }).done(function(){
          console.log("sendMemo - done");
        }).fail(function(xhr, status){
          console.log("sendMemo - fail, status: ", status);
        }).always(function(){
          console.log("sendMemo - always")
          chrome.runtime.sendMessage({method: "update"});
        });
      }
    });
  }
  
  $(function(){
    getMemos();
    getProjects();

    $("#submit").click(function(evt){
      sendMemo();
    });
    $("#submit").keyup(function(evt){
      if(evt.which == 13) {
        sendMemo();
      }
    })
  });
})();
