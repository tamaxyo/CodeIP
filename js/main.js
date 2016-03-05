(function(){
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
    chrome.tabs.query({
      active: true,
      lastFocusedWindow: true
    }, function(tabs){
      if(tabs.length > 0) {
        data["url"] = tabs[0].url
        $.ajax({
          method: "GET",
          url: "http://localhost:8000/memos.json",
          data: JSON.stringify(data)
        }).done(function(memos){
          console.log("getLogs - success, data:", memos);
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
    chrome.tabs.query({
      active: true,
      lastFocusedWindow: true
    }, function(tabs){
      if(tabs.length > 0) {
        data["url"] = tabs[0].url
        $.ajax({
          method: "GET",
          url: "http://localhost:8000/projects.json",
          data: JSON.stringify(data)
        }).done(function(projects){
          console.log("getProjects - success, data:", projects);
          $("#related").hide();
          $("#projects").html(
            projects.map(function(p){
              return '<a target="_blank" href="' + p.url + '" title="' + p.description + '">' + p.title + '</a>'
            }).join("<br />")
          );
          for(var i = 0; i < projects.length; i++) {
            console.log(projects[i]);
            $("#projects").append('<option value="' + projects[i].memo + '"></option>');
            $("#related").show();
          }
        }).fail(function(xhr, status){
          console.log("getProjects - fail, status: ", status);
        }).always(function(){
          console.log("getProjects - always")
        });
      }
    })
  };

  var openProjectInTab = function(url) {
    console.log("openProjectInTab", url)
    chrome.tabs.create({
      url: url, 
      active: true
    });
  }
  
  var sendMemo = function() {
    var data = {};
    data["uid"] = uid;
    data["pf"] = "Web";
    data["memo"] = $("#memo").text();
    data["rate"] = $("#rate").val();

    chrome.tabs.query({
      active: true,
      lastFocusedWindow: true
    }, function(tabs){
      if(tabs.length > 0) {
        data["url"] = tabs[0].url

        $.ajax({
          method: "GET", 
          url: "http://localhost:8000",
          data: JSON.stringify(data)
        }).done(function(){
          console.log("sendMemo - done");
        }).fail(function(){
          console.log("sendMemo - fail");
        }).always(function(){
          console.log("sendMemo - always")
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
