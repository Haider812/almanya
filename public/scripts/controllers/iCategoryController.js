'use strict';

 angular.module('nearPlaceApp')
 .controller('iCategoryCtrl', function ($scope, $mdDialog, iCategory, Auth) {

 	// Pagination options.
 	$scope.rowOptions = [10, 20, 40];

 	$scope.query = {
 		filter: '',
 		limit: 40,
 		page: 1,
 		total: 0
 	};

 	$scope.icategories = [];

 	var loadiCategories = function() {
    Auth.ensureLoggedIn().then(function () {
 		  $scope.promise = iCategory.all($scope.query).then(function(icategories) {
 			  $scope.icategories = icategories;
 		  });
    });
 	}

 	loadiCategories();
	

  var loadCount = function () {
    Auth.ensureLoggedIn().then(function () {
      iCategory.count($scope.query).then(function(total) {
   		  $scope.query.total = total;
   	  });
    });
  }

  loadCount();

 	$scope.onSearch = function () {
 		$scope.query.page = 1;
 		$scope.query.total = 0;
 		loadiCategories();
    loadCount();
 	};

 	$scope.onPaginationChange = function (page, limit) {
 		$scope.query.page = page;
 		$scope.query.limit = limit;
 		loadiCategories();
 	};

 	$scope.openMenu = function ($mdOpenMenu, ev) {
 		$mdOpenMenu(ev);
 	};

 	$scope.onNewiCategory = function (ev) {

 		$mdDialog.show({
 			controller: 'DialogiCategoryController',
 			templateUrl: '/views/partials/icategory.html',
 			parent: angular.element(document.body),
 			targetEvent: ev,
 			locals: {
 				icategory: null
 			},
 			clickOutsideToClose: true
 		})
 		.then(function(answer) {
 			loadiCategories();
      loadCount();
 		});
 	}

 	$scope.onEditiCategory = function (ev, icategory) {

 		$mdDialog.show({
 			controller: 'DialogiCategoryController',
 			templateUrl: '/views/partials/icategory.html',
 			parent: angular.element(document.body),
 			targetEvent: ev,
 			locals: {
 				icategory: angular.copy(icategory)
 			},
 			clickOutsideToClose: true
 		})
 		.then(function(answer) {
 			loadiCategories();
 		});
 	}

 	$scope.onDestroyiCategory = function(ev, icategory) {

 		var confirm = $mdDialog.confirm()
	 		.title('Aktion bestätigen')
	 		.content('Sind Sie sicher, dass Sie diese Kategorie löschen möchten? Orte dieser Kategorie werden gelöscht.')
	 		.ok('Löschen')
	 		.cancel('zurück')
	 		.targetEvent(ev);

 		$mdDialog.show(confirm).then(function() {

 			iCategory.destroy(icategory.id).then(function(success) {
 				loadiCategories();
        loadCount();
 			}, function (error) {
 				showSimpleToast(error.message);
 			});

 		});


 	}

}).controller('DialogiCategoryController',
function($scope, $mdDialog, $mdToast, iCategory, File, icategory) {

	$scope.isCreating = false;
	$scope.isUploading = false;
  $scope.isUploadingIcon = false;
	$scope.imageFilename = '';
  $scope.iconFilename = '';

	if (icategory) {

		$scope.isCreating = false;
		$scope.imageFilename = icategory.image.name();

    if (icategory.icon) {
      $scope.iconFilename = icategory.icon.name();
    }

		$scope.objiCategory = icategory;

	} else {

		$scope.objiCategory = {};
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
        $scope.objiCategory.image = savedFile;
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
        $scope.objiCategory.icon = savedFile;
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

	$scope.onSaveiCategory = function (isFormValid) {

		if(!isFormValid) {
			showToast('Bitte korrigieren Sie alle markierten Fehler und versuchen Sie es erneut');
			return;

		}  else {
      $scope.isSavingiCategory = true;

			iCategory.create($scope.objiCategory).then(function (icategory) {
				showToast('Kategorie gespeichert');
				$mdDialog.hide();
        $scope.isSavingiCategory = false;
			}, function (error) {
				showToast(error.message);
        $scope.isSavingiCategory = false;
			});
		}

	};

	$scope.onUpdateiCategory = function (isFormValid) {

		if(!isFormValid) {
			showToast('Bitte korrigieren Sie alle markierten Fehler und versuchen Sie es erneut');
		} else if(!$scope.objiCategory.image) {
			showToast('Lade ein Bild hoch');
		} else {

      $scope.isSavingiCategory = true;

			iCategory.update($scope.objiCategory).then(function (icategory) {
				showToast('Kategorie aktualisiert');
				$mdDialog.hide();
        $scope.isSavingiCategory = false;
			}, function (error) {
				showToast(error.message);
        $scope.isSavingiCategory = false;
			});
		}
	}

});
