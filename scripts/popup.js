document.addEventListener('DOMContentLoaded', function() {
  // on load show name of current game
  getAndAssignGameName();
  // show notification period
  showNotificationPeriod();
}, false);

function setGameName(gameName){
  if(gameName[0].result) {
    document.getElementById('gameNameToAdd').innerHTML = `Add "${gameName[0].result.trim()}" to list with max price:`;
  } else {
    document.getElementById('addGameArea').style.display = 'none';
  }
}

function getAndAssignGameName() {
  chrome.tabs.query({active: true}, function(tabs) {
      var tab = tabs[0];
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: getGameName
      }, setGameName);
    });
}

// show notification time
function showNotificationPeriod() {
  try{
    chrome.storage.sync.get(["notificationPeriod"], async (result) => {
      var notificationPeriodInMinutes = result["notificationPeriod"];
      if(!notificationPeriodInMinutes) {
        // just for first installation
        document.getElementById('notificationPeriodLabel').innerHTML = `Current notification period(in minutes): 180`;
      } else {
        document.getElementById('notificationPeriodLabel').innerHTML = `Current notification period(in minutes): ${notificationPeriodInMinutes}`;
      }

    })
  } catch(err) {

  }
}

function getGameName() {
  var name = document.querySelector("h1 span[data-itemprop=\'name\']").innerHTML;
  return name;
}
