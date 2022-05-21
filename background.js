var gameLink;
var myNotificationID;

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
  console.log('ID: ', gameIdFromNotification)
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
        await fetch(`https://www.allkeyshop.com/blog/wp-admin/admin-ajax.php?action=get_offers&product=${gameID}&currency=eur&region=&moreq=&use_beta_offers_display=1`)
        .then(response => response.json())
        .then(data => {
          var currentPrice = data.offers[0].price.eur.price;
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

chrome.webNavigation.onCommitted.addListener((details) => {
  if (["reload", "link", "typed", "generated"].includes(details.transitionType)) {
      console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
  }
});