var LIBRARY_IDENTIFIER = 'libraryIdentifier';
var background = chrome.extension.getBackgroundPage();

$(document).ready(function() { 
 });

function save(select) {
   var libraryServer = $('#library').val();
   //alert('bar: ' + libraryServer);
   if (window.localStorage == null) {
      alert('Local storage is required for using options.');
      return;
    }
    window.localStorage[LIBRARY_IDENTIFIER] = libraryServer;
}

function main() {
  $("#library").select2().select2('val', window.localStorage[LIBRARY_IDENTIFIER]);
}

document.addEventListener('DOMContentLoaded', function () {
   main();
   document.querySelector('#library-save').addEventListener('click', save);
});
