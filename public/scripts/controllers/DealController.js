'use strict';

 angular.module('nearPlaceApp')
 .controller('DealCtrl',
 function ($scope, $mdDialog, $mdToast, Deal, Category, Auth) {

 	// Pagination options
 	$scope.rowOptions = [10, 20, 40];

  $scope.query = {
 		filter: '',
 		limit: 40,
 		page: 1,
 		total: 0,
    status: null,
    category: null,
    date: null
 	};

 	$scope.deals = [];

 	var showSimpleToast = function (message) {
 	  $mdToast.show(
 	    $mdToast.simple()
 		  .content(message)
 		  .action('OK')
 		  .hideDelay(3000)
 	  );
 	};

 	var loadDeals = function () {
    Auth.ensureLoggedIn().then(function () {
 		  $scope.promise = Deal.all($scope.query).then(function (deals) {
 			  $scope.deals = deals;
 		  });
    });
 	};

 	loadDeals();

  var loadCount = function () {
    Auth.ensureLoggedIn().then(function () {
      Deal.count($scope.query).then(function (total) {
   		  $scope.query.total = total;
   	  });
    });
  }

  loadCount();

  var loadCategories = function () {
    var params = {
      page: 1, limit: 1000, filter: '', order: 'title'
    }

    Auth.ensureLoggedIn().then(function () {
      Category.all(params).then(function (categories) {
        $scope.categories = categories;
      });
    });
  }

  loadCategories();

  $scope.onQueryChange = function () {
    $scope.query.page = 1;
 		$scope.query.total = 0;
 		loadDeals();
    loadCount();
  }

 	$scope.onCreateDeal = function (ev) {

 		$mdDialog.show({
 			controller: 'DialogDealController',
 			templateUrl: '/views/partials/deal.html',
 			parent: angular.element(document.body),
 			targetEvent: ev,
 			locals: {
 				deal: null
 			},
 			clickOutsideToClose: true
 		})
 		.then(function (answer) {
 			loadDeals();
      loadCount();
 		});
 	};

 	$scope.onPaginationChange = function (page, limit) {
 		$scope.query.page = page;
 		$scope.query.limit = limit;
 		loadDeals();
 	};

 	$scope.openMenu = function ($mdOpenMenu, ev) {
 		$mdOpenMenu(ev);
 	};

  $scope.isDate = function (date) {
    return angular.isDate(date);
  }

  $scope.onUpdateExpiresAt = function (ev, deal) {

    $mdDialog.show({
      controller: 'DialogDealExpiresAtController',
      templateUrl: '/views/partials/expiration-modal.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: true,
      locals: {
        deal: deal
      }
    });

  }

 	$scope.onUpdateDeal = function (ev, deal) {

    var objDeal = angular.copy(deal);

 		$mdDialog.show({
 		  controller: 'DialogDealController',
 		  templateUrl: '/views/partials/deal.html',
 		  parent: angular.element(document.body),
	    targetEvent: ev,
	    locals: {
        deal: objDeal
      },
 		  clickOutsideToClose: true
 		});
 	};

 	$scope.onDestroyDeal = function (ev, deal) {

 	  var confirm = $mdDialog.confirm()
	    .title('Bestätige Aktion')
	    .content('Bist du sicher, dass du diesen Deal löschen möchtest?')
	 	  .ok('Löschen')
	 	  .cancel('Zurück')
	 	  .targetEvent(ev);

 	  $mdDialog.show(confirm).then(function () {

   		Deal.destroy(deal).then(function (success) {
   		  showSimpleToast('Deal gelöscht.');
   		  loadDeals();
        loadCount();
   	    },
   	    function (error) {
   		  showSimpleToast(error.message);
   		});

 	  });
 	};

  $scope.onUpdateIsApproved = function (deal, isApproved) {

    deal.isApproved = isApproved;
    deal.unset('expiresAt');

    Deal.update(deal).then(function (success) {
      showSimpleToast('Ort aktualisiert');
    }, function (error) {
      showSimpleToast('Es gab einen Fehler');
    });

  };

 }).controller('DialogDealController', function(
 	$scope, $mdDialog, $mdToast, Deal, Category, File, deal) {

 	var marker, map;

 	$scope.categories = [];
 	$scope.deal = {};
  $scope.deal.category = null;
  $scope.deal.website = 'http://';
 	$scope.imageOneFilename = '';
 	$scope.imageTwoFilename = '';
 	  $scope.input = {};

 	$scope.isCreating = true;
  $scope.isImageOneUploading = false;
  $scope.isImageTwoUploading = false;
  
 	if (deal) {

 		$scope.deal = deal;
    if ($scope.deal.image) {
      $scope.imageOneFilename = $scope.deal.image.name();
    }

    if ($scope.deal.imageTwo) {
      $scope.imageTwoFilename = $scope.deal.imageTwo.name();
    }

    
 		$scope.isCreating = false;
 	}

 	Category.all({ page: 1, limit: 1000, filter: '' })
  .then(function (categories) {
    $scope.categories = categories;
  });

 	var showSimpleToast = function (message) {
 		$mdToast.show(
 			$mdToast.simple()
 			.content(message)
 			.action('OK')
 			.hideDelay(3000)
 		);
 	};

  


  $scope.onMarkerDragEnd = function (ev) {

    var lat = ev.latLng.lat();
    var lng = ev.latLng.lng();

    $scope.deal.location = new Parse.GeoPoint({
      latitude: lat,
      longitude: lng
    });

    $scope.input.latitude = lat;
    $scope.input.longitude = lng;
  };

  $scope.onInputLocationChanged = function () {

    if ($scope.input.latitude && $scope.input.longitude && map) {

      $scope.deal.location = new Parse.GeoPoint({
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

        $scope.deal.image = savedFile;
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
          showSimpleToast('Bild zu groß Max ' + invalidFile.$errorParam);
        }
      }
    }
 	};

  $scope.uploadImageTwo = function (file, invalidFile) {

    if (file) {

      $scope.isImageTwoUploading = true;
      $scope.imageTwoFilename = file.name;

 		  File.upload(file).then(function (savedFile) {

        $scope.deal.imageTwo = savedFile;
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
          showSimpleToast('Bild zu groß Max ' + invalidFile.$errorParam);
        }
      }
    }
 	}

  $scope.uploadImageThree = function (file, invalidFile) {

    if (file) {

      $scope.isImageThreeUploading = true;
      $scope.imageThreeFilename = file.name;

 		  File.upload(file).then(function (savedFile) {

        $scope.deal.imageThree = savedFile;
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
          showSimpleToast('Bild zu groß Max ' + invalidFile.$errorParam);
        }
      }
    }
 	}

  $scope.uploadImageFour = function (file, invalidFile) {

    if (file) {

      $scope.isImageFourUploading = true;
      $scope.imageFourFilename = file.name;

 		  File.upload(file).then(function (savedFile) {

        $scope.deal.imageFour = savedFile;
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
          showSimpleToast('Bild zu groß Max ' + invalidFile.$errorParam);
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

 	$scope.onSaveDeal = function (isFormValid) {

 		if (!isFormValid) {
 			showSimpleToast('Bitte korrigieren Sie alle markierten Fehler und versuchen Sie es erneut');
 		} else if (!$scope.deal.image) {
 			showSimpleToast('Laden Sie mindestens das erste Bild hoch');
 		}  else if (!$scope.deal.location) {
 			showSimpleToast('Lage ist erforderlich')
 		}
 		else {

      $scope.isSavingDeal = true;

 			Deal.create($scope.deal).then(function (deal) {
 				showSimpleToast('gespeichert');
 				$mdDialog.hide();
        $scope.isSavingDeal = false;
 			},
 			function (error) {
 				showSimpleToast(error.message);
        $scope.isSavingDeal = false;
 			});
 		}
 	};

 	$scope.onUpdateDeal = function (isFormValid) {

 		if(!isFormValid) {
 			showSimpleToast('Bitte korrigieren Sie alle markierten Fehler und versuchen Sie es erneut');
 		} else {

      $scope.isSavingDeal = true;

 			Deal.update($scope.deal).then(function (deal) {
 				showSimpleToast('aktualisiert');
 				$mdDialog.hide();
        $scope.isSavingDeal = false;
 			},
 			function (error) {
 				showSimpleToast(error.message);
        $scope.isSavingDeal = false;
 			});

 		}
 	};

}).controller('DialogDealExpiresAtController',
function($scope, $mdDialog, $mdToast, Deal, deal) {

  $scope.deal = deal;
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
    deal.expiresAt = expiresAt;
    deal.isApproved = true;

    $scope.isSavingExpiresAt = true;

    Deal.update(deal).then(function (success) {
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
          var transformedInput = text.redeal(/[^0-9]/g, '');

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


/*  -------------------------------------------------------------Event Controller------------------------------------*/




'use strict';

 angular.module('nearPlaceApp')
 .controller('EvenementCtrl',
 function ($scope, $mdDialog, $mdToast, Evenement, Category, Auth) {

 	// Pagination options
 	$scope.rowOptions = [10, 20, 40];

  $scope.query = {
 		filter: '',
 		limit: 40,
 		page: 1,
 		total: 0,
    status: null,
    category: null,
    date: null
 	};

 	$scope.evenements = [];

 	var showSimpleToast = function (message) {
 	  $mdToast.show(
 	    $mdToast.simple()
 		  .content(message)
 		  .action('OK')
 		  .hideDelay(3000)
 	  );
 	};

 	var loadEvenements = function () {
    Auth.ensureLoggedIn().then(function () {
 		  $scope.promise = Evenement.all($scope.query).then(function (evenements) {
 			  $scope.evenements = evenements;
 		  });
    });
 	};

 	loadEvenements();

  var loadCount = function () {
    Auth.ensureLoggedIn().then(function () {
      Evenement.count($scope.query).then(function (total) {
   		  $scope.query.total = total;
   	  });
    });
  }

  loadCount();

  var loadCategories = function () {
    var params = {
      page: 1, limit: 1000, filter: '', order: 'title'
    }

    Auth.ensureLoggedIn().then(function () {
      Category.all(params).then(function (categories) {
        $scope.categories = categories;
      });
    });
  }

  loadCategories();

  $scope.onQueryChange = function () {
    $scope.query.page = 1;
 		$scope.query.total = 0;
 		loadEvenements();
    loadCount();
  }

 	$scope.onCreateEvenement = function (ev) {

 		$mdDialog.show({
 			controller: 'DialogEvenementController',
 			templateUrl: '/views/partials/evenement.html',
 			parent: angular.element(document.body),
 			targetEvent: ev,
 			locals: {
 				evenement: null
 			},
 			clickOutsideToClose: true
 		})
 		.then(function (answer) {
 			loadEvenements();
      loadCount();
 		});
 	};

 	$scope.onPaginationChange = function (page, limit) {
 		$scope.query.page = page;
 		$scope.query.limit = limit;
 		loadEvenements();
 	};

 	$scope.openMenu = function ($mdOpenMenu, ev) {
 		$mdOpenMenu(ev);
 	};

  $scope.isDate = function (date) {
    return angular.isDate(date);
  }

  $scope.onUpdateExpiresAt = function (ev, evenement) {

    $mdDialog.show({
      controller: 'DialogEvenementExpiresAtController',
      templateUrl: '/views/partials/expiration-modal.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: true,
      locals: {
        evenement: evenement
      }
    });

  }

 	$scope.onUpdateEvenement = function (ev, evenement) {

    var objEvenement = angular.copy(evenement);

 		$mdDialog.show({
 		  controller: 'DialogEvenementController',
 		  templateUrl: '/views/partials/evenement.html',
 		  parent: angular.element(document.body),
	    targetEvent: ev,
	    locals: {
        evenement: objEvenement
      },
 		  clickOutsideToClose: true
 		});
 	};

 	$scope.onDestroyEvenement = function (ev, evenement) {

 	  var confirm = $mdDialog.confirm()
	    .title('Bestätige Aktion')
	    .content('Bist du sicher, dass du diesen Ort löschen möchtest?')
	 	  .ok('Löschen')
	 	  .cancel('Zurück')
	 	  .targetEvent(ev);

 	  $mdDialog.show(confirm).then(function () {

   		Evenement.destroy(evenement).then(function (success) {
   		  showSimpleToast('Ort gelöscht.');
   		  loadEvenements();
        loadCount();
   	    },
   	    function (error) {
   		  showSimpleToast(error.message);
   		});

 	  });
 	};

  $scope.onUpdateIsApproved = function (evenement, isApproved) {

    evenement.isApproved = isApproved;
    evenement.unset('expiresAt');

    Evenement.update(evenement).then(function (success) {
      showSimpleToast('Ort aktualisiert');
    }, function (error) {
      showSimpleToast('Es gab einen Fehler');
    });

  };

 }).controller('DialogEvenementController', function(
 	$scope, $mdDialog, $mdToast, Evenement, Category, File, NgMap, GeoCoder, evenement) {

 	var marker, map;

 	$scope.categories = [];
 	$scope.evenement = {};
  $scope.evenement.category = null;
  $scope.evenement.website = 'http://';
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

 	if (evenement) {

 		$scope.evenement = evenement;
    if ($scope.evenement.image) {
      $scope.imageOneFilename = $scope.evenement.image.name();
    }

    if ($scope.evenement.imageTwo) {
      $scope.imageTwoFilename = $scope.evenement.imageTwo.name();
    }

    if ($scope.evenement.imageThree) {
      $scope.imageThreeFilename = $scope.evenement.imageThree.name();
    }

    if ($scope.evenement.imageFour) {
      $scope.imageFourFilename = $scope.evenement.imageFour.name();
    }

    $scope.input.latitude = evenement.location.latitude;
    $scope.input.longitude = evenement.location.longitude;

 		$scope.isCreating = false;
 	}

 	Category.all({ page: 1, limit: 1000, filter: '' })
  .then(function (categories) {
    $scope.categories = categories;
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
    GeoCoder.geocode({ address: $scope.evenement.address }).then(function (result) {

      if (map) {

        var location = result[0].geometry.location;
        location = new google.maps.LatLng(location.lat(), location.lng());

        map.setCenter(location);
        map.setZoom(15);

        marker.setPosition(location);

        $scope.evenement.location = new Parse.GeoPoint({
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

    if (evenement) {

      var evenementLocation = new google.maps.LatLng(
        evenement.location.latitude,
        evenement.location.longitude);

      map.setCenter(evenementLocation)
      marker.setPosition(evenementLocation);
      map.setZoom(15);
    } else {
      map.setZoom(1);
      map.setCenter(new google.maps.LatLng(0, 0));
    }
  });


  $scope.onMarkerDragEnd = function (ev) {

    var lat = ev.latLng.lat();
    var lng = ev.latLng.lng();

    $scope.evenement.location = new Parse.GeoPoint({
      latitude: lat,
      longitude: lng
    });

    $scope.input.latitude = lat;
    $scope.input.longitude = lng;
  };

  $scope.onInputLocationChanged = function () {

    if ($scope.input.latitude && $scope.input.longitude && map) {

      $scope.evenement.location = new Parse.GeoPoint({
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

        $scope.evenement.image = savedFile;
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
          showSimpleToast('Bild zu groß Max ' + invalidFile.$errorParam);
        }
      }
    }
 	};

  $scope.uploadImageTwo = function (file, invalidFile) {

    if (file) {

      $scope.isImageTwoUploading = true;
      $scope.imageTwoFilename = file.name;

 		  File.upload(file).then(function (savedFile) {

        $scope.evenement.imageTwo = savedFile;
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
          showSimpleToast('Bild zu groß Max ' + invalidFile.$errorParam);
        }
      }
    }
 	}

  $scope.uploadImageThree = function (file, invalidFile) {

    if (file) {

      $scope.isImageThreeUploading = true;
      $scope.imageThreeFilename = file.name;

 		  File.upload(file).then(function (savedFile) {

        $scope.evenement.imageThree = savedFile;
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
          showSimpleToast('Bild zu groß Max ' + invalidFile.$errorParam);
        }
      }
    }
 	}

  $scope.uploadImageFour = function (file, invalidFile) {

    if (file) {

      $scope.isImageFourUploading = true;
      $scope.imageFourFilename = file.name;

 		  File.upload(file).then(function (savedFile) {

        $scope.evenement.imageFour = savedFile;
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
          showSimpleToast('Bild zu groß Max ' + invalidFile.$errorParam);
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

 	$scope.onSaveEvenement = function (isFormValid) {

 		if (!isFormValid) {
 			showSimpleToast('Bitte korrigieren Sie alle markierten Fehler und versuchen Sie es erneut');
 		} else if (!$scope.evenement.image) {
 			showSimpleToast('Laden Sie mindestens das erste Bild hoch');
 		}  else if (!$scope.evenement.location) {
 			showSimpleToast('Lage ist erforderlich')
 		}
 		else {

      $scope.isSavingEvenement = true;

 			Evenement.create($scope.evenement).then(function (evenement) {
 				showSimpleToast('gespeichert');
 				$mdDialog.hide();
        $scope.isSavingEvenement = false;
 			},
 			function (error) {
 				showSimpleToast(error.message);
        $scope.isSavingEvenement = false;
 			});
 		}
 	};

 	$scope.onUpdateEvenement = function (isFormValid) {

 		if(!isFormValid) {
 			showSimpleToast('Bitte korrigieren Sie alle markierten Fehler und versuchen Sie es erneut');
 		} else {

      $scope.isSavingEvenement = true;

 			Evenement.update($scope.evenement).then(function (evenement) {
 				showSimpleToast('aktualisiert');
 				$mdDialog.hide();
        $scope.isSavingEvenement = false;
 			},
 			function (error) {
 				showSimpleToast(error.message);
        $scope.isSavingEvenement = false;
 			});

 		}
 	};

}).controller('DialogEvenementExpiresAtController',
function($scope, $mdDialog, $mdToast, Evenement, evenement) {

  $scope.evenement = evenement;
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
    evenement.expiresAt = expiresAt;
    evenement.isApproved = true;

    $scope.isSavingExpiresAt = true;

    Evenement.update(evenement).then(function (success) {
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
          var transformedInput = text.reevenement(/[^0-9]/g, '');

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





