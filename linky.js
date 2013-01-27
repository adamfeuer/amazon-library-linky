$.getScript("constants.js", function(){});

var WORLDCAT_ISBN_SEARCH_URL = 'http://xisbn.worldcat.org/webservices/xid/isbn/';
var DONE = 4;
var libraryServer = '';
var libraryBaseName = 'Seattle Public Library';
var libraryName = libraryBaseName;
var libraryIsbnUrlPattern = 'http://' + libraryServer + '/search?custom_query=Identifier%3A'
var libraryTitleUrlPattern = 'http://' + libraryServer + '/search?t=title&search_category=title&q='

function getLibraryServerAndCall(nextFunction) {
   chrome.extension.sendMessage({method: "getLocalStorage", key: LIBRARY_IDENTIFIER}, function(response) {
      console.log(LIBRARY_IDENTIFIER + ": " + response.data);
      libraryServer = response.data;
      libraryBaseName = libraryServer;
      libraryName = libraryBaseName; // TODO: should be name, not servername
      libraryIsbnUrlPattern = 'http://' + libraryServer + '/search?custom_query=Identifier%3A'
      libraryTitleUrlPattern = 'http://' + libraryServer + '/search?t=title&search_category=title&q='
      return nextFunction();
   });
}

(function(){
   console.log('Amazon Seattle Public Library Linky');  

//library statuses, text may need to be changed for other libraries
//check that the text on the result page of your library matches the text below
//other changes in getBookStatus() might be needed as well (for example to handle states not listed below)
   var libraryNotFound = /No direct matches were found/;
   var libraryCheckedIn = /Available/;
   var libraryOnOrder = /On Order/;
   var libraryHolds = /All copies in use/;
   var libraryElectronic = /electronic item/;

   var isbn = getIsbn(top.location.href);
   
   var isbns = new Array();
   var isbnsIndex = -1;
   var foundCount = 0;

   if (isbn!=0){
      getLibraryServerAndCall(main);
   }
   return;

function main() {
   createStatusAndLibraryHTML();
   updateStatusHTML('Searching ' + libraryName + '...');
   getStatusAllISBNs(isbn);

}


//get all ISBNs for this book and write to global var isbns
//then call getBookStatuses
function getStatusAllISBNs(isbn) {
   var url = WORLDCAT_ISBN_SEARCH_URL + isbn;
   console.log('Searching for isbns: ' + url);
   var async = true;
   var xhr = new XMLHttpRequest();
   xhr.open('GET', url, async);
   xhr.setRequestHeader('Accept', 'application/atom+xml,application/xml,text/xml');
   xhr.onload = function(e) {
      if (this.status == 200) {
         responseText = xhr.responseText; 
         console.log('Got isbns: ' + responseText);
         var parser = new DOMParser();
         var dom = parser.parseFromString(responseText,
               "application/xml");
         var isbnsDom = dom.getElementsByTagName('isbn');
         for (var i = 0; i < isbnsDom.length; i++){
            isbns[i] = isbnsDom[i].textContent;
         }
         getBookStatuses();
       }
   }
   xhr.send();
}

//loop through all the isbns
//this gets called back after each search to do next isbn
function getBookStatuses(){
   isbnsIndex++;
   console.log("getBookStatuses"+isbnsIndex+ " " + isbns.length);

   if (isbnsIndex < isbns.length){
      updateStatusHTML("Searching for ISBN "+ isbns[isbnsIndex] + " in " + libraryName + '...');
      getBookStatus(libraryIsbnUrlPattern, isbns[isbnsIndex]);
   //when done going through isbns, update the status
   } else {
      if (foundCount==0){
         setStatusNoneFound();
      } else if (foundCount==1){
         removeStatus();
      } else {
         setStatusColor("black");
         updateStatusHTML(foundCount+ ' versions found:');
      }
   }
}


//connect to library server to get book status for isbn and then insert result under the book title
//call getBookStatuses when done
function getBookStatus(libraryUrlPattern, isbn){
   console.log('Searching: '+libraryUrlPattern + isbn); 
   url = libraryUrlPattern + isbn;
   var xhr = new XMLHttpRequest();
   var async = true;
   xhr.open('GET', url, async);
   xhr.onload = function(e) {
      if (this.status == 200 ) {
         page = xhr.responseText; 
         if ( libraryNotFound.test(page) ){
            getBookStatuses();
         }
         //if there are holds
         else if ( libraryHolds.test(page) ) {
            //hold info no longer available on first results page
            setLibraryHTML(
               libraryUrlPattern, isbn,
               "On hold.", "No copies currently available at "
               + libraryName,
               "#3399FF"
               );
            foundCount++;
            getBookStatuses();
         } else if ( libraryCheckedIn.test(page) ) {
            setLibraryHTML(
               libraryUrlPattern, isbn,
               "On the shelf now!",
               "Available now in " + libraryName,
               "green" 
//             "#2bff81" //light green
               );
            foundCount++;
            getBookStatuses();
         } else if ( libraryOnOrder.test(page) ) {
            setLibraryHTML(
               libraryUrlPattern, isbn,
               "On order!",
               "On order at " + libraryName,
               "#AA7700"  // dark yellow
//             "#ffffac"  //light yellow
               );
            foundCount++;
            getBookStatuses();
         } else if ( libraryElectronic.test(page) ) {
            setLibraryHTML(
               libraryUrlPattern, isbn,
               "On the e-shelf now!",
               "Digital version available now at "+ libraryName,
               "green" 
//             "#2bff81" //light green
               );
            foundCount++;
            getBookStatuses();
         } else {
            setLibraryHTML(
               libraryUrlPattern, isbn,
               "Error",
               "Error checking at "+ libraryName, 
               "orange"
               );
            foundCount++;
            getBookStatuses();
         }
      }
   }
   xhr.send();

}



function createStatusAndLibraryHTML() {
   var title_node = getTitleNode();
   var h1_node = title_node.parentNode;
   var br = document.createElement('br');

   //the div for library status when found
   var splLinkyDiv = document.createElement('div');
   splLinkyDiv.id = 'splLinkyLibraryHTML';
   //resize to 60% to get out of the enlarged h1 size and return back to normal
   splLinkyDiv.style.fontSize = '60%';
   splLinkyDiv.style.color = 'black';

   //How lame is this javascript DOM syntax?  Instead of having an insertAfter function, you have an insertBefore
   //and then pass in the .nextSibling attribute of the element.  Really inuitive guys.
   h1_node.insertBefore(splLinkyDiv, title_node.nextSibling);
   h1_node.insertBefore(br, title_node.nextSibling);

   //the div for status as checks are occuring
   var splStatusDiv = document.createElement('div');
   splStatusDiv.id = 'splLinkyStatusHTML';
   //resize to 60% to get out of the enlarged h1 size and return back to normal
   splStatusDiv.style.fontSize = '60%';
   splStatusDiv.style.color = 'brown';

   h1_node.insertBefore(splStatusDiv, splLinkyDiv);
// h1_node.insertBefore(br, title_node.nextSibling);

}


function updateStatusHTML(text) {
   var splStatusDiv = document.getElementById('splLinkyStatusHTML');
   if (splStatusDiv == null) { return; }

   if (splStatusDiv.firstChild){
      splStatusDiv.removeChild(splStatusDiv.firstChild);
   }
   splStatusDiv.appendChild(document.createTextNode(text));
}

//add status of book below previous ones
function setLibraryHTML(libraryUrlPattern, isbn, title, linktext, color) {
   var splLinkyDiv = document.getElementById('splLinkyLibraryHTML');
   if (splLinkyDiv == null) { return; }

   var link = document.createElement('a');
   link.setAttribute('title', title );
   link.setAttribute('href', libraryUrlPattern+isbn);
   link.setAttribute('target', "_blank");
   link.style.color = color;

   var label = document.createTextNode( linktext );
   link.appendChild(label);

   //append to existing content
   splLinkyDiv.appendChild(link);
   splLinkyDiv.appendChild(document.createElement('br'));
}

//none found
//add link to search by title
function setStatusNoneFound() {
   var title = getTitle();

   var splStatusDiv = document.getElementById('splLinkyStatusHTML');
   if (splStatusDiv == null) { return; }

   var link = document.createElement('a');
   link.setAttribute('title', title );
   link.setAttribute('href', libraryTitleUrlPattern +encodeURIComponent(title));
   link.setAttribute('target', "_blank");
   link.style.color = "red";

   var label = document.createTextNode('Not found. Search by title in ' + libraryName + '...' );
   link.appendChild(label);

   //remove existing content
   splStatusDiv.removeChild(splStatusDiv.firstChild);
   splStatusDiv.appendChild(link);
}

function setStatusColor(color){
   var splStatusDiv = document.getElementById('splLinkyStatusHTML');
   if (splStatusDiv == null) { return; }

   splStatusDiv.style.color = color;

}

function removeStatus(){
   var splStatusDiv = document.getElementById('splLinkyStatusHTML');
   splStatusDiv.removeChild(splStatusDiv.firstChild);
}


//check if there is a ISBN in the URL
//URL looks like http://www.amazon.com/Liseys-Story-Stephen-King/dp/0743289412/ref=xarw/002-5799652-4968811
function getIsbn(url){
   try { 
      //match if there is a / followed by a 7-9 digit number followed by either another number or an x 
      //followed by a / or end of url 
      var isbn = url.match(/\/(\d{7,9}[\d|X])(\/|$)/)[1]; 
   } catch (e) { return 0; }

   return isbn;
}

function getTitle(){
   var title = getTitleNode();
   if (title==null) { return null; }

   //remove words in parentheses and subtitles (anything after a colon)
   return title.textContent.replace(/\(.+\)/, '').replace(/:.*/, '')
}

// Find the node containing the book title
function getTitleNode()
{
   var titleNodeId = 'btAsinTitle';

   var nodes = document.evaluate("//span[@id='" + titleNodeId + "']", document, null, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null);
   if(!nodes){
      return null;
   }

   var thisNode = nodes.iterateNext(); 
   var titleNode;
   // Get the last node
   while(thisNode){
      //GM_log( thisNode.textContent );
      titleNode = thisNode;
      thisNode = nodes.iterateNext();
   }

   if (titleNode == null) {
        //GM_log("can't find title node");
        return null;
   } else {
       // GM_log("Found title node: " + titleNode.textContent);
   }
   return titleNode;
}


}
)();

