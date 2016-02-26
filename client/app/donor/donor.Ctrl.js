(function() {
  'use strict';

  angular
    .module('app')
    .controller('DonorCtrl', DonorCtrl);

  DonorCtrl.$inject = ['$scope', 'Auth', '$modal', 'donorAPI', '$alert', 'looksAPI'];

  function DonorCtrl($scope, Auth, $modal, donorAPI, $alert, looksAPI) {

	$scope.lists = [];
	$scope.item={};
	$scope.closestReceivers={};
    $scope.looks = [];		
    $scope.users = [];
    $scope.user = {};
    $scope.editLook = {};
	$scope.donorsFilterType =[];
	$scope.donorsDietType=[];
    $scope.deleteBtn = true;
	$scope.itemFilters= [{"value":"precooked","label":"Precooked"},{"value":"readyToServe","label":"Ready to Serve"},{"value":"raw","label":"Raw"},{"value":"frozen","label":"Frozen"},{"value":"reheat","label":"Reheat"}];
	$scope.itemDiets= [{"value":"Protein","label":"Protein"},{"value":"Vegetable","label":"Vegetable"},{"value":"Dairy","label":"Dairy"}];
	
    var alertSuccess = $alert({
      title: 'Saved ',
      content: 'Item has been added',
      placement: 'top-right',
      container: '#alertContainer',
      type: 'success',
      duration: 8
    });
	var alertProgress = $alert({
      title: 'Progress',
      content: 'This feature under development',
      placement: 'top-right',
      container: '#alertContainer2',
      type: 'warning',
      duration: 15
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

    donorAPI.getAllUsers()
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
      donorAPI.deleteUser(user)
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

    $scope.deleteItem = function(item) {
          var index = $scope.lists.indexOf(item);
          alertSuccess.show();
          $scope.lists.splice(index, 1);
          console.log('success, item deleted');
    }
	
	  $scope.addItem = function() {console.log("$scope",$scope);
		  //$scope=item
      // looksAPI.getUpdateLook(look)
        // .then(function(data) {
          // console.log(data);
          // $scope.editLook = data.data;
        // })
        // .catch(function(err) {
          // console.log('failed to edit look ' + err);
        // });
    }
    $scope.pushItem = function(item){
		console.log("item *****",item);
		console.log("$scope",$scope);
		$scope.item=item;
		var currentIndex = $scope.lists.length + 1;
		console.log("****",currentIndex);
		console.log("$scope",$scope);
		 $scope.lists.push({"id":currentIndex,"donorsFilterType" :  $scope.item.donorsFilterType,"donorsDietType" :  $scope.item.donorsDietType, "detail": $scope.item.detail,"quantity": $scope.item.quantity});
          $scope.item.detail = '';
		  $scope.item.quantity='';
		  alertSuccess.show();
	}
	$scope.getReceivers= function(filters){ console.log("***here",$scope);
		//filters={"distance":$scope.receiverDistance,"filterType":$scope.receiversFilterType};
		donorAPI.getReceivers(filters)
		.then(function(data) {
			console.log("frontend",data);
			$scope.closestReceivers=data.data;
			alertProgress.show();
		});
		
	}
  }
})();