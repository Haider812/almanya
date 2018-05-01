'use strict';

angular.module('nearPlaceApp').controller('ResetPasswordCtrl',
  function($scope, $mdToast, $mdDialog, $http, Auth) {

  $scope.isLoading = false;

  var showDialog = function (title, message, ev) {

    $mdDialog.show(
      $mdDialog.alert()
        .parent(angular.element(document.body))
        .clickOutsideToClose(true)
        .title(title)
        .content(message)
        .ariaLabel('Alert Dialog')
        .ok('Ok')
        .targetEvent(ev)
    );
  }

	$scope.onResetPassword = function (isFormValid) {

		if (isFormValid) {

      $scope.isLoading = true;
      Auth.resetPassword($scope.email).then(function (success) {
        $scope.isLoading = false;
        showDialog('Erfolg', 'Prüfe deine E-Mails zum Zurücksetzen des Passworts');
      }, function (error) {
        $scope.isLoading = false;
        showDialog('Error', error.message);
      })
		}
	}

	// $scope.onResetPassword = function (isFormValid) {

		// if (isFormValid) {

		  // $scope.isLoading = true;
		  // $http(
				// {
					// "method": "POST",
					// "url": "https://api.mailgun.net/v3/" + 'sandboxae0e6d9c3446456383083117df8c5799.mailgun.org' + "/messages",
					// "headers": {
						// "Content-Type": "application/x-www-form-urlencoded",
						// "Authorization": "Basic " + 'key-dd20e671b70b2d3acde981f3cb4e29d2'
					// },
					// data: "from=" + "test@example.com" + "&to=" + $scope.email + "&subject=Passwort zurücksetzen" + "&text=" + 'testText'
				// }
				
				// );
		// }
		// $scope.isLoading = false;
	// }
	
});

