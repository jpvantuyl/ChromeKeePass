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

var keepassSettings = angular.module('keepassSettings', ['ngAnimate', 'ngRoute', 'jsonFormatter']);

keepassSettings.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/startup', {
    templateUrl: chrome.extension.getURL('/options/partials/startup.html'),
    controller: 'startupController'
  }).when('/storedData', {
    templateUrl: chrome.extension.getURL('/options/partials/storedData.html'),
    controller: 'storedDataController'
  }).when('/keyFiles', {
    templateUrl: chrome.extension.getURL('/options/partials/manageKeyFiles.html'),
    controller: 'manageKeyFilesController'
  }).when('/advanced', {
    templateUrl: chrome.extension.getURL('/options/partials/advanced.html'),
    controller: 'advancedController'
  }).otherwise({
    redirectTo: '/startup'
  });
}]);

keepassSettings.factory('settings', [function() {
  return new Settings();
}]);

keepassSettings.factory('keyFileParser', [function() {
  return new KeyFileParser();
}]);

keepassSettings.factory('protectedMemory', [function() {
  return new ProtectedMemory();
}]);

keepassSettings.factory('secureCacheMemory', ['protectedMemory', function(protectedMemory) {
  return new SecureCacheMemory(protectedMemory);
}])

keepassSettings.factory('secureCacheDisk', ['protectedMemory', 'secureCacheMemory', 'settings', function(protectedMemory, secureCacheMemory, settings) {
  return new SecureCacheDisk(protectedMemory, secureCacheMemory, settings);
}])


keepassSettings.controller('startupController', ['$scope', '$location', StartupController]);
keepassSettings.controller('storedDataController', ['$scope', '$http', StoredDataController]);
keepassSettings.controller('manageKeyFilesController', ['$scope', '$http', 'settings', 'keyFileParser', ManageKeyFilesController]);
keepassSettings.controller('advancedController', ['$scope', 'settings', 'secureCacheDisk', AdvancedController]);

keepassSettings.directive('icon', function() {
  function link(scope, element, attrs) {
    function renderSVG() {
      var icon = element.scope()[attrs.p]; //evaluate as scope expression
      if (!icon)
        icon = attrs.p;
      var html = '<svg class="icon ' + icon + '"><use xlink:href="#' + icon + '"></use></svg>';
      element.replaceWith(html);
    }

    renderSVG();
  }

  return {
    link: link,
    restrict: 'E'
  };
});

//quick and dirty directive for file upload, based on answers from
// http://stackoverflow.com/questions/17922557/angularjs-how-to-check-for-changes-in-file-input-fields
keepassSettings.directive('fileChange', function() {
  return {
    restrict: "A",
    link: function (scope, element, attrs) {
      var onChangeFunc = element.scope()[attrs.fileChange];
      element.bind('change', function(e) {
        var files = e.target.files;
        var loadedFiles = [];
        for (var i = 0, f; f = files[i]; i++) {
          // Read the File objects in this FileList.
          var loadedFile = new Promise(function(resolve, reject) {
            var reader = new FileReader();

            reader.onloadend = (function(theFile) {
              return function(e) {
                resolve({data: e.target.result, file: theFile});
              };
            })(f);

            reader.onerror = reader.onabort = (function(theFile) {
              return function(e) {
                reject(new Error("File upload failed"));
              };
            })(f);

            reader.readAsArrayBuffer(f);
          });

          loadedFiles.push(loadedFile);
        }

        onChangeFunc(loadedFiles);
      });
    }
  };
});
