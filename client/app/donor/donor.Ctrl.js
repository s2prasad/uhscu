(function() {
  'use strict';

  angular
    .module('app')
    .controller('DonorCtrl', DonorCtrl);

  DonorCtrl.$inject = ['$scope', 'Auth', '$modal', 'donorAPI', '$alert'];

  function DonorCtrl($scope, Auth, $modal, donorAPI, $alert) {

	$scope.lists = [];
	$scope.item={};
    $scope.transactionId=[];
	$scope.closestReceivers=[];
    $scope.receiversFilters = {};
    $scope.transaction = {};
	$scope.donorsFoodType =[];
	$scope.donorsDietType=[];
    $scope.deleteBtn = true;
	$scope.itemFilters= [{"value":"precooked","label":"Precooked"},{"value":"readyToServe","label":"Ready to Serve"},{"value":"raw","label":"Raw"},{"value":"frozen","label":"Frozen"},{"value":"reheat","label":"Reheat"}];
	$scope.itemDiets= [{"value":"Protein","label":"Protein"},{"value":"Vegetable","label":"Vegetable"},{"value":"Dairy","label":"Dairy"}];
    $scope.notification=false;

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
      content: 'All receivers has been fetched, Increase distance to fetch more.',
      placement: 'top-right',
      container: '#alertContainer2',
      type: 'warning',
      duration: 15
    });
    var alertTransactionComplete = $alert({
      title: 'Transaction Complete',
      content: 'Your transaction is under progress.You should receive an sms soon.'+$scope.transactionId.join(', '),
      placement: 'top-middle',
      container: '#alertContainer3',
      type: 'warning',
      duration: 20
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

    $scope.deleteItem = function(item) {
          var index = $scope.lists.indexOf(item);
          alertSuccess.show();
          $scope.lists.splice(index, 1);
          console.log('success, item deleted');
    }
	
	  $scope.submitItems = function() {
          console.log("inside submit items",$scope);
          var items={};
          items.receivers=$scope.closestReceivers;
          items.itemDescription=$scope.lists;
          items.filterForReceiver=$scope.receiversFilters;console.log("***$scope.transaction.phone",$scope.transaction.phone);
          items.transaction=$scope.transaction;
          //items.transactionName=$scope.transaction.name;
          donorAPI.saveItems(items)
              .then(function(data) {
                  console.log("after sending sms",data);
                  $scope.lists = [];
                  $scope.item={};
                  $scope.closestReceivers=[];
                  $scope.receiversFilters = {};
                  $scope.transaction = {};
                  $scope.donorsFoodType =[];
                  $scope.donorsDietType=[];
                  $scope.transactionId.push(data.data.transactionId);console.log("$scope.transactionId",$scope,"data.data",data.data);
                  $scope.notification=true;
                  alertTransactionComplete.show();
              });
		  //$scope=item
      // looksAPI.getUpdateLook(look)
        // .then(function(data) {
          // console.log(data);
          // $scope.editLook = data.data;
        // })
        // .catch(function(err) {
          // console.log('failed to edit look ' + err);
        // });
    };

    $scope.pushItem = function(item){
		console.log("item *****",item);
		console.log("$scope",$scope);
		$scope.item=item;
		var currentIndex = $scope.lists.length + 1;
		console.log("****",currentIndex);
		console.log("$scope",$scope);
		 $scope.lists.push({"id":currentIndex,"donorsFoodType" :  $scope.item.donorsFoodType,
             "donorsDietType" :  $scope.item.donorsDietType, "detail": $scope.item.detail,
             "quantity": $scope.item.quantity});
          $scope.item.detail = '';
		  $scope.item.quantity='';
		  alertSuccess.show();
	}
	$scope.getReceivers= function(filters){ console.log("***here",$scope);console.log("filters",filters);
        $scope.receiversFilters=filters;
		donorAPI.getReceivers(filters)
		.then(function(data) {
			console.log("frontend",data);
			$scope.closestReceivers=data.data;
            console.log("frontend",$scope.closestReceivers);
			alertProgress.show();
		});
		
	}
  }
})();