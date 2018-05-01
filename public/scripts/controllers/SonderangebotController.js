'use strict';

 angular.module('nearPlaceApp')
 .controller('SonderangebotCtrl',
 function ($scope, $mdDialog, $mdToast, Sonderangebot, sCategory, Auth) {

 	// Pagination options
 	$scope.rowOptions = [10, 20, 40];

  $scope.query = {
 		filter: '',
 		limit: 40,
 		page: 1,
 		total: 0,
    status: null,
    scategory: null,
    date: null
 	};
	
 	$scope.sonderangebote = [];

 	var showSimpleToast = function (message) {
 	  $mdToast.show(
 	    $mdToast.simple()
 		  .content(message)
 		  .action('OK')
 		  .hideDelay(3000)
 	  );
 	};

 	var loadSonderangebots = function () {
    Auth.ensureLoggedIn().then(function () {
 		  $scope.promise = Sonderangebot.all($scope.query).then(function (sonderangebote) {
 			  $scope.sonderangebote = sonderangebote;
 		  });
    });
 	};

 	loadSonderangebots();

  var loadCount = function () {
    Auth.ensureLoggedIn().then(function () {
      Sonderangebot.count($scope.query).then(function (total) {
   		  $scope.query.total = total;
   	  });
    });
  }

  loadCount();

  var loadsCategories = function () {
    var params = {
      page: 1, limit: 1000, filter: '', order: 'title'
    }

    Auth.ensureLoggedIn().then(function () {
      sCategory.all(params).then(function (scategories) {
        $scope.scategories = scategories;
      });
    });
  }

  loadsCategories();

  $scope.onQueryChange = function () {
    $scope.query.page = 1;
 		$scope.query.total = 0;
 		loadSonderangebots();
    loadCount();
  }

 	$scope.onCreateSonderangebot = function (ev) {

 		$mdDialog.show({
 			controller: 'DialogSonderangebotController',
 			templateUrl: '/views/partials/sonderangebot.html',
 			parent: angular.element(document.body),
 			targetEvent: ev,
 			locals: {
 				sonderangebot: null
 			},
 			clickOutsideToClose: true
 		})
 		.then(function (answer) {
 			loadSonderangebots();
      loadCount();
 		});
 	};

 	$scope.onPaginationChange = function (page, limit) {
 		$scope.query.page = page;
 		$scope.query.limit = limit;
 		loadSonderangebots();
 	};

 	$scope.openMenu = function ($mdOpenMenu, ev) {
 		$mdOpenMenu(ev);
 	};

  $scope.isDate = function (date) {
    return angular.isDate(date);
  }

  $scope.onUpdateExpiresAt = function (ev, sonderangebot) {

    $mdDialog.show({
      controller: 'DialogSonderangebotExpiresAtController',
      templateUrl: '/views/partials/expiration-modal.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: true,
      locals: {
        sonderangebot: sonderangebot
      }
    });

  }

 	$scope.onUpdateSonderangebot = function (ev, sonderangebot) {

    var objSonderangebot = angular.copy(sonderangebot);

 		$mdDialog.show({
 		  controller: 'DialogSonderangebotController',
 		  templateUrl: '/views/partials/sonderangebot.html',
 		  parent: angular.element(document.body),
	    targetEvent: ev,
	    locals: {
        sonderangebot: objSonderangebot
      },
 		  clickOutsideToClose: true
 		});
 	};

 	$scope.onDestroySonderangebot = function (ev, sonderangebot) {

 	  var confirm = $mdDialog.confirm()
	    .title('Best√§tige Aktion')
	    .content('Bist du sicher, dass du dieses Angebot l√∂schen m√∂chtest?')
	 	  .ok('L√∂schen')
	 	  .cancel('Zur√ºck')
	 	  .targetEvent(ev);

 	  $mdDialog.show(confirm).then(function () {

   		Sonderangebot.destroy(sonderangebot).then(function (success) {
   		  showSimpleToast('Angebot gel√∂scht.');
   		  loadSonderangebots();
        loadCount();
   	    },
   	    function (error) {
   		  showSimpleToast(error.message);
   		});

 	  });
 	};

  $scope.onUpdateIsApproved = function (sonderangebot, isApproved) {

    sonderangebot.isApproved = isApproved;
    sonderangebot.unset('expiresAt');

    Sonderangebot.update(sonderangebot).then(function (success) {
      showSimpleToast('Ort aktualisiert');
    }, function (error) {
      showSimpleToast('Es gab einen Fehler');
    });

  };

 }).controller('DialogSonderangebotController', function(
 	$scope, $mdDialog, $mdToast, Sonderangebot, sCategory, File, NgMap, GeoCoder, sonderangebot) {

 	var marker, map;

 	$scope.scategories = [];
 	$scope.sonderangebot = {};
  $scope.sonderangebot.scategory = null;
  $scope.sonderangebot.website = 'http://';
 	$scope.imageOneFilename = '';
 	$scope.imageTwoFilename = '';
 	$scope.imageThreeFilename = '';
 	$scope.imageFourFilename = '';
  $scope.input = {};

 	$scope.isCreating = true;
  $scope.isImageOneUploading = false;
  $scope.isImageTwoUploading = false;
  $scope.isImageThreeUploading = false;
  $scope.isImageFourUploading = false;

 	if (sonderangebot) {

 		$scope.sonderangebot = sonderangebot;
    if ($scope.sonderangebot.image) {
      $scope.imageOneFilename = $scope.sonderangebot.image.name();
    }

    if ($scope.sonderangebot.imageTwo) {
      $scope.imageTwoFilename = $scope.sonderangebot.imageTwo.name();
    }

    if ($scope.sonderangebot.imageThree) {
      $scope.imageThreeFilename = $scope.sonderangebot.imageThree.name();
    }

    if ($scope.sonderangebot.imageFour) {
      $scope.imageFourFilename = $scope.sonderangebot.imageFour.name();
    }

    $scope.input.latitude = sonderangebot.location.latitude;
    $scope.input.longitude = sonderangebot.location.longitude;

 		$scope.isCreating = false;
 	}

 	sCategory.all({ page: 1, limit: 1000, filter: '' })
  .then(function (scategories) {
    $scope.scategories = scategories;
  });

 	var showSimpleToast = function (message) {
 		$mdToast.show(
 			$mdToast.simple()
 			.content(message)
 			.action('OK')
 			.hideDelay(3000)
 		);
 	};

  $scope.onAddressChanged = function () {
    GeoCoder.geocode({ address: $scope.sonderangebot.address }).then(function (result) {

      if (map) {

        var location = result[0].geometry.location;
        location = new google.maps.LatLng(location.lat(), location.lng());

        map.setCenter(location);
        map.setZoom(15);

        marker.setPosition(location);

        $scope.sonderangebot.location = new Parse.GeoPoint({
          latitude: location.lat(),
          longitude: location.lng()
        });

        $scope.input.latitude = location.lat();
        $scope.input.longitude = location.lng();
      }
    });
  }

  NgMap.getMap().then(function (objMap) {

    map = objMap;
    marker = map.markers[0];

    // Fix gray area in second render
    google.maps.event.trigger(map,'resize');

    if (sonderangebot) {

      var sonderangebotLoscation = new google.maps.LatLng(
        sonderangebot.location.latitude,
        sonderangebot.location.longitude);

      map.setCenter(sonderangebotLoscation)
      marker.setPosition(sonderangebotLoscation);
      map.setZoom(15);
    } else {
      map.setZoom(1);
      map.setCenter(new google.maps.LatLng(0, 0));
    }
  });


  $scope.onMarkerDragEnd = function (ev) {

    var lat = ev.latLng.lat();
    var lng = ev.latLng.lng();

    $scope.sonderangebot.location = new Parse.GeoPoint({
      latitude: lat,
      longitude: lng
    });

    $scope.input.latitude = lat;
    $scope.input.longitude = lng;
  };

  $scope.onInputLoscationChanged = function () {

    if ($scope.input.latitude && $scope.input.longitude && map) {

      $scope.sonderangebot.location = new Parse.GeoPoint({
        latitude: $scope.input.latitude,
        longitude: $scope.input.longitude
      });

      marker.setPosition(new google.maps.LatLng(
        $scope.input.latitude,
        $scope.input.longitude
      ));

      map.setCenter(new google.maps.LatLng(
        $scope.input.latitude,
        $scope.input.longitude
      ));

      map.setZoom(12);
    }
  }

 	$scope.uploadImageOne = function (file, invalidFile) {

    if (file) {

      $scope.isImageOneUploading = true;
      $scope.imageOneFilename = file.name;

 		  File.upload(file).then(function (savedFile) {

        $scope.sonderangebot.image = savedFile;
        $scope.isImageOneUploading = false;
        showSimpleToast('Bild hochgeladen');
 		  },
      function (error) {
        $scope.isImageOneUploading = false;
        showSimpleToast(error.message);
 		  });

    } else {
      if (invalidFile) {
        if (invalidFile.$error === 'maxSize') {
          showSimpleToast('Bild zu groﬂ Max ' + invalidFile.$errorParam);
        }
      }
    }
 	};

  $scope.uploadImageTwo = function (file, invalidFile) {

    if (file) {

      $scope.isImageTwoUploading = true;
      $scope.imageTwoFilename = file.name;

 		  File.upload(file).then(function (savedFile) {

        $scope.sonderangebot.imageTwo = savedFile;
        $scope.isImageTwoUploading = false;
        showSimpleToast('Bild hochgeladen');
 		  },
      function (error) {
        $scope.isImageTwoUploading = false;
        showSimpleToast(error.message);
 		  });

    } else {
      if (invalidFile) {
        if (invalidFile.$error === 'maxSize') {
          showSimpleToast('Bild zu groﬂ Max ' + invalidFile.$errorParam);
        }
      }
    }
 	}

  $scope.uploadImageThree = function (file, invalidFile) {

    if (file) {

      $scope.isImageThreeUploading = true;
      $scope.imageThreeFilename = file.name;

 		  File.upload(file).then(function (savedFile) {

        $scope.sonderangebot.imageThree = savedFile;
        $scope.isImageThreeUploading = false;
        showSimpleToast('Bild hochgeladen');
 		  },
      function (error) {
        $scope.isImageThreeUploading = false;
        showSimpleToast(error.message);
 		  });
 	  } else {
      if (invalidFile) {
        if (invalidFile.$error === 'maxSize') {
          showSimpleToast('Bild zu groﬂ Max ' + invalidFile.$errorParam);
        }
      }
    }
 	}

  $scope.uploadImageFour = function (file, invalidFile) {

    if (file) {

      $scope.isImageFourUploading = true;
      $scope.imageFourFilename = file.name;

 		  File.upload(file).then(function (savedFile) {

        $scope.sonderangebot.imageFour = savedFile;
        $scope.isImageFourUploading = false;
        showSimpleToast('Bild hochgeladen');
 		  },
      function (error) {
        $scope.isImageFourUploading = false;
        showSimpleToast(error.message);
 		  });
 	  } else {
      if (invalidFile) {
        if (invalidFile.$error === 'maxSize') {
          showSimpleToast('Bild zu groﬂ Max ' + invalidFile.$errorParam);
        }
      }
    }
 	}

 	$scope.hide = function() {
 	  $mdDialog.cancel();
 	};

 	$scope.cancel = function() {
 	  $mdDialog.cancel();
 	};

 	$scope.onSaveSonderangebot = function (isFormValid) {

 		if (!isFormValid) {
 			showSimpleToast('Bitte korrigieren Sie alle markierten Fehler und versuchen Sie es erneut');
 		} else if (!$scope.sonderangebot.image) {
 			showSimpleToast('Laden Sie mindestens das erste Bild hoch');
 		}   else if (!$scope.sonderangebot.location) {
 			showSimpleToast('Standortauswahl ist erforderlich')
 		}
 		else {

      $scope.isSavingSonderangebot = true;

 			Sonderangebot.create($scope.sonderangebot).then(function (sonderangebot) {
 				showSimpleToast('gespeichert');
 				$mdDialog.hide();
        $scope.isSavingSonderangebot = false;
 			},
 			function (error) {
 				showSimpleToast(error.message);
        $scope.isSavingSonderangebot = false;
 			});
 		}
 	};

 	$scope.onUpdateSonderangebot = function (isFormValid) {

 		if(!isFormValid) {
 			showSimpleToast('Bitte korrigieren Sie alle markierten Fehler und versuchen Sie es erneut');
 		} else {

      $scope.isSavingSonderangebot = true;

 			Sonderangebot.update($scope.sonderangebot).then(function (sonderangebot) {
 				showSimpleToast('aktualisiert');
 				$mdDialog.hide();
        $scope.isSavingSonderangebot = false;
 			},
 			function (error) {
 				showSimpleToast(error.message);
        $scope.isSavingSonderangebot = false;
 			});

 		}
 	};

}).controller('DialogSonderangebotExpiresAtController',
function($scope, $mdDialog, $mdToast, Sonderangebot, sonderangebot) {

  $scope.sonderangebot = sonderangebot;
  $scope.formData = {};

  var showToast = function (message) {
 		$mdToast.show(
 			$mdToast.simple()
 			.content(message)
 			.action('OK')
 			.hideDelay(3000)
 		);
 	};

  $scope.isDayInvalid = function () {
    var days = $scope.formData.days;

    if (days) {
      days = parseInt(days, 10);
      return days < 1;
    }
    return true;
  }
  
  $scope.onUpdateExpiresAt = function () {

    var expiresAt = moment().add($scope.formData.days, 'days').toDate();
    sonderangebot.expiresAt = expiresAt;
    sonderangebot.isApproved = true;

    $scope.isSavingExpiresAt = true;

    Sonderangebot.update(sonderangebot).then(function (success) {
      $scope.isSavingExpiresAt = false;
      showToast('aktualisiert');
      $scope.hide();
    },
    function (error) {
      $scope.isSavingExpiresAt = false;
      showToast('Es gab einen Fehler');
    });
  }

  $scope.hide = function() {
    $mdDialog.hide();
  };

}).directive('numbersOnly', function () {
  return {
    require: 'ngModel',
    link: function (scope, element, attr, ngModelCtrl) {
      function fromUser(text) {
        if (text) {
          var transformedInput = text.resonderangebot(/[^0-9]/g, '');

          if (transformedInput !== text) {
            ngModelCtrl.$setViewValue(transformedInput);
            ngModelCtrl.$render();
          }
          return transformedInput;
        }
        return undefined;
      }
      ngModelCtrl.$parsers.push(fromUser);
    }
  };
});
