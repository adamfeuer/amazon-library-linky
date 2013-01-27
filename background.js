$.getScript("constants.js", function(){});

function openOrFocusOptionsPage() {
   var optionsUrl = chrome.extension.getURL('options.html'); 
   chrome.tabs.query({}, function(extensionTabs) {
      var found = false;
      for (var i=0; i < extensionTabs.length; i++) {
         if (optionsUrl == extensionTabs[i].url) {
            found = true;
            chrome.tabs.update(extensionTabs[i].id, {"selected": true});
         }
      }
      if (found == false) {
          chrome.tabs.create({url: "options.html"});
      }
   });
}

function setItem(key, value) {
   window.localStorage[key] = value;
}

function getItem(key) {
   return window.localStorage[key];
}

function onInstall() {
   console.log("Extension Installed");
   setItem(LIBRARY_IDENTIFIER, DEFAULT_LIBRARY);
}

function onUpdate() {
   console.log("Extension Updated");
}

function getVersion() {
   var details = chrome.app.getDetails();
   return details.version;
}

/*
// set browser action (icon button)
chrome.extension.onConnect.addListener(function(port) {
  var tab = port.sender.tab;
  port.onMessage.addListener(function(info) {
    var max_length = 1024;
    if (info.selection.length > max_length)
      info.selection = info.selection.substring(0, max_length);
      openOrFocusOptionsPage();
  });
});
*/

// Called when the user clicks on the browser action icon.
chrome.browserAction.onClicked.addListener(function(tab) {
   openOrFocusOptionsPage();
});

// check if the version has changed.
var currVersion = getVersion();
var prevVersion = localStorage['version']
if (currVersion != prevVersion) {
   if (typeof prevVersion == 'undefined') {
      onInstall();
   } else {
      onUpdate();
   }
   localStorage['version'] = currVersion;
}

// allow access to localStorage via message passing
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.method == "getLocalStorage") {
      sendResponse({data: getItem(request.key)});
    } else if (request.method == "setLocalStorage") {
      setItem(request.key, request.value);
      sendResponse({data: "SUCCESS"});
    } else
      sendResponse({});
});


