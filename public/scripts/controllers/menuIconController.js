'use strict';

 angular.module('nearPlaceApp')
 .controller('menuIconCtrl', function ($scope, $mdDialog, menuIcon, Auth) {

 	// Pagination options.
 	$scope.rowOptions = [10, 20, 40];

 	$scope.query = {
 		filter: '',
 		limit: 40,
 		page: 1,
 		total: 0
 	};

 	$scope.menuicons = [];	
	
 	var loadmenuIcons = function() {
    Auth.ensureLoggedIn().then(function () {
 		  $scope.promise = menuIcon.all($scope.query).then(function(menuicons) {
 			  $scope.menuicons = menuicons;
 		  });
    });
 	}
	
 	loadmenuIcons();
	
  var loadCount = function () {
    Auth.ensureLoggedIn().then(function () {
      menuIcon.count($scope.query).then(function(total) {
   		  $scope.query.total = total;
   	  });
    });
  }

  loadCount();

 	$scope.onSearch = function () {
 		$scope.query.page = 1;
 		$scope.query.total = 0;
 		loadmenuIcons();
    loadCount();
 	};

 	$scope.onPaginationChange = function (page, limit) {
 		$scope.query.page = page;
 		$scope.query.limit = limit;
 		loadmenuIcons();
 	};

 	$scope.openMenu = function ($mdOpenMenu, ev) {
 		$mdOpenMenu(ev);
 	};

 	$scope.onNewmenuIcon = function (ev) {

 		$mdDialog.show({
 			controller: 'DialogmenuIconController',
 			templateUrl: '/views/partials/menuicon.html',
 			parent: angular.element(document.body),
 			targetEvent: ev,
 			locals: {
 				menuicon: null
 			},
 			clickOutsideToClose: true
 		})
 		.then(function(answer) {
 			loadmenuIcons();
      loadCount();
 		});
 	}

 	$scope.onEditmenuIcon = function (ev, menuicon) {
 		$mdDialog.show({
 			controller: 'DialogmenuIconController',
 			templateUrl: '/views/partials/menuicon.html',
 			parent: angular.element(document.body),
 			targetEvent: ev,
 			locals: {
 				menuicon: angular.copy(menuicon)
 			},
 			clickOutsideToClose: true
 		})
 		.then(function(answer) {
 			loadmenuIcons();
 		});
 	}

 	$scope.onDestroymenuIcon = function(ev, menuicon) {

 		var confirm = $mdDialog.confirm()
	 		.title('Aktion bestätigen')
	 		.content('Sind Sie sicher, dass Sie diese Kategorie löschen möchten? Orte dieser Kategorie werden gelöscht.')
	 		.ok('Löschen')
	 		.cancel('zurück')
	 		.targetEvent(ev);

 		$mdDialog.show(confirm).then(function() {

 			menuIcon.destroy(menuicon.id).then(function(success) {
 				loadmenuIcons();
        loadCount();
 			}, function (error) {
 				showSimpleToast(error.message);
 			});

 		});


 	}

}).controller('DialogmenuIconController',
function($scope, $mdDialog, $mdToast, menuIcon, File, menuicon) {

	$scope.isCreating = false;
	$scope.isUploading = false;
  $scope.isUploadingIcon = false;
	$scope.imageFilename = '';
  $scope.iconFilename = '';

	if (menuicon) {

		$scope.isCreating = false;

    if (menuicon.icon) {
      $scope.iconFilename = menuicon.icon.name();
    }

		$scope.objmenuIcon = menuicon;

	} else {

		$scope.objmenuIcon = {};
		$scope.isCreating = true;
	}

	var showToast = function (message) {
		$mdToast.show(
			$mdToast.simple()
			.content(message)
			.action('OK')
			.hideDelay(3000)
		);
	};

	$scope.hide = function() {
		$mdDialog.cancel();
	};

	$scope.cancel = function() {
		$mdDialog.cancel();
	};
	
  $scope.uploadIcon = function (file, invalidFile) {

    if (file) {
      $scope.iconFilename = file.name;
			$scope.isUploadingIcon = true;

			File.upload(file).then(function (savedFile) {
        $scope.objmenuIcon.icon = savedFile;
        $scope.isUploadingIcon = false;
        showToast('Icon hochgeladen');
	 		}, function (error) {
	 		  showToast(error.message);
	 		  $scope.isUploadingIcon = false;
	 		});
    } else {
      if (invalidFile) {
        if (invalidFile.$error === 'maxSize') {
          showToast('Icon zu groß. Max' + invalidFile.$errorParam);
        } else if (invalidFile.$error === 'dimensions') {
          showToast('Icon Größe sollte 64x64 sein');
        }
      }
    }
	};

	$scope.onSavemenuIcon = function (isFormValid) {

		if(!isFormValid) {
			showToast('Bitte korrigieren Sie alle markierten Fehler und versuchen Sie es erneut');
			return;

		}  else {
      $scope.isSavingmenuIcon = true;

			menuIcon.create($scope.objmenuIcon).then(function (menuicon) {
				showToast('Menü Icon gespeichert');
				$mdDialog.hide();
        $scope.isSavingmenuIcon = false;
			}, function (error) {
				showToast(error.message);
        $scope.isSavingmenuIcon = false;
			});
		}

	};

	$scope.onUpdatemenuIcon = function (isFormValid) {

		if(!isFormValid) {
			showToast('Bitte korrigieren Sie alle markierten Fehler und versuchen Sie es erneut');
			return;
			
		} else {

      $scope.isSavingmenuIcon = true;

			menuIcon.update($scope.objmenuIcon).then(function (menuicon) {
				showToast('Icon aktualisiert');
				$mdDialog.hide();
        $scope.isSavingmenuIcon = false;
			}, function (error) {
				showToast(error.message);
        $scope.isSavingmenuIcon = false;
			});
		}
	}

});
