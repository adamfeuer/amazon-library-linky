
function openOrFocusOptionsPage() {
   var optionsUrl = chrome.extension.getURL('options.html'); 
   chrome.tabs.query({}, function(extensionTabs) {
      var found = false;
      for (var i=0; i < extensionTabs.length; i++) {
         if (optionsUrl == extensionTabs[i].url) {
            found = true;
            console.log("tab id: " + extensionTabs[i].id);
            chrome.tabs.update(extensionTabs[i].id, {"selected": true});
         }
      }
      if (found == false) {
          chrome.tabs.create({url: "options.html"});
      }
   });
}
chrome.extension.onConnect.addListener(function(port) {
  var tab = port.sender.tab;
  // This will get called by the content script we execute in
  // the tab as a result of the user pressing the browser action.
  port.onMessage.addListener(function(info) {
    var max_length = 1024;
    if (info.selection.length > max_length)
      info.selection = info.selection.substring(0, max_length);
      openOrFocusOptionsPage();
  });
});

function setItem(key, value) {
   localStorage.setItem(key, value);
}

function getItem(key) {
   return localStorage.getItem(key);
}

// Called when the user clicks on the browser action icon.
chrome.browserAction.onClicked.addListener(function(tab) {
   openOrFocusOptionsPage();
});

// allow access to localStorage via message passing
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.method == "getLocalStorage") {
      console.log("bg get localStorage- key: " + request.key);
      console.log("bg get val: " + getItem(request.key));
      sendResponse({data: getItem(request.key)});
    } else if (request.method == "setLocalStorage") {
      console.log("bg set local: " + request.key + " " + request.value);
      setItem(request.key, request.value);
      console.log("bg test get: " + getItem(request.key));
      sendResponse({data: "SUCCESS"});
    } else
      sendResponse({}); // snub them.
});

