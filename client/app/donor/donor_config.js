(function() {
  'use strict';

  angular
    .module('app')
    .config(config);

  config.$inject = ['$stateProvider'];

  function config($stateProvider) {
    $stateProvider
      .state('donor', {
        url: '/donor',
        templateUrl: 'app/donor/donor.html',
        controller: 'DonorCtrl',
        authenticate: true
      });
  }

})();