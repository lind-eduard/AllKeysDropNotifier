document.addEventListener('DOMContentLoaded', function() {
   // on load show name of current game
  getAndAssignGameName();
  let gameIdString;
  let gameId;
  
  const checkPageButton = document.getElementById('addGameAlert');
  checkPageButton.addEventListener('click', function() { 
      var highestPrice = document.getElementById('lowestPriceInput').value;
      var gameName = document.getElementById('gameNameToAdd').innerHTML;
      document.getElementById('lowestPrice').innerHTML = highestPrice + ' euro';
      document.getElementById('gameName').innerHTML = document.getElementById('gameNameToAdd').innerHTML;
      document.getElementById('lowestPriceInput').value = "";
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {message: "get_id_string"}, function(response) {
          gameIdString = response.match('"([^;]*)"');
          gameId = gameIdString[1];
          saveGame(gameId, gameName, highestPrice);
        });
      });
  }, false);
  }, false);

function setGameName(gameName){
  document.getElementById('gameNameToAdd').innerHTML = gameName
}

async function saveGame(gameId, gameName, highestPrice) {
  chrome.storage.local.get(["GamesList"], (result) => {
      var savedTable = result["GamesList"];
      savedTable.push(`{id: "${gameId}", name: "${gameName}", price: "${highestPrice}"}`);
      chrome.storage.sync.set({ "GamesList": savedTable }, function(){
        console.log('table saved');
        alert(savedTable);
    });
    });
  }

function getAndAssignGameName() {
  chrome.tabs.query({active: true}, function(tabs) {
      var tab = tabs[0];
      chrome.tabs.executeScript(tab.id, {
        code: 'document.querySelector("h1 span[data-itemprop=\'name\']").innerHTML'
      }, setGameName);
    });
}
