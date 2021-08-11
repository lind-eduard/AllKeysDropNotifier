
 chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
   if(request.message ==="get_id_string_and_link") {
     getIdString().then((sendResponse));
   }
   return true; // return true to indicate you want to send a response asynchronously
 });
 
 async function getIdString() {
      var idString = document.querySelector(".footer + script").innerHTML;
      return idString;
 }
