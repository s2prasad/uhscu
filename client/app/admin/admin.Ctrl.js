(function() {
  'use strict';

  angular
    .module('app')
    .controller('AdminCtrl', AdminCtrl);
	
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

	
  AdminCtrl.$inject = ['$scope', 'Auth', '$modal', 'adminAPI', '$alert','$filter','$http'];

  function AdminCtrl($scope, Auth, $modal, adminAPI, $alert,$filter,$http) {

    $scope.update = [];
    $scope.users = [];
    $scope.user = {};
    $scope.activationStatuses= [{"value":"active","label":"Activate"},{"value":"inactive","label":"Deactivate"}];
    $scope.deleteBtn = true;

    var alertSuccess = $alert({
      title: 'Saved ',
      content: 'Updated Successfully',
      placement: 'top-right',
      container: '#alertContainer',
      type: 'success',
      duration: 8
    });

    var alertFail = $alert({
      title: 'Not Saved ',
      content: 'Update Failed',
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
			$scope.user=orgInfo;
          })
          .catch(function(data) {
            console.log('failed to return from scrape');
            $scope.loading = false;
            $scope.gotScrapeResults = false;
          })
          .finally(function() {
            $scope.loading = false;
          });
      }
	  else $scope.user={};
    };
	
    adminAPI.getAllUsers()
      .then(function(data) {
        $scope.users = data.data;console.log("All users",$scope.users);
		$scope.itemsByPage=10;

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

    $scope.userDetails = function(user) {
		console.log(user);
		console.log($scope);
		$scope.user=user;
		return $scope.user;
    }

    $scope.updateStatus = function() {
      var activationStatus = $scope.update.status;
      var email=$scope.user.email;
      var user={email:email,status:activationStatus};
        adminAPI.updateUser(user)
            .then(function(data){;
                var result=data.data.result;
                if(result=="success") {
                    $scope.user.status = data.data.details.status;
                    alertSuccess.show();
                }
                if(result=="failed"){
                    alertFail.show();
                }
                $scope.update.status=null;
            });
    }

  }
})();