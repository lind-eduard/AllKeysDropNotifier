document.addEventListener('DOMContentLoaded', function() {
   // on load show name of current game
  getAndAssignGameName();
  let gameIdString;
  let gameId;
  
  const addGameButton = document.getElementById('addGameAlert');
  addGameButton.addEventListener('click', function() { 
      var highestPrice = document.getElementById('lowestPriceInput').value;
      var gameName = (document.getElementById('gameNameToAdd').innerHTML).trim();
      document.getElementById('lowestPriceInput').value = "";
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {message: "get_id_string"}, function(response) {
          gameIdString = response.match('"([^;]*)"');
          gameId = gameIdString[1];
          saveGame(gameId, gameName, highestPrice);
        });
      });
  }, false);

  const savedGamesList = document.getElementById('listOfSavedGames');
  savedGamesList.addEventListener('click', function() {
    if(savedGamesList.hasAttribute("open")){
      var table = document.getElementById('savedGamesTable');
      chrome.storage.sync.get(["GamesList"], (result) => {
        var savedTable = result["GamesList"];
        if(savedTable) {
          for(let string=0; string < getAmountOfSavedGames(savedTable); string++) {
            const oneGameObject = JSON.parse(Object.values(savedTable)[string]);
            tr = table.insertRow(-1);
            for(let column=0; column < 3; column++) {
              var td = document.createElement('td');
                  td = tr.insertCell(-1);
                  td.innerHTML = Object.values(oneGameObject)[column]; 
            }
          }
        }
      });
    } else {
      // delete table on close
    }
	
  }, false);
  
  const clearButton = document.getElementById('clearList');
  clearButton.addEventListener('click', function() { 
    chrome.storage.sync.set({ "GamesList": [] }, function(){
      console.log('table reset');
    });
  }, false);

}, false);

function setGameName(gameName){
  document.getElementById('gameNameToAdd').innerHTML = gameName[0].result;
}

async function saveGame(gameId, gameName, highestPrice) {
  chrome.storage.sync.get(["GamesList"], (result) => {
      var savedTable = result["GamesList"];
      if(!savedTable) {
        savedTable = [];
      }
      savedTable.push(`{"id": "${gameId}", "name": "${gameName}", "price": "${highestPrice}"}`);
      chrome.storage.sync.set({ "GamesList": savedTable }, function(){
        console.log('table saved');
    });
  });
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

function getGameName() {
  var name = document.querySelector("h1 span[data-itemprop=\'name\']").innerHTML;
  return name;
}

function getAmountOfSavedGames( savedGames ) {
  return Object.keys(savedGames).length;
}
