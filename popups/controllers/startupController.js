"use strict";

function StartupController($scope, $http, $location, gdocs, localStorage) {

  localStorage.getSavedDatabaseChoice().then(function(fileStore) {
    $location.path('/enter-password/' + fileStore.title);
  }).catch(function(err) {
    $location.path('/choose-file-type');
  }).then(function() {
    $scope.$apply();
  });

}
