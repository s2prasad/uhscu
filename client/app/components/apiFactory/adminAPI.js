(function() {
  'use strict';

  angular
    .module('app')
    .factory('adminAPI', adminAPI);

  adminAPI.$inject = ['$http'];

  function adminAPI($http) {

    return {
      getAllUsers: getAllUsers,
      getOneUser: getOneUser,
      deleteUser: deleteUser,
      updateUser:updateUser
    }

    function getAllUsers() {
      var url = '/api/admin/';
      return $http.get(url, {
        cache: true
      });
    }

    function getOneUser(id) {
      var url = '/api/users/' + id;
      return $http.get(url);
    }

    function deleteUser(user) {
      var url = '/api/users/' + user._id;
      return $http.delete(url);
    }

    function updateUser(user) {
      var url = '/api/admin/updateUser';
      var user = {user:user};
      return $http.post(url,user);
    }

  }
})();