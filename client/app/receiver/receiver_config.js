(function() {
  'use strict';

  angular
    .module('app')
    .config(config);

  config.$inject = ['$stateProvider'];

  function config($stateProvider) {
    $stateProvider
      .state('receiver', {
        url: '/receiver',
        templateUrl: 'app/receiver/receiver.html',
        controller: 'ReceiverCtrl',
        authenticate: true
      });
  }

})();