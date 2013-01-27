
var libraries = {};

function loadConstants() {
   $.getScript("constants.js");
}

function getLibraryDict(libraryArray) {
   libraries = {}
   for (var i=0; i<libraryArray.length; i++) {
      libraries[libraryArray[i]["id"]] = libraryArray[i]["text"]; 
   }
   console.log("libraries:");
   console.log(libraries);
   console.log(libraries['seattle.bibliocommons.com']);
   return libraries;
}

function getLibrariesAndAddToSelect() {
   console.log("in getLib");
   $.getJSON("libraries.json", function(data) {
      console.log(data);
      $('#library').select2(data);
      libraries = getLibraryDict(data["data"]);
      console.log("about to change select");
      changeSelectToStoredLibrary();
      console.log("about to add change listener");
      addChangeListenerToSelect();
   });
}

function save(e) {
   console.log("in save: ");
   var library = $('#library').select2("data")["id"]
   console.log("lib server data: " + library);
   console.log("lib server: " + library);
   console.log(library);
   window.localStorage[LIBRARY_IDENTIFIER] = library;
   libraryName = libraries[library];
   window.localStorage[LIBRARY_NAME] = libraryName;
}

function changeSelectToStoredLibrary() {
   var library = window.localStorage[LIBRARY_IDENTIFIER]
   libraryName = libraries[library];
   window.localStorage[LIBRARY_NAME] = libraryName;
   $("#library").select2('data', {'id': library, 'text': libraryName});
}

function addChangeListenerToSelect() {
   console.log("add listener");
   $("#library").change(save);
}

document.addEventListener('DOMContentLoaded', function () {
   loadConstants();
   getLibrariesAndAddToSelect();
});

