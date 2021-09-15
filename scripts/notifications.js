document.addEventListener('DOMContentLoaded', function() {
  // set new notification time
  const addNotificationPeriodButton = document.getElementById('addNotificationPeriod');
  addNotificationPeriodButton.addEventListener('click', function() {
    var newNotificationPeriod = document.getElementById('notificationPeriodInput').value;
    chrome.storage.sync.set({ "notificationPeriod": parseFloat(newNotificationPeriod) }, async function(){
      showNotificationPeriod();
      chrome.alarms.clear("gameCheckAlarm");
      await chrome.alarms.create("gameCheckAlarm", {delayInMinutes: parseFloat(newNotificationPeriod), periodInMinutes: parseFloat(newNotificationPeriod)});
    });
  }, false);

    // show notification list
    const notificationsList = document.getElementById('collapseNotifications');
    notificationsList.addEventListener('show.bs.collapse', function () {
      chrome.storage.sync.get(["GamesList"], async (result) => {
        var savedTable = result["GamesList"];
        if(savedTable) {
          await showNotificationsTable(savedTable);
        }
      });
    }, false);  
    // cleanup table after collapsing
    notificationsList.addEventListener('hide.bs.collapse', function () {
      document.getElementById("notificationsTableBody").innerHTML ="";
    }, false);

    // disable notification for game
    document.querySelector('#notificationsTableBody').addEventListener('click', event => {
      var target = event.target;
      if (target.tagName.toLowerCase() === 'input') {
        var cellOfButton = event.target.parentNode;
        var position = cellOfButton.parentNode.parentNode.rowIndex;
        console.log(target.checked);
        setNotificationStatusForGameOnPosition(position, target.checked);
      }
  }, false);

}, false);

function setNotificationStatusForGameOnPosition(position, status){
  chrome.storage.sync.get(["GamesList"], (result) => {
      var savedTable = result["GamesList"];
      console.log(status);
      savedTable[position].notificationEnabled = status;
      chrome.storage.sync.set({ "GamesList": savedTable }, function(){
        console.log('table saved');
      });
  });
}

async function showNotificationsTable(savedTable) {
    var table = document.getElementById('notificationsTableBody');
    for(let string=0; string < getAmountOfSavedGames(savedTable); string++) {
      const oneGameObject = savedTable[string];
      tr = table.insertRow(-1);
      tr.setAttribute('id', 'gameRow');
      for(let column=1; column < 3; column++) {
        switch(column) {
            case 1:
            {
                var td = document.createElement('td');
                td = tr.insertCell(-1);
                td.innerHTML = `${oneGameObject.name}`;
                break; 
            }
            case 2:
                {
                var notificationEnable = oneGameObject.notificationEnabled;   
                var td = document.createElement('td');
                td = tr.insertCell(-1);
                if(notificationEnable == null || notificationEnable){
                    td.innerHTML = '<div class="form-switch"><input type="checkbox" class="form-check-input" checked id="notificationSwitch"></div>';
                } else {
                    td.innerHTML = '<div class="form-switch"><input type="checkbox" class="form-check-input" id="notificationSwitch"></div>';
                }
                break; 
            }
            default:
            {
                console.log('something went wrong....')
            }
        } 
      }
    }
  }