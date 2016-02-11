(function() {
  'use strict';

  angular
    .module('app')
    .controller('ReceiverCtrl', ReceiverCtrl);

  ReceiverCtrl.$inject = ['$scope', 'Auth', '$modal', 'receiverAPI', '$alert', 'looksAPI'];

  function ReceiverCtrl($scope, Auth, $modal, receiverAPI, $alert, looksAPI) {

    $scope.looks = [];
    $scope.users = [];
    $scope.user = {};
    $scope.editLook = {};
    $scope.deleteBtn = true;

    var alertSuccess = $alert({
      title: 'Saved ',
      content: 'Look has been edited',
      placement: 'top-right',
      container: '#alertContainer',
      type: 'success',
      duration: 8
    });

    var alertFail = $alert({
      title: 'Not Saved ',
      content: 'Look has failed to edit',
      placement: 'top-right',
      container: '#alertContainer',
      type: 'warning',
      duration: 8
    });

    var myModal = $modal({
      scope: $scope,
      show: false
    });

    $scope.showModal = function() {
      myModal.$promise.then(myModal.show);
    }

    receiverAPI.getAllUsers()
      .then(function(data) {
        $scope.users = data.data;
      })
      .catch(function(err) {
        console.log('error getting users');
        console.log(err);
      });

    looksAPI.getAllLooks()
      .then(function(data) {
        console.log(data);
        $scope.looks = data.data;
      })
      .catch(function(err) {
        console.log('failed to get all looks');
      })

    $scope.deleteUser = function(user) {
      receiverAPI.deleteUser(user)
        .then(function(data) {
          console.log('deleted user');
          var index = $scope.users.indexOf(user);
          $scope.users.splice(index, 1);
        })
        .catch(function(err) {
          console.log('failed to delete user');
          console.log(err);
        });
    }

    $scope.editLook = function(look) {
      looksAPI.getUpdateLook(look)
        .then(function(data) {
          console.log(data);
          $scope.editLook = data.data;
        })
        .catch(function(err) {
          console.log('failed to edit look ' + err);
        });
    }

    $scope.saveLook = function() {
      var look = $scope.editLook;

      looksAPI.updateLook(look)
        .then(function(data) {
          console.log('Look updated');
          console.log(data);
          $scope.editLook.title = '';
          $scope.editLook.description = '';
          alertSuccess.show();
        })
        .catch(function(err) {
          console.log('failed to update' + err);
          alertFail.show();
        });
    }

    $scope.deleteLook = function(look) {
      looksAPI.deleteLook(look)
        .then(function(data) {
          var index = $scope.looks.indexOf(look);
          $scope.editLook.description = '';
          $scope.editLook.title = '';
          $scope.deleteBtn = false;
          alertSuccess.show();
          $scope.looks.splice(index, 1);
          console.log('success, look deleted');
        })
        .catch(function(err) {
          alertFail.show();
          console.log('failed to delete look' + err);
        });
    }

  }
})();