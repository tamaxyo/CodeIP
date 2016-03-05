(function(){
  // var uid = (function () {
  //   var id = chrome.runtime.sendMessage({
  //     method: "getLocalStorage",
  //     key: "id"
  //   }, function(response) {
  //     id = response.data;
  //   })
  //   if(id === undefined) {
  //     id = guid();
  //     localStorage["id"] = id;
  //   }
  //   return id;
  // })();
  
  var guid = function () {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  }

  $(function(){
    var id = window.localStorage.getItem("id");
    if(!id) {
      id = guid();
    }
    $("#id").text(id);
    window.localStorage.setItem("id", id);
  });

})();
