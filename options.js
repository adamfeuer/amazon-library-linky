
$(document).ready(function() { 
   $("#library").select2(); 
 });

function saveLibrary() {
   chrome.extension.getBackgroundPage().console.log('foo');
};
