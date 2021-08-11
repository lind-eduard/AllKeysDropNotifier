var gameLink;
var myNotificationID;

chrome.runtime.onStartup.addListener(function() {
    
    chrome.storage.sync.get(["GamesList"], async (result) => {
        var savedTable = result["GamesList"];
        if(!savedTable) {
          return;
        }
        for(let string=0; string < getAmountOfSavedGames(savedTable); string++) {
            const oneGameObject = JSON.parse(Object.values(savedTable)[string]);
            var gameID = Object.values(oneGameObject)[0];
            var gameName = Object.values(oneGameObject)[1];
            gameLink = Object.values(oneGameObject)[3];
            await fetch(`https://www.allkeyshop.com/blog/wp-admin/admin-ajax.php?action=get_offers&product=${gameID}&currency=eur&region=&moreq=&use_beta_offers_display=1`)
            .then(response => response.json())
            .then(data => {
              var currentPrice = data.offers[0].price.eur.price;
              var expectedPrice = parseFloat(Object.values(oneGameObject)[2]);
              if(parseFloat(currentPrice) <= expectedPrice) {
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
})

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