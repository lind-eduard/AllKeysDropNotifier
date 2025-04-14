document.addEventListener('DOMContentLoaded', function() {
    let gameIdString;
    let gameId;

    // add new game to list
    const addGameButton = document.getElementById('addGameAlert');
    addGameButton.addEventListener('click',async function() { 
        var highestPrice = document.getElementById('lowestPriceInput').value;
        console.log(document.getElementById('gameNameToAdd').innerHTML)
        var gameLabel = (document.getElementById('gameNameToAdd').innerHTML).match('\"(.*?)\"');
        var gameName = gameLabel[1].trim();
        document.getElementById('lowestPriceInput').value = "";
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          var gameLink = tabs[0].url;
          chrome.tabs.sendMessage(tabs[0].id, {message: "get_id_string_and_link"}, function(response) {
            gameIdString = response.match('"([^;]*)"');
            gameId = gameIdString[1];
            saveGame(gameId, gameName, highestPrice, gameLink);
          });
        });
    });

    const savedGamesList = document.getElementById('collapseOne');
    // show saved game
    savedGamesList.addEventListener('show.bs.collapse', function () {
      chrome.storage.sync.get(["GamesList"], async (result) => {
        var savedTable = result["GamesList"];
        if(savedTable) {
          await showSavedTable(savedTable);
        }
      });
    }, false);
    // cleanup table after collapsing
    savedGamesList.addEventListener('hide.bs.collapse', function () {
      document.getElementById("savedGamesTableBody").innerHTML ="";
    }, false);

    // clear list of games
    const clearButton = document.getElementById('clearList');
    clearButton.addEventListener('click', function() { 
      chrome.storage.sync.set({ "GamesList": [] }, function(){
        console.log('table reset');
      });
    }, false); 

    // delete single game from list
    document.getElementById('savedGamesTableBody').addEventListener('click', event => {
        var target = event.target;
        if (target.tagName.toLowerCase() === 'img') {
          var cellOfButton = event.target.parentNode;
          var position = cellOfButton.parentNode.rowIndex
          deleteGameFromTableOnPosition(position);
        }
    }, false);

    // download game list
    document.getElementById('saveList').addEventListener('click', () => {
      chrome.storage.sync.get(["GamesList"], async (result) => {
        var savedTable = JSON.stringify(result["GamesList"]);
        var url = 'data:application/json;base64,' + btoa(unescape(encodeURIComponent(savedTable)));
          chrome.downloads.download({
            url: url,
            filename: 'games_list_data.json'
          });
      });
    }, false);

    // upload game list
    document.getElementById('uploadList').addEventListener('change', event => {
      var file = event.target.files[0];
      var reader = new FileReader()
      reader.readAsText(file);
      reader.onload = function(e) {
        const uploadedTable = JSON.parse(e.target.result);
        console.log(uploadedTable);
        chrome.storage.sync.get(["GamesList"], (result) => {
          var savedTable = result["GamesList"];
          if(!savedTable) {
            savedTable = [];
          }
          for(let i=0; i < uploadedTable.length; i++) {
            savedTable.push({"id": `${uploadedTable[i].id}`, "name": `${uploadedTable[i].name}`, "price": `${uploadedTable[i].price}`, "link": `${uploadedTable[i].link}`, "notificationEnabled": uploadedTable[i].notificationEnabled});
          }
          chrome.storage.sync.set({ "GamesList": savedTable }, function(){
            console.log('table saved');
        });
      });
      }
      reader.onerror = function(error) {
        console.log("error", error)
        console.log (error.getMessage())
      }
    }, false);
    
  }, false);

function getAmountOfSavedGames( savedGames ) {
    return Object.keys(savedGames).length;
}

function refreshGameList() {
    chrome.storage.sync.get(["GamesList"], async (result) => {
        var savedTable = result["GamesList"];
        if(savedTable) {
          await showSavedTable(savedTable);
        }
    });
}

function deleteGameFromTableOnPosition(position){
    chrome.storage.sync.get(["GamesList"], (result) => {
        var savedTable = result["GamesList"];
        savedTable.splice(position - 1 , 1);
        chrome.storage.sync.set({ "GamesList": savedTable }, function(){
          console.log('table saved');
        });
        refreshGameList();
    });
}

function saveGame(gameId, gameName, highestPrice, gameLink) {
    chrome.storage.sync.get(["GamesList"], (result) => {
        var savedTable = result["GamesList"];
        if(!savedTable) {
          savedTable = [];
        }
        savedTable.push({"id": `${gameId}`, "name": `${gameName}`, "price": `${highestPrice}`, "link": `${gameLink}`, "notificationEnabled": true});
        chrome.storage.sync.set({ "GamesList": savedTable }, function(){
          console.log('table saved');
      });
    });
}

async function showSavedTable(savedTable) {
    const spinner = document.getElementById('loadingSpinner');
    const tableContainer = document.getElementById('tableContainer');
    spinner.style.display = 'block'; // Show spinner
    tableContainer.style.display = 'none'; // Hide table

    var table = document.getElementById('savedGamesTableBody');
    table.innerHTML = "";
    for(let string=0; string < getAmountOfSavedGames(savedTable); string++) {
      const oneGameObject = savedTable[string];
      var gameID = oneGameObject.id;
      tr = table.insertRow(-1);
      tr.setAttribute('id', 'gameRow');
      for(let column=1; column < 5; column++) {
        switch(column) {
            case 1:
            {
                var td = document.createElement('td');
                td = tr.insertCell(-1);
                td.innerHTML = `<a href="${oneGameObject.link}">${oneGameObject.name}</a>`;
                break; 
            }
            case 2:
            {
                var td = document.createElement('td');
                td = tr.insertCell(-1);
                td.innerHTML = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(oneGameObject.price);
                break; 
            }
            case 3:
            {
                var td = document.createElement('td');
                td = tr.insertCell(-1);
                await fetch(`https://www.allkeyshop.com/blog/wp-admin/admin-ajax.php?action=get_offers&product=${gameID}&currency=eur&region=&moreq=&use_beta_offers_display=1`)
                  .then(response => response.json())
                  .then(data => {
                    for(let i=0; i< data.offers.length; i++) {
                      if(!["412", "259", "25"].includes(data.offers[i].region)) {
                        var currentPrice = data.offers[i].price.eur.priceWithoutCoupon;
                        if(parseFloat(currentPrice) < oneGameObject.price) {
                          td.style.color = "green";
                        } else {
                          td.style.color = "red";
                        }
                        td.innerHTML = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(currentPrice);
                        return;
                      }
                    }
                  }).catch(err => {
                    console.log(err);
                    td.innerHTML = '-';
                  });
                break;
            }
            case 4:
            {
                var td = document.createElement('td');
                td = tr.insertCell(-1);
                td.innerHTML = '<img src="close.png" alt="delete" width="20" height="20">';
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
    spinner.style.display = 'none'; // Hide spinner
    tableContainer.style.display = 'block'; // Show table
}