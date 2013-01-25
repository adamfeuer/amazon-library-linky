
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
    window.localStorage.libraryServer = libraryServer;
}

function main() {
   if (window.localStorage == null) {
      alert("LocalStorage must be enabled for using options.");
      return;
  }
  //alert("foo: " + window.localStorage.libraryServer);
  $("#library").select2().select2('val', window.localStorage.libraryServer);
}

document.addEventListener('DOMContentLoaded', function () {
   main();
   document.querySelector('#library-save').addEventListener('click', save);
});
