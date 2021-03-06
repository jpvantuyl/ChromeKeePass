/**

The MIT License (MIT)

Copyright (c) 2015 Steven Campbell.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

 */

"use strict";

function LocalStorage(settings, passwordFileStoreFactory) {
  var my = {
    saveDatabaseChoice: saveDatabaseChoice,
    getSavedDatabaseChoice: getSavedDatabaseChoice,
    saveCurrentDatabaseUsage: saveCurrentDatabaseUsage,
    getCurrentDatabaseUsage: getCurrentDatabaseUsage
  };

  var passwordFileStoreFactory = passwordFileStoreFactory;

  /**
   * Remembers the user's last choice of database
   */
  function saveDatabaseChoice(providerKey, fileInfo) {
    return settings.saveCurrentDatabaseChoice(fileInfo, providerKey).then(function() {
      return passwordFileStoreFactory.getInstance(providerKey, fileInfo);
    });
  }

  /**
   * Returns the saved password choice as a "fileStore", which exposes getFile() and title properties.
   */
  function getSavedDatabaseChoice() {
    return settings.getCurrentDatabaseChoice().then(function(items) {
      if (items.passwordFile && items.providerKey) {
        return passwordFileStoreFactory.getInstance(items.providerKey, items.passwordFile);
      } else {
        throw new Error('Could not find a saved password file choice');
      }
    });
  }

  /**
   * Saves information about how the database was opened, so we can optimize the
   * UI next time by hiding the irrelevant options and remembering the keyfile
   */
  function saveCurrentDatabaseUsage(usage) {
    return getSavedDatabaseChoice().then(function(fileStore) {
      return settings.getDatabaseUsages().then(function(usages) {
        var key = fileStore.title + "__" + fileStore.providerKey;
        usages[key] = usage;

        return settings.saveDatabaseUsages(usages);
      });
    });
  }

  /**
   * Retrieves information about how the database was opened, so we can optimize the
   * UI by hiding the irrelevant options and remembering the keyfile
   */
  function getCurrentDatabaseUsage() {
    return getSavedDatabaseChoice().then(function(fileStore) {
      return settings.getDatabaseUsages().then(function(usages) {
        var key = fileStore.title + "__" + fileStore.providerKey;
        var usage = usages[key] || {};

        return usage;
      });
    })
  }

  return my;
}
