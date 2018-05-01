'use strict';

 angular.module('nearPlaceApp')
 .controller('EventCtrl',
 function ($scope, $mdDialog, $mdToast, Event, eCategory, Auth) {

 	// Pagination options
 	$scope.rowOptions = [10, 20, 40];

  $scope.query = {
 		filter: '',
 		limit: 40,
 		page: 1,
 		total: 0,
    status: null,
    icategory: null,
    date: null
 	};

 	$scope.events = [];

 	var showSimpleToast = function (message) {
 	  $mdToast.show(
 	    $mdToast.simple()
 		  .content(message)
 		  .action('OK')
 		  .hideDelay(3000)
 	  );
 	};

 	var loadEvents = function () {
    Auth.ensureLoggedIn().then(function () {
 		  $scope.promise = Event.all($scope.query).then(function (events) {
 			  $scope.events = events;
 		  });
    });
 	};

 	loadEvents();

  var loadCount = function () {
    Auth.ensureLoggedIn().then(function () {
      Event.count($scope.query).then(function (total) {
   		  $scope.query.total = total;
   	  });
    });
  }

  loadCount();

  var loadeCategories = function () {
    var params = {
      page: 1, limit: 1000, filter: '', order: 'title'
    }

    Auth.ensureLoggedIn().then(function () {
      eCategory.all(params).then(function (ecategories) {
        $scope.ecategories = ecategories;
      });
    });
  }

  loadeCategories();
  
  

  $scope.onQueryChange = function () {
    $scope.query.page = 1;
 		$scope.query.total = 0;
 		loadEvents();
    loadCount();
  }

 	$scope.onCreateEvent = function (ev) {

 		$mdDialog.show({
 			controller: 'DialogEventController',
 			templateUrl: '/views/partials/evente.html',
 			parent: angular.element(document.body),
 			targetEvent: ev,
 			locals: {
 				evente: null
 			},
 			clickOutsideToClose: true
 		})
 		.then(function (answer) {
 			loadEvents();
      loadCount();
 		});
 	};

 	$scope.onPaginationChange = function (page, limit) {
 		$scope.query.page = page;
 		$scope.query.limit = limit;
 		loadEvents();
 	};

 	$scope.openMenu = function ($mdOpenMenu, ev) {
 		$mdOpenMenu(ev);
 	};

  $scope.isDate = function (date) {
    return angular.isDate(date);
  }

  $scope.onUpdateExpiresAt = function (ev, evente) {

    $mdDialog.show({
      controller: 'DialogEventExpiresAtController',
      templateUrl: '/views/partials/expiration-modal.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: true,
      locals: {
        evente: evente
      }
    });

  }

 	$scope.onUpdateEvent = function (ev, evente) {

    var objEvent = angular.copy(evente);

 		$mdDialog.show({
 		  controller: 'DialogEventController',
 		  templateUrl: '/views/partials/evente.html',
 		  parent: angular.element(document.body),
	    targetEvent: ev,
	    locals: {
        evente: objEvent
      },
 		  clickOutsideToClose: true
 		});
 	};

 	$scope.onDestroyEvent = function (ev, evente) {

 	  var confirm = $mdDialog.confirm()
	    .title('Best√§tige Aktion')
	    .content('Bist du sicher, dass du diese Veranstaltung l√∂schen m√∂chtest?')
	 	  .ok('L√∂schen')
	 	  .cancel('Zur√ºck')
	 	  .targetEvent(ev);

 	  $mdDialog.show(confirm).then(function () {

   		Event.destroy(evente).then(function (success) {
   		  showSimpleToast('Veranstaltung gel√∂scht.');
   		  loadEvents();
        loadCount();
   	    },
   	    function (error) {
   		  showSimpleToast(error.message);
   		});

 	  });
 	};

  $scope.onUpdateIsApproved = function (evente, isApproved) {

    evente.isApproved = isApproved;
    evente.unset('expiresAt');

    Event.update(evente).then(function (success) {
      showSimpleToast('Ort aktualisiert');
    }, function (error) {
      showSimpleToast('Es gab einen Fehler');
    });

  };

 }).controller('DialogEventController', function(
 	$scope, $mdDialog, $mdToast, Event, eCategory, File, NgMap, GeoCoder, evente) {

 	var marker, map;

 	$scope.ecategories = [];
	
 	$scope.evente = {};
  $scope.evente.icategory = null;
  $scope.evente.website = 'http://';
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

 	if (evente) {

 		$scope.evente = evente;
    if ($scope.evente.image) {
      $scope.imageOneFilename = $scope.evente.image.name();
    }

    if ($scope.evente.imageTwo) {
      $scope.imageTwoFilename = $scope.evente.imageTwo.name();
    }

    if ($scope.evente.imageThree) {
      $scope.imageThreeFilename = $scope.evente.imageThree.name();
    }

    if ($scope.evente.imageFour) {
      $scope.imageFourFilename = $scope.evente.imageFour.name();
    }

    $scope.input.latitude = evente.location.latitude;
    $scope.input.longitude = evente.location.longitude;

 		$scope.isCreating = false;
 	}

 	eCategory.all({ page: 1, limit: 1000, filter: '' })
  .then(function (ecategories) {
    $scope.ecategories = ecategories;
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
    GeoCoder.geocode({ address: $scope.evente.address }).then(function (result) {

      if (map) {

        var location = result[0].geometry.location;
        location = new google.maps.LatLng(location.lat(), location.lng());

        map.setCenter(location);
        map.setZoom(15);

        marker.setPosition(location);

        $scope.evente.location = new Parse.GeoPoint({
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

    if (evente) {

      var eventLoication = new google.maps.LatLng(
        evente.location.latitude,
        evente.location.longitude);

      map.setCenter(eventLoication)
      marker.setPosition(eventLoication);
      map.setZoom(15);
    } else {
      map.setZoom(1);
      map.setCenter(new google.maps.LatLng(0, 0));
    }
  });


  $scope.onMarkerDragEnd = function (ev) {

    var lat = ev.latLng.lat();
    var lng = ev.latLng.lng();

    $scope.evente.location = new Parse.GeoPoint({
      latitude: lat,
      longitude: lng
    });

    $scope.input.latitude = lat;
    $scope.input.longitude = lng;
  };

  $scope.onInputLoicationChanged = function () {

    if ($scope.input.latitude && $scope.input.longitude && map) {

      $scope.evente.location = new Parse.GeoPoint({
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

        $scope.evente.image = savedFile;
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

        $scope.evente.imageTwo = savedFile;
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

        $scope.evente.imageThree = savedFile;
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

        $scope.evente.imageFour = savedFile;
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

 	$scope.onSaveEvent = function (isFormValid) {

 		if (!isFormValid) {
 			showSimpleToast('Bitte korrigieren Sie alle markierten Fehler und versuchen Sie es erneut');
 		} else if (!$scope.evente.image) {
 			showSimpleToast('Laden Sie mindestens das erste Bild hoch');
 		}   else if (!$scope.evente.location) {
 			showSimpleToast('Standortauswahl ist erforderlich')
 		}
 		else {

      $scope.isSavingEvent = true;

 			Event.create($scope.evente).then(function (evente) {
 				showSimpleToast('gespeichert');
 				$mdDialog.hide();
        $scope.isSavingEvent = false;
 			},
 			function (error) {
 				showSimpleToast(error.message);
        $scope.isSavingEvent = false;
 			});
 		}
 	};

 	$scope.onUpdateEvent = function (isFormValid) {

 		if(!isFormValid) {
 			showSimpleToast('Bitte korrigieren Sie alle markierten Fehler und versuchen Sie es erneut');
 		} else {

      $scope.isSavingEvent = true;

 			Event.update($scope.evente).then(function (evente) {
 				showSimpleToast('aktualisiert');
 				$mdDialog.hide();
        $scope.isSavingEvent = false;
 			},
 			function (error) {
 				showSimpleToast(error.message);
        $scope.isSavingEvent = false;
 			});

 		}
 	};

}).controller('DialogEventExpiresAtController',
function($scope, $mdDialog, $mdToast, Event, evente) {

  $scope.evente = evente;
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
    evente.expiresAt = expiresAt;
    evente.isApproved = true;

    $scope.isSavingExpiresAt = true;

    Event.update(evente).then(function (success) {
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
          var transformedInput = text.reevent(/[^0-9]/g, '');

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
