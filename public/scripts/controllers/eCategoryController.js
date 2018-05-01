'use strict';

 angular.module('nearPlaceApp')
 .controller('eCategoryCtrl', function ($scope, $mdDialog, eCategory, Auth) {

 	// Pagination options.
 	$scope.rowOptions = [10, 20, 40];

 	$scope.query = {
 		filter: '',
 		limit: 40,
 		page: 1,
 		total: 0
 	};

 	$scope.ecategories = [];

 	var loadeCategories = function() {
    Auth.ensureLoggedIn().then(function () {
 		  $scope.promise = eCategory.all($scope.query).then(function(ecategories) {
 			  $scope.ecategories = ecategories;
 		  });
    });
 	}

 	loadeCategories();
	

  var loadCount = function () {
    Auth.ensureLoggedIn().then(function () {
      eCategory.count($scope.query).then(function(total) {
   		  $scope.query.total = total;
   	  });
    });
  }

  loadCount();

 	$scope.onSearch = function () {
 		$scope.query.page = 1;
 		$scope.query.total = 0;
 		loadeCategories();
    loadCount();
 	};

 	$scope.onPaginationChange = function (page, limit) {
 		$scope.query.page = page;
 		$scope.query.limit = limit;
 		loadeCategories();
 	};

 	$scope.openMenu = function ($mdOpenMenu, ev) {
 		$mdOpenMenu(ev);
 	};

 	$scope.onNeweCategory = function (ev) {

 		$mdDialog.show({
 			controller: 'DialogeCategoryController',
 			templateUrl: '/views/partials/ecategory.html',
 			parent: angular.element(document.body),
 			targetEvent: ev,
 			locals: {
 				ecategory: null
 			},
 			clickOutsideToClose: true
 		})
 		.then(function(answer) {
 			loadeCategories();
      loadCount();
 		});
 	}

 	$scope.onEditeCategory = function (ev, ecategory) {

 		$mdDialog.show({
 			controller: 'DialogeCategoryController',
 			templateUrl: '/views/partials/ecategory.html',
 			parent: angular.element(document.body),
 			targetEvent: ev,
 			locals: {
 				ecategory: angular.copy(ecategory)
 			},
 			clickOutsideToClose: true
 		})
 		.then(function(answer) {
 			loadeCategories();
 		});
 	}

 	$scope.onDestroyeCategory = function(ev, ecategory) {

 		var confirm = $mdDialog.confirm()
	 		.title('Aktion bestätigen')
	 		.content('Sind Sie sicher, dass Sie diese Kategorie löschen möchten? Orte dieser Kategorie werden gelöscht.')
	 		.ok('Löschen')
	 		.cancel('zurück')
	 		.targetEvent(ev);

 		$mdDialog.show(confirm).then(function() {

 			eCategory.destroy(ecategory.id).then(function(success) {
 				loadeCategories();
        loadCount();
 			}, function (error) {
 				showSimpleToast(error.message);
 			});

 		});


 	}

}).controller('DialogeCategoryController',
function($scope, $mdDialog, $mdToast, eCategory, File, ecategory) {

	$scope.isCreating = false;
	$scope.isUploading = false;
  $scope.isUploadingIcon = false;
	$scope.imageFilename = '';
  $scope.iconFilename = '';

	if (ecategory) {

		$scope.isCreating = false;
		$scope.imageFilename = ecategory.image.name();

    if (ecategory.icon) {
      $scope.iconFilename = ecategory.icon.name();
    }

		$scope.objeCategory = ecategory;

	} else {

		$scope.objeCategory = {};
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
        $scope.objeCategory.image = savedFile;
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
        $scope.objeCategory.icon = savedFile;
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

	$scope.onSaveeCategory = function (isFormValid) {

		if(!isFormValid) {
			showToast('Bitte korrigieren Sie alle markierten Fehler und versuchen Sie es erneut');
			return;

		}  else {
      $scope.isSavingeCategory = true;

			eCategory.create($scope.objeCategory).then(function (ecategory) {
				showToast('Kategorie gespeichert');
				$mdDialog.hide();
        $scope.isSavingeCategory = false;
			}, function (error) {
				showToast(error.message);
        $scope.isSavingeCategory = false;
			});
		}

	};

	$scope.onUpdateeCategory = function (isFormValid) {

		if(!isFormValid) {
			showToast('Bitte korrigieren Sie alle markierten Fehler und versuchen Sie es erneut');
		} else if(!$scope.objeCategory.image) {
			showToast('Lade ein Bild hoch');
		} else {

      $scope.isSavingeCategory = true;

			eCategory.update($scope.objeCategory).then(function (ecategory) {
				showToast('Kategorie aktualisiert');
				$mdDialog.hide();
        $scope.isSavingeCategory = false;
			}, function (error) {
				showToast(error.message);
        $scope.isSavingeCategory = false;
			});
		}
	}

});
