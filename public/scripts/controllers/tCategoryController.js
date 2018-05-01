'use strict';

 angular.module('nearPlaceApp')
 .controller('tCategoryCtrl', function ($scope, $mdDialog, tCategory, Auth) {

 	// Pagination options.
 	$scope.rowOptions = [10, 20, 40];

 	$scope.query = {
 		filter: '',
 		limit: 40,
 		page: 1,
 		total: 0
 	};

 	$scope.tcategories = [];

 	var loadtCategories = function() {
    Auth.ensureLoggedIn().then(function () {
 		  $scope.promise = tCategory.all($scope.query).then(function(tcategories) {
 			  $scope.tcategories = tcategories;
 		  });
    });
 	}

 	loadtCategories();
	

  var loadCount = function () {
    Auth.ensureLoggedIn().then(function () {
      tCategory.count($scope.query).then(function(total) {
   		  $scope.query.total = total;
   	  });
    });
  }

  loadCount();

 	$scope.onSearch = function () {
 		$scope.query.page = 1;
 		$scope.query.total = 0;
 		loadtCategories();
    loadCount();
 	};

 	$scope.onPaginationChange = function (page, limit) {
 		$scope.query.page = page;
 		$scope.query.limit = limit;
 		loadtCategories();
 	};

 	$scope.openMenu = function ($mdOpenMenu, ev) {
 		$mdOpenMenu(ev);
 	};

 	$scope.onNewtCategory = function (ev) {

 		$mdDialog.show({
 			controller: 'DialogtCategoryController',
 			templateUrl: '/views/partials/tcategory.html',
 			parent: angular.element(document.body),
 			targetEvent: ev,
 			locals: {
 				tcategory: null
 			},
 			clickOutsideToClose: true
 		})
 		.then(function(answer) {
 			loadtCategories();
      loadCount();
 		});
 	}

 	$scope.onEdittCategory = function (ev, tcategory) {

 		$mdDialog.show({
 			controller: 'DialogtCategoryController',
 			templateUrl: '/views/partials/tcategory.html',
 			parent: angular.element(document.body),
 			targetEvent: ev,
 			locals: {
 				tcategory: angular.copy(tcategory)
 			},
 			clickOutsideToClose: true
 		})
 		.then(function(answer) {
 			loadtCategories();
 		});
 	}

 	$scope.onDestroytCategory = function(ev, tcategory) {

 		var confirm = $mdDialog.confirm()
	 		.title('Aktion bestätigen')
	 		.content('Sind Sie sicher, dass Sie diese Kategorie löschen möchten? Orte dieser Kategorie werden gelöscht.')
	 		.ok('Löschen')
	 		.cancel('zurück')
	 		.targetEvent(ev);

 		$mdDialog.show(confirm).then(function() {

 			tCategory.destroy(tcategory.id).then(function(success) {
 				loadtCategories();
        loadCount();
 			}, function (error) {
 				showSimpleToast(error.message);
 			});

 		});


 	}

}).controller('DialogtCategoryController',
function($scope, $mdDialog, $mdToast, tCategory, File, tcategory) {

	$scope.isCreating = false;
	$scope.isUploading = false;
  $scope.isUploadingIcon = false;
	$scope.imageFilename = '';
  $scope.iconFilename = '';

	if (tcategory) {

		$scope.isCreating = false;
		$scope.imageFilename = tcategory.image.name();

    if (tcategory.icon) {
      $scope.iconFilename = tcategory.icon.name();
    }

		$scope.objtCategory = tcategory;

	} else {

		$scope.objtCategory = {};
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
        $scope.objtCategory.image = savedFile;
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
        $scope.objtCategory.icon = savedFile;
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

	$scope.onSavetCategory = function (isFormValid) {

		if(!isFormValid) {
			showToast('Bitte korrigieren Sie alle markierten Fehler und versuchen Sie es erneut');
			return;

		}  else {
      $scope.isSavingtCategory = true;

			tCategory.create($scope.objtCategory).then(function (tcategory) {
				showToast('Kategorie gespeichert');
				$mdDialog.hide();
        $scope.isSavingtCategory = false;
			}, function (error) {
				showToast(error.message);
        $scope.isSavingtCategory = false;
			});
		}

	};

	$scope.onUpdatetCategory = function (isFormValid) {

		if(!isFormValid) {
			showToast('Bitte korrigieren Sie alle markierten Fehler und versuchen Sie es erneut');
		} else if(!$scope.objtCategory.image) {
			showToast('Lade ein Bild hoch');
		} else {

      $scope.isSavingtCategory = true;

			tCategory.update($scope.objtCategory).then(function (tcategory) {
				showToast('Kategorie aktualisiert');
				$mdDialog.hide();
        $scope.isSavingtCategory = false;
			}, function (error) {
				showToast(error.message);
        $scope.isSavingtCategory = false;
			});
		}
	}

});
