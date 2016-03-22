(function() {
  'use strict';

  angular
    .module('app')
	.constant('formlyExampleApiCheck', apiCheck())
	.config(function(formlyConfigProvider,formlyExampleApiCheck) {

    formlyConfigProvider.setWrapper({
      name: 'loader',
      template: [
		"<label class='control-label' ng-if='to.label'>{{to.label}}</label>",
        '<formly-transclude></formly-transclude>',
        '<span class="glyphicon glyphicon-refresh loader" ng-show="to.loading"></span>'
      ].join(' ')
    });


    formlyConfigProvider.setType({
      name: 'input-loader',
      extends: 'input',
      wrapper: ['loader']
    });
	 formlyConfigProvider.setType({
      name: 'bstimepicker',
      extends: 'input',
	 template:'<formly-transclude></formly-transclude><i class="fa fa-clock-o"><label class="control-label"></label>\
            <input type="text" class="form-control" size="8" ng-model="model[options.key]" name="model[options.name]" bs-timepicker data-time-format="HH:mm" data-length="1" data-minute-step="1" data-arrow-behavior="picker"></i>'
    });
	formlyConfigProvider.setType({
        name:'placeAutoComplete',
        extends: 'input',
      template:"<formly-transclude></formly-transclude>\
            <input g-places-autocomplete class='form-control'  ng-model='model[options.key]'\
        ng-attr-options='to.autocompleteOptions' \
        ng-attr-force-selection='to.forceSelection'/>"
    });
	
	formlyConfigProvider.setType({
      name: 'multiselect',
      extends: 'input',
	 template:'<formly-transclude></formly-transclude><button type="button" class="btn btn-default" ng-model="model[options.key]" data-html="1" data-multiple="1" data-animation="am-flip-x" bs-options="item.value as item.name for item in to.options" bs-select>'
    });
	
	formlyConfigProvider.setType({
      name: 'singleselect',
      extends: 'input',
	 template:'<formly-transclude></formly-transclude><button type="button" class="btn btn-default" ng-model="model[options.key]" data-html="1" bs-options="item.value as item.name for item in to.options" bs-select>Action <span class="caret"></span>'
    });	
	
    formlyConfigProvider.setWrapper({
      template: '<formly-transclude></formly-transclude><div my-messages="options"></div>',
      types: ['input', 'checkbox', 'select', 'textarea', 'radio', 'input-loader','timepicker']
    });
  // formlyConfigProvider.setType({
    // name: 'timepicker',
    // template: '<timepicker ng-model="model[options.key]" ></timepicker>',
   // wrapper: ['bootstrapLabel', 'bootstrapHasError'],
    // defaultOptions: {
     // // ngModelAttrs: ngModelAttrs,
      // templateOptions: {
		  // hiddenDate:'true',
        // datepickerOptions: {	  "hidden-date":'true', 'hiddenDate':'true'}
      // }
    // }
  // });
 formlyConfigProvider.setType({
      name: 'matchField',
      apiCheck: function() {
        return {
          data: {
            fieldToMatch: formlyExampleApiCheck.string
          }
        }
      },
      apiCheckOptions: {
        prefix: 'matchField type'
      },
      defaultOptions: function matchFieldDefaultOptions(options) {
        return {
          extras: {
            validateOnModelChange: true
          },
          expressionProperties: {
            'templateOptions.disabled': function(viewValue, modelValue, scope) {
              var matchField = find(scope.fields, 'key', options.data.fieldToMatch);
              if (!matchField) {
                throw new Error('Could not find a field for the key ' + options.data.fieldToMatch);
              }
              var model = options.data.modelToMatch || scope.model;
              var originalValue = model[options.data.fieldToMatch];
              var invalidOriginal = matchField.formControl && matchField.formControl.$invalid;
              return !originalValue || invalidOriginal;
            }
          },
          validators: {
            fieldMatch: {
              expression: function(viewValue, modelValue, fieldScope) {
                var value = modelValue || viewValue;
                var model = options.data.modelToMatch || fieldScope.model;
                return value === model[options.data.fieldToMatch];
              },
              message: options.data.matchFieldMessage || '"Must match"'
            }
          }
        };
        
        function find(array, prop, value) {
          var foundItem;
          array.some(function(item) {
            if (item[prop] === value) {
              foundItem = item;
            }
            return !!foundItem;
          });
          return foundItem;
        }
      }
    }); 
  
  })
    .directive('myMessages', function() { return { templateUrl: 'custom-messages.html',scope: {options: '=myMessages'}}; })
    .controller('SignupCtrl', SignupCtrl);

  SignupCtrl.$inject = ['$scope', 'Auth', '$state', '$window','$timeout'];

  function SignupCtrl($scope, Auth, $state, $window,$timeout) {
	  var vm = this;
	  vm.existingUsers = [
      'john@gmail.com',
      'tyrion@gmail.com',
      'arya@yahoo.com'
    ];
	
	      vm.fields = donorfields($timeout,Auth,vm);

	  vm.emailCheckMsg="initial";
	console.log("vm",vm);
	//vm.originalFields = angular.copy(vm.fields);
    $scope.user = {};
    $scope.errors = {};
	$scope.isCollapsed = false;
    if (Auth.isLoggedIn()) {
      $state.go('main');
    }
	$scope.place = null;
    $scope.register = function(form) {
      $scope.submitted = true;	
	  console.log("here 6",vm.model.location)
	  console.log("here2",vm.model);
	  console.log("here3",vm.model.location.formatted_address,"lat",vm.model.location.geometry.location.lat()," lng::",vm.model.location.geometry.location.lng());
	  console.log("here1",JSON.stringify(vm.model));
      if (form.$valid && vm.model!={}) {
        Auth.createUser(
          vm.model
        ).then(function() {
            //Account created, redirect to home
            $state.go('main');
          })
          .catch(function(err) {
            err = err.data;
            $scope.errors = {};

            // Update validity of form fields that match the mongoose errors
            angular.forEach(err.errors, function(error, field) {
              form[field].$setValidity('mongoose', false);
              $scope.errors[field] = error.message;
            });
          });
      }
    };

    $scope.loginOauth = function(provider) {
      $window.location.href = '/auth/' + provider;
    };
  }

	function verifyUser($timeout,vm){

	};

  
  function donorfields($timeout,Auth,vm){
	  return [
	  {
			key: 'role',
			type: 'singleselect',
			templateOptions: {
				label: 'Who are you ?',
				required: true,
				options: [
				  {"name": "Receiver","value": "receiver"},
				  {"name": "Donor","value": "donor"},
				  {"name": "Transporter","value": "transporter"}
				]				
			}
		},
		{
            key: 'loginName',
            type: 'input',
            templateOptions: {
                type: 'text',
                label: 'Login Name',
                placeholder: 'Alex Matthew',
                required: true
            },
			hideExpression: '!model.role'
        },	
		{
        key: 'email',
        type: 'input-loader',
        templateOptions: {	  
		  type:'email',
		  label: 'Login Email *',
          placeholder: 'xyz@coastco.com',
          required: true,
          onKeydown: function(value, options) {
            options.validation.show = false;
          },
          onBlur: function(value, options) {
            options.validation.show = null;
          }
        },
        asyncValidators: {
          uniqueUsername: {
            expression: function($viewValue, $modelValue, scope) {
              scope.options.templateOptions.loading = true;
				var exist=false;
                Auth.checkEmail($viewValue, function (responses) {
                    console.log("Response", responses);
                    if ($viewValue.trim != '' && $viewValue != null && responses.data.exist != undefined)
                        exist=true
                });
              return $timeout(function() {
                scope.options.templateOptions.loading = false;
                  if(exist) throw new Error('registered');
              }, 1000);
            },
			  message: "'Invalid Email or already registered.'"
		  }
        },
        modelOptions: {
          updateOn: 'blur'
        },
			hideExpression: '!model.role'
      },		
      {
        key: 'password',
        type: 'input',
        templateOptions: {
          type: 'password',
          label: 'Password',
          placeholder: 'Must be at least 6 characters',
          required: true,
          minlength: 6
        },
			hideExpression: '!model.role'
      },
      {
        key: 'confirmPassword',
        type: 'input',
        optionsTypes: ['matchField'],
        model: vm.confirmationModel,
        templateOptions: {
          type: 'password',
          label: 'Confirm Password',
          placeholder: 'Please re-enter your password',
          required: true
        },
        data: {
          fieldToMatch: 'password',
          modelToMatch: vm.model
        },
			hideExpression: '!model.role'
      },		
        {
            key: 'companyName',
            type: 'input',
            templateOptions: {
                type: 'text',
                label: 'Company Name',
                placeholder: 'Enter Company name',
                required: true
            },
			hideExpression: '!model.role'
        },
        {
            key: 'ein',
            type: 'input',
            templateOptions: {
                type: 'number',
				maxlength: '9',
				minlength:'5',
                label: 'Ein Tax no.',
                placeholder: '1234567890',
                required: true
            },
			hideExpression: 'model.role!="receiver"'
        },		
		{
			key: 'location',
			type: 'placeAutoComplete',
			templateOptions: {
				label: 'Location',
			   placeholder: '1560 elcamino real',
				forceSelection: true,
				required: true,
				autocompleteOptions: {
					componentRestrictions: { country: 'US'},
					types: ['geocode']
				}
			},
			hideExpression: '!model.role'
		},
		{
			key: 'companyAdminName',
			type: 'input',
			templateOptions: {
				type: 'text',
				label: 'Company Administrative Contact Name',
				placeholder: 'Michael John',
				required: true				   
			},
			hideExpression: '!model.role'
		},	
		{
			key: 'companyPhoneNumber',
			type: 'input',
			templateOptions: {
				type: 'number',
				minlength:'10',
				maxlength:'10',
				label: 'Company Phone Number',
				placeholder: '4087961234',
				required: true				   
			},
			hideExpression: '!model.role'
		},		
		{
        key: 'companyEmail',
        type: 'input-loader',
        templateOptions: {	  
		  type:'email',
		  label: 'Company Email*',
          placeholder: 'xyz@coastco.com',
          required: true,
         },
			hideExpression: '!model.role'
		},
		{
			key: 'companyWebsite',
			type: 'input',
			templateOptions: {
				type: 'url',
				label: 'Company Website',
				placeholder: 'http://www.urbanharvester.org'
			},
			hideExpression: '!model.role'
		},
		{
			key: 'foodRecoveryContactName',
			type: 'input',
			templateOptions: {
				type: 'text',
				label: 'Daily Food Recovery Contact Name',
				placeholder: 'Tom Jackson',
				required: true				   
			},
			hideExpression: '!model.role'
		},
		{
			key: 'foodRecoveryContactEmail',
			type: 'input',
			templateOptions: {
				type: 'email',
				label: 'Daily Food Recovery Contact Email',
				placeholder: 'sam@coastco.com',
				required: true				   
			},
			hideExpression: '!model.role'
		},		
		{
			key: 'foodRecoveryContactPhone',
			type: 'input',
			templateOptions: {
				type: 'number',
				minlength:'10',
				maxlength:'10',
				label: 'Daily Food Recovery Contact Phone',
				placeholder: '4087961234',
				required: true				   
			},
			hideExpression: '!model.role'
		},
		{
			key: 'donorRecoveryFoodCartNo',
			type: 'input',
			templateOptions: {
				type: 'number',
				label: ' Maximum shopping carts of recovery food per day',
				placeholder: 'Number of Shopping cart',
				required: true				   
			},
			hideExpression: 'model.role!="donor"'
		},
		{
			key: 'receiverRecoveryFoodCartNo',
			type: 'input',
			templateOptions: {
				type: 'number',
				label: ' Maximum shopping carts of food accepted per day',
				placeholder: 'Number of Shopping cart',
				required: true				   
			},
			hideExpression: 'model.role!="receiver"'
		},
		{
			key: 'transporterRecoveryFoodCartNo',
			type: 'input',
			templateOptions: {
				type: 'number',
				label: ' Maximum shopping carts of food delivered per day',
				placeholder: 'Number of Shopping cart',
				required: true				   
			},
			hideExpression: 'model.role!="transporter"'
		},
		{
			key: 'receiverHotMeals',
			type: 'input',
			templateOptions: {
				type: 'text',
				label: 'Hot meals provided per month',
				placeholder: '30 lbs',
				required: true				   
			},
			hideExpression: 'model.role!="receiver"'
		},
		{
			key: 'receiverSlackMeals',
			type: 'input',
			templateOptions: {
				type: 'text',
				label: 'Slack meals provided per month',
				placeholder: '25 lbs',
				required: true				   
			},
			hideExpression: 'model.role!="receiver"'
		},
		{
			key: 'receiverPerishableGroceries',
			type: 'input',
			templateOptions: {
				type: 'number',
				label: 'Bags of perishable grocery provided per month',
				placeholder: '10',
				required: true				   
			},
			hideExpression: 'model.role!="receiver"'
		},
		{
			key: 'receiverDryGroceries',
			type: 'input',
			templateOptions: {
				type: 'number',
				label: 'Bags of dry grocery provided per month',
				placeholder: '15',
				required: true				   
			},
			hideExpression: 'model.role!="receiver"'
		},
		{
			key: 'receiverPerishableItem',
			type: 'singleselect',
			templateOptions: {
				label: 'Do you accept perishable precooked food that require reheating?',
				required: true,
				options: [
				  {"name": "Yes","value": "yes"},
				  {"name": "No","value": "no"}
				]			
			},
			hideExpression: 'model.role!="receiver"'
		},		
		// {
			// key: 'recoveryfoodcartno',
			// type: 'input',
			// templateOptions: {
				// type: 'number',
				// label: ' Maximum shopping carts of food transported per day',
				// placeholder: 'Number of Shopping cart',
				// required: true				   
			// },
			// hideExpression: 'model.role!="transporter"'
		// },	
		{
			key: 'receiverDaysOfWeek',
			type: 'multiselect',
			templateOptions: {
				label: 'Days of week food received',
				options: [
				  {"name": "Monday","value": "mon"},
				  {"name": "Tuesday","value": "tue"},
				  {"name": "Wednesday","value": "wed"},
				  {"name": "Thursday","value": "thu"},
				  {"name": "Friday","value": "fri"},
				  {"name": "Saturday","value": "sat"},
				  {"name": "Sunday","value": "sun"},
				],		
				required: true				   
			},
			hideExpression: 'model.role!="receiver"'
		},			
		{
			key: 'donorDaysOfWeek',
			type: 'multiselect',
			templateOptions: {
				label: 'Days of week food donated',
				options: [
				  {"name": "Monday","value": "mon"},
				  {"name": "Tuesday","value": "tue"},
				  {"name": "Wednesday","value": "wed"},
				  {"name": "Thursday","value": "thu"},
				  {"name": "Friday","value": "fri"},
				  {"name": "Saturday","value": "sat"},
				  {"name": "Sunday","value": "sun"},
				],		
				required: true				   
			},
			hideExpression: 'model.role!="donor"'
		},
{
			key: 'transporterDaysOfWeek',
			type: 'multiselect',
			templateOptions: {
				label: 'Days of week food delivered',
				options: [
				  {"name": "Monday","value": "mon"},
				  {"name": "Tuesday","value": "tue"},
				  {"name": "Wednesday","value": "wed"},
				  {"name": "Thursday","value": "thu"},
				  {"name": "Friday","value": "fri"},
				  {"name": "Saturday","value": "sat"},
				  {"name": "Sunday","value": "sun"},
				],		
				required: true				   
			},
			hideExpression: 'model.role!="transporter"'
		},		
		{
			key: 'donorPickupTime',
			type: 'bstimepicker',
			templateOptions: {
				label: 'What time your donated food be pickedup?',
				required: true
			},
			hideExpression: 'model.role!="donor"'
		},	
		{
			key: 'receiverEarlyTime',
			type: 'bstimepicker',
			templateOptions: {
				label: 'How early can you begin receiving food donations?',
				required: true
			},
			hideExpression: 'model.role!="receiver"'
		},	
		{
			key: 'receiverLateTime',
			type: 'bstimepicker',
			templateOptions: {
				label: 'How late can you receive food donations?',
				required: true
			},
			hideExpression: 'model.role!="receiver"'
		},	
		{
			key: 'transporterEarlyTime',
			type: 'bstimepicker',
			templateOptions: {
				label: 'How early can you begin picking up food donations?',
				required: true
			},
			hideExpression: 'model.role!="transporter"'
		},	
		{
			key: 'transporterLateTime',
			type: 'bstimepicker',
			templateOptions: {
				label: 'How late can you deliver food donations?',
				required: true
			},
			hideExpression: 'model.role!="transporter"'
		},			
		{
			key: 'donorRefrigeratedItem',
			type: 'singleselect',
			templateOptions: {
				label: 'Do you donate refrigeration required food?',
				required: true,
				options: [
				  {"name": "Yes","value": "yes"},
				  {"name": "No","value": "no"}
				]			
			},
			hideExpression: 'model.role!="donor"'
		},
		{
			key: 'receiverRefrigeratedItem',
			type: 'singleselect',
			templateOptions: {
				label: 'Do you have refrigerator?',
				required: true,
				options: [
				  {"name": "Yes","value": "yes"},
				  {"name": "No","value": "no"}
				]			
			},
			hideExpression: 'model.role!="receiver"'
		},		
		{
			key: 'donorFreezerItem',
			type: 'singleselect',
			templateOptions: {
				label: 'Do you donate freezer required food?',
				required: true,
				options: [
				  {"name": "Yes","value": "yes"},
				  {"name": "No","value": "no"}
				]				
			},
			hideExpression: 'model.role!="donor"'
		},	
		{
			key: 'receiverFreezerItem',
			type: 'singleselect',
			templateOptions: {
				label: 'Do you have freezer?',
				required: true,
				options: [
				  {"name": "Yes","value": "yes"},
				  {"name": "No","value": "no"}
				]				
			},
			hideExpression: 'model.role!="receiver"'
		},	
		{
			key: 'receiverSpecialInstructionFood',
			type: 'textarea',
			templateOptions: {
				label: 'Any special delivery instructions about food coming to your facility?',
				placeholder: 'Food should be packed.',
				required: true				   
			},
			hideExpression: 'model.role!="receiver"'
		},		
		{
			key: 'donorFoodDeliverLocally',
			type: 'singleselect',
			templateOptions: {
				label: 'Does your company transport donated food locally?',
				required: true,
				options: [
				  {"name": "Yes","value": "yes"},
				  {"name": "No","value": "no"}
				]				
			},
			hideExpression: 'model.role!="donor"'
		},
		{
			key: 'receiverFoodDeliverLocally',
			type: 'singleselect',
			templateOptions: {
				label: 'Does your agency pickup donated food locally?',
				required: true,
				options: [
				  {"name": "Yes","value": "yes"},
				  {"name": "No","value": "no"}
				]				
			},
			hideExpression: 'model.role!="receiver"'
		},		
		{
			key: 'vehicleDriverType',
			type: 'multiselect',
			templateOptions: {
				label: 'Are your drivers volunteer or staff?',
				required: true,
				options: [
				  {"name": "Volunteer","value": "volunteer"},
				  {"name": "Staff","value": "staff"}
				]				
			},
			hideExpression: '!model.role || model.receiverFoodDeliverLocally=="no"||model.donorFoodDeliverLocally=="no"'
		},	   
		{
			key: 'vehicleInsurance',
			type: 'singleselect',
			templateOptions: {
				label: 'Does your company own and insure your delivery vehicles?',
				required: true,
				options: [
				  {"name": "Yes","value": "yes"},
				  {"name": "No","value": "no"}
				]	
			},
			hideExpression: '!model.role || model.receiverFoodDeliverLocally=="no"||model.donorFoodDeliverLocally=="no"'
		},			
		{
			key: 'vehicleEquipped',
			type: 'multiselect',
			templateOptions: {
				label: 'Is your vehicle equipped with',
				options: [
				  {"name": "Refrigeration","value": "refrigeration"},
				  {"name": "Coolers","value": "coolers"},
				  {"name": "Freezer","value": "freezer"},
				  {"name": "Thermal Blankets","value": "thermalblankets"}				  
				]				
			},
			hideExpression: '!model.role || model.receiverFoodDeliverLocally=="no"||model.donorFoodDeliverLocally=="no"'
		},			
		{
			key: 'vehicleLocalMiles',
			type: 'input',
			templateOptions: {
				type: 'number',
				minlength:'1',
				maxlength:'4',				
				label: 'Maximum number of miles willing to transport a donated food?',
				required: true,				
			},
			hideExpression: '!model.role || model.receiverFoodDeliverLocally=="no"||model.donorFoodDeliverLocally=="no"'
		}
    ];
  }
})();