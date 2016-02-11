(function() {
  'use strict';

  angular
    .module('app')
    .config(config);

  config.$inject = ['$stateProvider'];

  function config($stateProvider) {
    $stateProvider
      .state('transporter', {
        url: '/transporter',
        templateUrl: 'app/transporter/transporter.html',
        controller: 'TransporterCtrl',
        authenticate: true
      });
  }

})();