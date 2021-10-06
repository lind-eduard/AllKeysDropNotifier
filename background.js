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

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
  console.log('load event received')
  if(request.message ==="page_loaded") {
    // gameList.js function
    getAndAssignGameName();
  }
  return true;
});

chrome.notifications.onButtonClicked.addListener(function(notifId, btnIdx) {
  if (notifId === myNotificationID) {
      if (btnIdx === 0) {
        chrome.tabs.create({url:gameLink}, function(tab){
          chrome.windows.update(tab.windowId, {focused: true});
        });
      }
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
            chrome.notifications.create('', {
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
            }, function(id) {
              myNotificationID = id;
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