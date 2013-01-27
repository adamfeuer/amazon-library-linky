$.getScript("constants.js", function(){});

function save(e) {
   var libraryServer = $('#library').val();
   window.localStorage[LIBRARY_IDENTIFIER] = libraryServer;
}

function saveDefaultLibary() {
   $("#library").select2().select2('val', window.localStorage[LIBRARY_IDENTIFIER]);
}

function addChangeListenerToSelect() {
   $("#library").change(save);
}

document.addEventListener('DOMContentLoaded', function () {
   saveDefaultLibary();
   addChangeListenerToSelect();
});

