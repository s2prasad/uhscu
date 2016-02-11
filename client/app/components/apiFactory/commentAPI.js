(function() {
  'use strict';

  angular
    .module('app')
    .factory('commentAPI', commentAPI);

    commentAPI.$inject = ['$http', '$stateParams'];

    function commentAPI($http, $stateParams) {
      return ({
        addComment: addComment,
        getComments: getComments
      });

      function addComment(comment) {
        return $http.post('/api/comments', comment);
      }

      function getComments(id) {
        return $http.get('/api/comments/' + id, {
          cache: true
        });
      }

    }
})();