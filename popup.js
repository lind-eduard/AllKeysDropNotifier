document.addEventListener('DOMContentLoaded', function() {
   // on load show name of current game
  getAndAssignGameName();
  let gameIdString;
  let gameId;
  
  // add new game to list
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

  // show list of games
  const savedGamesList = document.getElementById('listOfSavedGames');
  savedGamesList.addEventListener('toggle', function() {
    // show games
    if (savedGamesList.open) {
      chrome.storage.sync.get(["GamesList"], async (result) => {
        var savedTable = result["GamesList"];
        if(savedTable) {
          await showSavedTable(savedTable);
        }
      });
    }
    if(!savedGamesList.open) {
      document.getElementById("savedGamesTableBody").innerHTML ="";
    }
  }, false);

  // clear list of games
  const clearButton = document.getElementById('clearList');
  clearButton.addEventListener('click', function() { 
    chrome.storage.sync.set({ "GamesList": [] }, function(){
      console.log('table reset');
    });
  }, false);

  // delete single game from list
  document.querySelector('#savedGamesTableBody').addEventListener('click', async event => {
      var target = event.target;
      if (target.tagName.toLowerCase() === 'button') {
        var cellOfButton = event.target.parentNode;
        var position = cellOfButton.parentNode.rowIndex
        deleteGameFromTableOnPosition(position);
      }
    })

  }, false);


function deleteGameFromTableOnPosition(position){
    chrome.storage.sync.get(["GamesList"], async (result) => {
      var savedTable = result["GamesList"];
      savedTable.splice(position - 1 , 1);
      chrome.storage.sync.set({ "GamesList": savedTable }, function(){
        console.log('table saved');
    });
    document.getElementById("savedGamesTableBody").innerHTML ="";
    await showSavedTable(savedTable);
  });
}


function setGameName(gameName){
  document.getElementById('gameNameToAdd').innerHTML = `Add "${gameName[0].result}" to list with max price:`;
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

async function showSavedTable(savedTable) {
  var table = document.getElementById('savedGamesTableBody');
  for(let string=0; string < getAmountOfSavedGames(savedTable); string++) {
    const oneGameObject = JSON.parse(Object.values(savedTable)[string]);
    var gameID = Object.values(oneGameObject)[0];
    tr = table.insertRow(-1);
    tr.setAttribute('id', 'gameRow');
    for(let column=0; column < 5; column++) {
      switch(column) {
        case 3:
        {
          var td = document.createElement('td');
          td = tr.insertCell(-1);
          await fetch(`https://www.allkeyshop.com/blog/wp-admin/admin-ajax.php?action=get_offers&product=${gameID}&currency=eur&region=&moreq=&use_beta_offers_display=1`)
            .then(response => response.json())
            .then(data => {
              const currentPrice = data.offers[0].price.eur.price;
              td.innerHTML = currentPrice;
            });
          break;
        }
        case 4:
        {
          var td = document.createElement('td');
          td = tr.insertCell(-1);
          td.innerHTML = '<button class="small red button">Delete</button>';
          break; 
        }
        default:
        {
          var td = document.createElement('td');
          td = tr.insertCell(-1);
          td.innerHTML = Object.values(oneGameObject)[column];
          break; 
        }
      } 
    }
  }
}
