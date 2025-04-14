document.addEventListener('DOMContentLoaded', function () {
    // Save backup
    document.querySelector('#createBackup').addEventListener('click', event => {
        chrome.storage.sync.get(["GamesList"], (result) => {
            const savedTable = result["GamesList"];
            if (savedTable && savedTable.length > 0) {
                chrome.storage.sync.set({ "GamesListBackup": savedTable }, function () {
                    console.log('Backup saved successfully.');
                    alert('Backup has been created successfully!');
                });
            } else {
                console.warn('No games found to back up.');
                alert('No games found to back up.');
            }
        });
    }, false);

    // Load backup
    document.querySelector('#loadBackup').addEventListener('click', event => {
        chrome.storage.sync.get(["GamesListBackup"], (result) => {
            const backupTable = result["GamesListBackup"];
            if (backupTable && backupTable.length > 0) {
                chrome.storage.sync.set({ "GamesList": backupTable }, function () {
                    console.log('Backup loaded successfully.');
                    alert('Backup has been restored successfully!');
                });
            } else {
                console.warn('No backup found to load.');
                alert('No backup found to load.');
            }
        });
    }, false);
});