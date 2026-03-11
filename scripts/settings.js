document.addEventListener('DOMContentLoaded', function() {
  
  // set new notification time
  const addNotificationPeriodButton = document.getElementById('addNotificationPeriod');
  addNotificationPeriodButton.addEventListener('click', function() {
    var newNotificationPeriod = document.getElementById('notificationPeriodInput').value;
    chrome.storage.sync.set({ "notificationPeriod": parseFloat(newNotificationPeriod) }, async function(){
      showNotificationPeriod();
      chrome.alarms.clear("gameCheckAlarm");
      chrome.storage.sync.get(["autoCheckEnabled"], async (result) => {
        const autoCheckEnabled = result["autoCheckEnabled"];
        if (autoCheckEnabled !== false) {
          await chrome.alarms.create("gameCheckAlarm", {delayInMinutes: parseFloat(newNotificationPeriod), periodInMinutes: parseFloat(newNotificationPeriod)});
        }
      });
    });
  }, false);

    // show settings list
    const settingsList = document.getElementById('collapseSettings');
    settingsList.addEventListener('show.bs.collapse', function () {
      chrome.storage.sync.get(["GamesList"], async (result) => {
        var savedTable = result["GamesList"];
        if(savedTable) {
          await showSettingsTable(savedTable);
        }
      });
    }, false);  

    // cleanup table after collapsing
    settingsList.addEventListener('hide.bs.collapse', function () {
      document.getElementById("settingsTableBody").innerHTML ="";
    }, false);

    // disable notification for game
    document.querySelector('#settingsTableBody').addEventListener('click', event => {
      var target = event.target;
      if (target.tagName.toLowerCase() === 'input') {
        var cellOfButton = event.target.parentNode;
        var position = cellOfButton.parentNode.parentNode.rowIndex;
        setNotificationStatusForGameOnPosition(position, target.checked);
      }
  }, false);

  // enable all notifications
  const enableAllNotificationsButton = document.getElementById('enableAllNotifications');
  enableAllNotificationsButton.addEventListener('click', function() {
    chrome.storage.sync.get(["GamesList"], (result) => {
      var savedTable = result["GamesList"];
      for(let i=0; i < getAmountOfSavedGames(savedTable); i++) {
        savedTable[i].notificationEnabled = true;
      }
      chrome.storage.sync.set({ "GamesList": savedTable }, function(){
        console.log('table saved');
      });
      refreshSettingsList();
    });
  }, false);

  // disable all notifications
  const disableAllNotificationsButton = document.getElementById('disableAllNotifications');
  disableAllNotificationsButton.addEventListener('click', function() {
    chrome.storage.sync.get(["GamesList"], (result) => {
      var savedTable = result["GamesList"];
      for(let i=0; i < getAmountOfSavedGames(savedTable); i++) {
        savedTable[i].notificationEnabled = false;
      }
      chrome.storage.sync.set({ "GamesList": savedTable }, function(){
        console.log('table saved');
      });
      refreshSettingsList();
    });
  }, false);

  // load settings on page load
  loadSettings();

}, false);

function loadSettings() {
  chrome.storage.sync.get(["autoCheckEnabled"], (result) => {
    const autoCheckEnabled = result["autoCheckEnabled"];
    const checkbox = document.getElementById('autoCheckEnabled');
    if (autoCheckEnabled === false) {
      checkbox.checked = false;
    } else {
      checkbox.checked = true;
    }
    checkbox.addEventListener('change', function() {
      chrome.storage.sync.set({ "autoCheckEnabled": checkbox.checked }, function(){
        console.log('auto check setting saved');
        if (checkbox.checked) {
          chrome.storage.sync.get(["notificationPeriod"], async (result) => {
            var notificationPeriodInMinutes = result["notificationPeriod"];
            if(!notificationPeriodInMinutes) {
              notificationPeriodInMinutes = 180.0;
            }
            chrome.alarms.clear("gameCheckAlarm");
            await chrome.alarms.create("gameCheckAlarm", {delayInMinutes: parseFloat(notificationPeriodInMinutes), periodInMinutes: parseFloat(notificationPeriodInMinutes)});
          });
        } else {
          chrome.alarms.clear("gameCheckAlarm");
        }
      });
    });
  });
  showNotificationPeriod();
}

function setNotificationStatusForGameOnPosition(position, status){
  chrome.storage.sync.get(["GamesList"], (result) => {
      var savedTable = result["GamesList"];
      savedTable[position].notificationEnabled = status;
      chrome.storage.sync.set({ "GamesList": savedTable }, function(){
        console.log('table saved');
      });
  });
}

async function showSettingsTable(savedTable) {
    var table = document.getElementById('settingsTableBody');
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

function refreshSettingsList() {
    document.getElementById("settingsTableBody").innerHTML = "";
    chrome.storage.sync.get(["GamesList"], async (result) => {
        var savedTable = result["GamesList"];
        if(savedTable) {
          await showSettingsTable(savedTable);
        }
    });
}

function loadSettings() {
  chrome.storage.sync.get(["autoCheckEnabled"], (result) => {
    const autoCheckEnabled = result["autoCheckEnabled"];
    const checkbox = document.getElementById('autoCheckEnabled');
    if (autoCheckEnabled === false) {
      checkbox.checked = false;
    } else {
      checkbox.checked = true;
    }
    checkbox.addEventListener('change', function() {
      chrome.storage.sync.set({ "autoCheckEnabled": checkbox.checked }, function(){
        console.log('auto check setting saved');
        if (checkbox.checked) {
          chrome.storage.sync.get(["notificationPeriod"], async (result) => {
            var notificationPeriodInMinutes = result["notificationPeriod"];
            if(!notificationPeriodInMinutes) {
              notificationPeriodInMinutes = 180.0;
            }
            chrome.alarms.clear("gameCheckAlarm");
            await chrome.alarms.create("gameCheckAlarm", {delayInMinutes: parseFloat(notificationPeriodInMinutes), periodInMinutes: parseFloat(notificationPeriodInMinutes)});
          });
        } else {
          chrome.alarms.clear("gameCheckAlarm");
        }
      });
    });
  });
  showNotificationPeriod();
}