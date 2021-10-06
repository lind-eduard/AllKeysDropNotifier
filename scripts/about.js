document.addEventListener('DOMContentLoaded', function() {
    // save backup
    document.querySelector('#createBackup').addEventListener('click', event => {
        chrome.storage.sync.get(["GamesList"], async (result) => {
            var savedTable = result["GamesList"];
            chrome.storage.sync.set({ "GamesListBackup": savedTable }, function(){
                console.log('backup saved');
            });
          });
    }, false);

    // load backup
    document.querySelector('#loadBackup').addEventListener('click', event => {
        chrome.storage.sync.get(["GamesListBackup"], async (result) => {
            var savedTable = result["GamesListBackup"];
            if(savedTable && savedTable!==[]){
                chrome.storage.sync.set({ "GamesList": savedTable }, function(){
                    console.log('table saved');
                });
            }
            console.log('Backup loaded');           
        });
    }, false);

}, false);