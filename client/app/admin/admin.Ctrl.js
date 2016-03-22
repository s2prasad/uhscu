(function() {
  'use strict';

  angular
    .module('app')
    .controller('AdminCtrl', AdminCtrl);
	
  // angular
    // .module('app')
    // .filter('myStrictFilter', function($filter){
    // return function(input, predicate){
        // return $filter('filter')(input, predicate, true);
    // }
  // });
	
  angular
    .module('app')
    .filter('unique', function() {
    return function (arr, field) {
		
		if(arr!=undefined && arr!=null){
        var o = {}, i, l = arr.length, r = [];
        for(i=0; i<l;i+=1) {
            o[arr[i][field]] = arr[i];
        }
        for(i in o) {
            r.push(o[i]);
        }
        return r;
		}
    };
  });

	
  AdminCtrl.$inject = ['$scope', 'Auth', '$modal', 'adminAPI', '$alert', 'looksAPI','$filter','$http'];

  function AdminCtrl($scope, Auth, $modal, adminAPI, $alert, looksAPI,$filter,$http) {

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

    $scope.validate=function(data) {
		console.log("data",data);
		var ein=data.ein;
      if (ein!= undefined && ein.length > 5) {
        $scope.loading = true;
        var link = {ein:ein};
        $http.post('/api/admin/getinfo',link)
         .then(function(res) {
            var orgInfo=JSON.parse(res.data);
			orgInfo=orgInfo.organization;
            $scope.showScrapeDetails = true;
            $scope.gotScrapeResults = true;
            $scope.uploadLookTitle = true;
            //$scope.look.imgThumb = data.data.img;
			$scope.user=orgInfo;
          })
          .catch(function(data) {
            console.log('failed to return from scrape');
            $scope.loading = false;
            //$scope.look.link = '';
            $scope.gotScrapeResults = false;
          })
          .finally(function() {
            $scope.loading = false;
            $scope.uploadLookForm = false;
          });
      }
	  else $scope.user={};
    };
	
    adminAPI.getAllUsers()
      .then(function(data) {
        $scope.users = data.data;console.log("All users",$scope.users);
		$scope.itemsByPage=5;

		$scope.displayCollection = [].concat($scope.users);

		$scope.predicates = ['name', 'email', 'provider', 'role'];
		$scope.selectedPredicate = $scope.predicates[0];
      })
      .catch(function(err) {
        console.log('error getting users');
        console.log(err);
      });


    $scope.deleteUser = function(user) {
		var index = $scope.users.indexOf(user);
      adminAPI.deleteUser(user)
        .then(function(data) {
          console.log('deleted user',index,user);
          $scope.users.splice(index, 1);
        })
        .catch(function(err) {
          console.log('failed to delete user');
          console.log(err);
        });
    }

    $scope.editLook = function(user) {
		console.log(user);
		console.log($scope);
		$scope.user=user;
		return $scope.user;
      // looksAPI.getUpdateLook(look)
        // .then(function(data) {
          // console.log(data);
          // $scope.editLook = data.data;
        // })
        // .catch(function(err) {
          // console.log('failed to edit look ' + err);
        // });
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

    // $scope.deleteLook = function(look) {
      // looksAPI.deleteLook(look)
        // .then(function(data) {
          // var index = $scope.looks.indexOf(look);
          // $scope.editLook.description = '';
          // $scope.editLook.title = '';
          // $scope.deleteBtn = false;
          // alertSuccess.show();
          // $scope.looks.splice(index, 1);
          // console.log('success, look deleted');
        // })
        // .catch(function(err) {
          // alertFail.show();
          // console.log('failed to delete look' + err);
        // });
    // }

  }
})();