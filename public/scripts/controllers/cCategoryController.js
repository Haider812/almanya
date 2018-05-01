'use strict';

 angular.module('nearPlaceApp')
 .controller('cCategoryCtrl', function ($scope, $mdDialog, cCategory, Auth) {

 	// Pagination options.
 	$scope.rowOptions = [10, 20, 40];

 	$scope.query = {
 		filter: '',
 		limit: 40,
 		page: 1,
 		total: 0
 	};

 	$scope.ccategories = [];

 	var loadcCategories = function() {
    Auth.ensureLoggedIn().then(function () {
 		  $scope.promise = cCategory.all($scope.query).then(function(ccategories) {
 			  $scope.ccategories = ccategories;
 		  });
    });
 	}

 	loadcCategories();
	

  var loadCount = function () {
    Auth.ensureLoggedIn().then(function () {
      cCategory.count($scope.query).then(function(total) {
   		  $scope.query.total = total;
   	  });
    });
  }

  loadCount();

 	$scope.onSearch = function () {
 		$scope.query.page = 1;
 		$scope.query.total = 0;
 		loadcCategories();
    loadCount();
 	};

 	$scope.onPaginationChange = function (page, limit) {
 		$scope.query.page = page;
 		$scope.query.limit = limit;
 		loadcCategories();
 	};

 	$scope.openMenu = function ($mdOpenMenu, ev) {
 		$mdOpenMenu(ev);
 	};

 	$scope.onNewcCategory = function (ev) {

 		$mdDialog.show({
 			controller: 'DialogcCategoryController',
 			templateUrl: '/views/partials/ccategory.html',
 			parent: angular.element(document.body),
 			targetEvent: ev,
 			locals: {
 				ccategory: null
 			},
 			clickOutsideToClose: true
 		})
 		.then(function(answer) {
 			loadcCategories();
      loadCount();
 		});
 	}

 	$scope.onEditcCategory = function (ev, ccategory) {

 		$mdDialog.show({
 			controller: 'DialogcCategoryController',
 			templateUrl: '/views/partials/ccategory.html',
 			parent: angular.element(document.body),
 			targetEvent: ev,
 			locals: {
 				ccategory: angular.copy(ccategory)
 			},
 			clickOutsideToClose: true
 		})
 		.then(function(answer) {
 			loadcCategories();
 		});
 	}

 	$scope.onDestroycCategory = function(ev, ccategory) {

 		var confirm = $mdDialog.confirm()
	 		.title('Aktion bestätigen')
	 		.content('Sind Sie sicher, dass Sie diese Stadt löschen möchten?')
	 		.ok('Löschen')
	 		.cancel('zurück')
	 		.targetEvent(ev);

 		$mdDialog.show(confirm).then(function() {

 			cCategory.destroy(ccategory.id).then(function(success) {
 				loadcCategories();
        loadCount();
 			}, function (error) {
 				showSimpleToast(error.message);
 			});

 		});


 	}

}).controller('DialogcCategoryController',
function($scope, $mdDialog, $mdToast, cCategory, File, ccategory) {

	$scope.isCreating = false;
	$scope.isUploading = false;
  $scope.isUploadingIcon = false;
	$scope.imageFilename = '';
  $scope.iconFilename = '';

	if (ccategory) {

		$scope.isCreating = false;
		$scope.imageFilename = ccategory.image.name();

    if (ccategory.icon) {
      $scope.iconFilename = ccategory.icon.name();
    }

		$scope.objcCategory = ccategory;

	} else {

		$scope.objcCategory = {};
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

	$scope.uploadImage = function (file, invalidFile) {

		if (file) {
      $scope.imageFilename = file.name;
			$scope.isUploading = true;

			File.upload(file).then(function (savedFile) {
        $scope.objcCategory.image = savedFile;
        $scope.isUploading = false;
        showToast('Bild hochgeladen');
	 		},
      function (error) {
   		  showToast(error.message);
   		  $scope.isUploading = false;
	 		});
		} else {
      if (invalidFile) {
        if (invalidFile.$error === 'maxSize') {
          showToast('Bild zu groß Max' + invalidFile.$errorParam);
        }
      }
    }
	};

  $scope.uploadIcon = function (file, invalidFile) {

    if (file) {
      $scope.iconFilename = file.name;
			$scope.isUploadingIcon = true;

			File.upload(file).then(function (savedFile) {
        $scope.objcCategory.icon = savedFile;
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

	$scope.onSavecCategory = function (isFormValid) {

		if(!isFormValid) {
			showToast('Bitte korrigieren Sie alle markierten Fehler und versuchen Sie es erneut');
			return;

		}  else {
      $scope.isSavingcCategory = true;

			cCategory.create($scope.objcCategory).then(function (ccategory) {
				showToast('Kategorie gespeichert');
				$mdDialog.hide();
        $scope.isSavingcCategory = false;
			}, function (error) {
				showToast(error.message);
        $scope.isSavingcCategory = false;
			});
		}

	};

	$scope.onUpdatecCategory = function (isFormValid) {

		if(!isFormValid) {
			showToast('Bitte korrigieren Sie alle markierten Fehler und versuchen Sie es erneut');
		} else if(!$scope.objcCategory.image) {
			showToast('Lade ein Bild hoch');
		} else {

      $scope.isSavingcCategory = true;

			cCategory.update($scope.objcCategory).then(function (ccategory) {
				showToast('Kategorie aktualisiert');
				$mdDialog.hide();
        $scope.isSavingcCategory = false;
			}, function (error) {
				showToast(error.message);
        $scope.isSavingcCategory = false;
			});
		}
	}

});
