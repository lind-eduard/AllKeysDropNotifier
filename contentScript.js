
 chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
   getIdString(request).then((sendResponse));
   return true; // return true to indicate you want to send a response asynchronously
 });
 
 async function getIdString(request) {
      var idString = document.querySelector(".footer + script").innerHTML;
      return idString;
 }
