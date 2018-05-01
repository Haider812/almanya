'use strict';

 angular.module('nearPlaceApp')
 .controller('sCategoryCtrl', function ($scope, $mdDialog, sCategory, Auth) {

 	// Pagination options.
 	$scope.rowOptions = [10, 20, 40];

 	$scope.query = {
 		filter: '',
 		limit: 40,
 		page: 1,
 		total: 0
 	};
	
 	$scope.scategories = [];

 	var loadsCategories = function() {
    Auth.ensureLoggedIn().then(function () {
 		  $scope.promise = sCategory.all($scope.query).then(function(scategories) {
 			  $scope.scategories = scategories;
 		  });
    });
 	}
			
 	loadsCategories();	

  var loadCount = function () {
    Auth.ensureLoggedIn().then(function () {
      sCategory.count($scope.query).then(function(total) {
   		  $scope.query.total = total;
   	  });
    });
  }

  loadCount();

 	$scope.onSearch = function () {
 		$scope.query.page = 1;
 		$scope.query.total = 0;
 		loadsCategories();
    loadCount();
 	}
	
 	$scope.onPaginationChange = function (page, limit) {
 		$scope.query.page = page;
 		$scope.query.limit = limit;
 		loadsCategories();
 	};

	$scope.openMenu = function ($mdOpenMenu, ev) {
 		$mdOpenMenu(ev);
 	};
	
 	$scope.onNewsCategory = function (ev) {

 		$mdDialog.show({
 			controller: 'DialogsCategoryController',
 			templateUrl: '/views/partials/scategory.html',
 			parent: angular.element(document.body),
 			targetEvent: ev,
 			locals: {
 				scategory: null
 			},
 			clickOutsideToClose: true
 		})
 		.then(function(answer) {
 			loadsCategories();
      loadCount();
 		});
 	}

 	$scope.onEditsCategory = function (ev, scategory) {

 		$mdDialog.show({
 			controller: 'DialogsCategoryController',
 			templateUrl: '/views/partials/scategory.html',
 			parent: angular.element(document.body),
 			targetEvent: ev,
 			locals: {
 				scategory: angular.copy(scategory)
 			},
 			clickOutsideToClose: true
 		})
 		.then(function(answer) {
 			loadsCategories();
 		});
 	}
	
 	$scope.onDestroysCategory = function(ev, scategory) {

 		var confirm = $mdDialog.confirm()
	 		.title('Aktion bestätigen')
	 		.content('Sind Sie sicher, dass Sie diese Kategorie löschen möchten? Orte dieser Kategorie werden gelöscht.')
	 		.ok('Löschen')
	 		.cancel('zurück')
	 		.targetEvent(ev);

 		$mdDialog.show(confirm).then(function() {

 			sCategory.destroy(scategory.id).then(function(success) {
 				loadsCategories();
        loadCount();
 			}, function (error) {
 				showSimpleToast(error.message);
 			});

 		});


 	}

}).controller('DialogsCategoryController',
function($scope, $mdDialog, $mdToast, sCategory, File, scategory) {

	$scope.isCreating = false;
	$scope.isUploading = false;
  $scope.isUploadingIcon = false;
	$scope.imageFilename = '';
  $scope.iconFilename = '';

	if (scategory) {

		$scope.isCreating = false;
		$scope.imageFilename = scategory.image.name();
	
    if (scategory.icon) {
      $scope.iconFilename = scategory.icon.name();
    }

		$scope.objsCategory = scategory;

	} else {

		$scope.objsCategory = {};
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

	var showSimpleToast = function (message) {
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
	
	$scope.uploadImage = function(file) {

      if (file === null) {		 
        return;
      } else if (file.type.match(/image.*/) === null) {
        showSimpleToast('Datei wird nicht unterstützt');
        return;
      } else if (file.$error) {
        showSimpleToast('Datei zu groß. Max. 2MB');
      } else {
        $scope.imageFilename = file.name;
        $scope.isUploading = true;

        File.upload(file).then(function(savedFile) {
          $scope.objsCategory.image = savedFile;
          $scope.isUploading = false;
          showSimpleToast('Datei hochgeladen');
        }, function(error) {
          showSimpleToast(error.message);
          $scope.isUploading = false;
          $scope.objsCategory.image = null;

        });
      }
    }

  $scope.uploadIcon = function (file, invalidFile) {

    if (file) {
      $scope.iconFilename = file.name;
			$scope.isUploadingIcon = true;

			File.upload(file).then(function (savedFile) {
        $scope.objsCategory.icon = savedFile;
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

	$scope.onSavesCategory = function (isFormValid) {

		if(!isFormValid) {
			showToast('Bitte korrigieren Sie alle markierten Fehler und versuchen Sie es erneut');
			return;

		}  else {
      $scope.isSavingsCategory = true;

			sCategory.create($scope.objsCategory).then(function (scategory) {
				showToast('Kategorie gespeichert');
				$mdDialog.hide();
        $scope.isSavingsCategory = false;
			}, function (error) {
				showToast(error.message);
        $scope.isSavingsCategory = false;
			});
		}

	};

	$scope.onUpdatesCategory = function (isFormValid) {

		if(!isFormValid) {
			showToast('Bitte korrigieren Sie alle markierten Fehler und versuchen Sie es erneut');
		} else if(!$scope.objsCategory.image) {
			showToast('Lade ein Bild hoch');
		} else {

      $scope.isSavingsCategory = true;

			sCategory.update($scope.objsCategory).then(function (scategory) {
				showToast('Kategorie aktualisiert');
				$mdDialog.hide();
        $scope.isSavingsCategory = false;
			}, function (error) {
				showToast(error.message);
        $scope.isSavingsCategory = false;
			});
		}
	}

});
