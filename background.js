var gameLink;
import { fetchPricesFromPage } from './scripts/parser.js';

chrome.runtime.onStartup.addListener(function() {
  checkGamesAndSendNotification();
  chrome.storage.sync.get(["notificationPeriod"], async (result) => {
    var notificationPeriodInMinutes = result["notificationPeriod"];
    if(!notificationPeriodInMinutes) {
      notificationPeriodInMinutes = 180.0;
      chrome.storage.sync.set({ "notificationPeriod": 180.0 }, function(){
        console.log('table saved');
      });
    }
  });
  chrome.alarms.create("gameCheckAlarm", {delayInMinutes: parseFloat(notificationPeriodInMinutes), periodInMinutes: notificationPeriodInMinutes});
});

chrome.alarms.onAlarm.addListener(function(){
  checkGamesAndSendNotification();
});

chrome.notifications.onButtonClicked.addListener(function(notifId, btnIdx) {
  const gameIdFromNotification = notifId.slice(0, notifId.indexOf('_'));
  if (btnIdx === 0) {
      chrome.storage.sync.get(["GamesList"], async (result) => {
        var savedTable = result["GamesList"];
        for(let string=0; string < getAmountOfSavedGames(savedTable); string++) {
          const oneGameObject = savedTable[string];
          if (gameIdFromNotification === oneGameObject.id) {
            chrome.tabs.create({url:oneGameObject.link}, function(tab){
                chrome.windows.update(tab.windowId, {focused: true});
            });
            return;
          }
        }
      });
    }
});

function getAmountOfSavedGames( savedGames ) {
    return Object.keys(savedGames).length;
  }

function checkGamesAndSendNotification() {
  chrome.storage.sync.get(["GamesList"], async (result) => {
    var savedTable = result["GamesList"];
    if(!savedTable) {
      return;
    }
    for(let string=0; string < getAmountOfSavedGames(savedTable); string++) {
        const timestamp = Date.now();
        const oneGameObject = savedTable[string];
        var gameID = oneGameObject.id;
        var gameName = oneGameObject.name;
        gameLink = oneGameObject.link;
        await fetchPricesFromPage(gameLink)
        .then(data => {
          for(let i=0; i< data.length; i++) {
            if(!["412", "259", "25"].includes(data[i].region) && !data[i].account && data[i].priceCard > 1) {
              var currentPrice = data[i].priceCard;
            }
          }
          var expectedPrice = parseFloat(oneGameObject.price);
              if(parseFloat(currentPrice) <= expectedPrice && oneGameObject.notificationEnabled) {
              chrome.notifications.create(gameID + `_${timestamp}`, {
                title: 'Price just droped for game:',
                message: `${gameName}`,
                iconUrl: '/icon.png',
                type: 'basic',
                buttons: [
                  {
                      title: 'Open'
                  },
                  {
                      title: 'Close'
                  }
              ]
              });
              }
        });
    }
});
}