export function donorfields(){return [
        {
            key: 'first_name',
            type: 'input',
            templateOptions: {
                type: 'text',
                label: 'First Name',
                placeholder: 'Enter your first name',
                required: true
            }
        },
        {
            key: 'last_name',
            type: 'input',
            templateOptions: {
                type: 'text',
                label: 'Last Name',
                placeholder: 'Enter your last name',
                required: true
            }
        },
		{
        key: 'email',
        type: 'input-loader',
        templateOptions: {	
		  type: 'text',	  
		  label: 'Email Address',
          placeholder: 'Enter email',
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
              return $timeout(function() {
                scope.options.templateOptions.loading = false; 
                if (vm.existingUsers.indexOf($viewValue) !== -1) {
                  throw new Error('registered');
                }
              }, 1000); 
            },
            message: '"This Emailid is already registered."'
          }
        },
        modelOptions: {
          updateOn: 'blur'
        }
      },
		{
			key: 'under25',
			type: 'checkbox',
			templateOptions: {
				label: 'Are you under 25?',
			},
			// Hide this field if we don't have
			// any valid input in the email field
			hideExpression: '!model.first_name'
		},
	   
		{
			key: 'insurance',
			type: 'input',
			templateOptions: {
				label: 'Insurance Policy Number',
				placeholder: 'Enter your insurance policy number'
			},
			hideExpression: '!model.under25',
		}		
    ];
}