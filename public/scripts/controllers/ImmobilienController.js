'use strict';

angular.module('nearPlaceApp')
  .controller('ImmobilieCtrl',
  function ($scope, $mdDialog, $mdToast, Immobilie, iCategory, Auth) {

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

    $scope.immobilien = [];

    var showSimpleToast = function (message) {
      $mdToast.show(
        $mdToast.simple()
          .content(message)
          .action('OK')
          .hideDelay(3000)
      );
    };

    var loadImmobilies = function () {
      Auth.ensureLoggedIn().then(function () {
        $scope.promise = Immobilie.all($scope.query).then(function (immobilien) {
          $scope.immobilien = immobilien;
        });
      });
    };

    loadImmobilies();

    var loadCount = function () {
      Auth.ensureLoggedIn().then(function () {
        Immobilie.count($scope.query).then(function (total) {
          $scope.query.total = total;
        });
      });
    }

    loadCount();

    var loadiCategories = function () {
      var params = {
        page: 1, limit: 1000, filter: '', order: 'title'
      }

      Auth.ensureLoggedIn().then(function () {
        iCategory.all(params).then(function (icategories) {
          $scope.icategories = icategories;
        });
      });
    }

    loadiCategories();

    $scope.onQueryChange = function () {
      $scope.query.page = 1;
      $scope.query.total = 0;
      loadImmobilies();
      loadCount();
    }

    $scope.onCreateImmobilie = function (ev) {

      $mdDialog.show({
        controller: 'DialogImmobilieController',
        templateUrl: '/views/partials/immobilie.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        locals: {
          immobilie: null
        },
        clickOutsideToClose: true
      })
        .then(function (answer) {
          loadImmobilies();
          loadCount();
        });
    };

    $scope.onPaginationChange = function (page, limit) {
      $scope.query.page = page;
      $scope.query.limit = limit;
      loadImmobilies();
    };

    $scope.openMenu = function ($mdOpenMenu, ev) {
      $mdOpenMenu(ev);
    };

    $scope.isDate = function (date) {
      return angular.isDate(date);
    }

    $scope.onUpdateExpiresAt = function (ev, immobilie) {

      $mdDialog.show({
        controller: 'DialogImmobilieExpiresAtController',
        templateUrl: '/views/partials/expiration-modal.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: true,
        locals: {
          immobilie: immobilie
        }
      });

    }

    $scope.onUpdateImmobilie = function (ev, immobilie) {

      var objImmobilie = angular.copy(immobilie);

      $mdDialog.show({
        controller: 'DialogImmobilieController',
        templateUrl: '/views/partials/immobilie.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        locals: {
          immobilie: objImmobilie
        },
        clickOutsideToClose: true
      });
    };

    $scope.onDestroyImmobilie = function (ev, immobilie) {

      var confirm = $mdDialog.confirm()
        .title('Bestätige Aktion')
        .content('Bist du sicher, dass du diese Immobilie löschen möchtest?')
        .ok('Löschen')
        .cancel('Zurück')
        .targetEvent(ev);

      $mdDialog.show(confirm).then(function () {

        Immobilie.destroy(immobilie).then(function (success) {
          showSimpleToast('Immobilie gelöscht.');
          loadImmobilies();
          loadCount();
        },
          function (error) {
            showSimpleToast(error.message);
          });

      });
    };

    $scope.onUpdateIsApproved = function (immobilie, isApproved) {

      immobilie.isApproved = isApproved;
      immobilie.unset('expiresAt');

      Immobilie.update(immobilie).then(function (success) {
        showSimpleToast('Ort aktualisiert');
      }, function (error) {
        showSimpleToast('Es gab einen Fehler');
      });

    };

  }).controller('DialogImmobilieController', function (
    $scope, $mdDialog, $mdToast, Immobilie, iCategory, File, NgMap, GeoCoder, immobilie) {

    var marker, map;

    $scope.icategories = [];
    $scope.immobilie = {};
    $scope.immobilie.icategory = null;
    $scope.immobilie.website = 'http://';
    $scope.imageOneFilename = '';
    $scope.imageTwoFilename = '';
    $scope.imageThreeFilename = '';
    $scope.imageFourFilename = '';
    $scope.imageFiveFilename = '';
    $scope.imageSixFilename = '';
    $scope.imageSevenFilename = '';
    $scope.imageEightFilename = '';
    $scope.imageNineFilename = '';
    $scope.imageTenFilename = '';
    $scope.imageElevenFilename = '';
    $scope.imageTwelveFilename = '';
    $scope.imageThirteenFilename = '';
    $scope.imageFourteenFilename = '';
    $scope.imageFifteenFilename = '';
    $scope.imageSixteenFilename = '';
    $scope.input = {};

    $scope.isCreating = true;
    $scope.isImageOneUploading = false;
    $scope.isImageTwoUploading = false;
    $scope.isImageThreeUploading = false;
    $scope.isImageFourUploading = false;
    $scope.isImageFiveUploading = false;
    $scope.isImageSixUploading = false;
    $scope.isImageSevenUploading = false;
    $scope.isImageEightUploading = false;
    $scope.isImageNineUploading = false;
    $scope.isImageTenUploading = false;
    $scope.isImageElevenUploading = false;
    $scope.isImageTwelveUploading = false;
    $scope.isImageThirteenUploading = false;
    $scope.isImageFourteenUploading = false;
    $scope.isImageFifteenUploading = false;
    $scope.isImageSixteenUploading = false;

    if (immobilie) {

      $scope.immobilie = immobilie;
      if ($scope.immobilie.image) {
        $scope.imageOneFilename = $scope.immobilie.image.name();
      }

      if ($scope.immobilie.imageTwo) {
        $scope.imageTwoFilename = $scope.immobilie.imageTwo.name();
      }

      if ($scope.immobilie.imageThree) {
        $scope.imageThreeFilename = $scope.immobilie.imageThree.name();
      }

      if ($scope.immobilie.imageFour) {
        $scope.imageFourFilename = $scope.immobilie.imageFour.name();
      }

      if ($scope.immobilie.imageFive) {
        $scope.imageFiveFilename = $scope.immobilie.imageFive.name();
      }

      if ($scope.immobilie.imageSix) {
        $scope.imageSixFilename = $scope.immobilie.imageSix.name();
      }

      if ($scope.immobilie.imageSeven) {
        $scope.imageSevenFilename = $scope.immobilie.imageSeven.name();
      }

      if ($scope.immobilie.imageEight) {
        $scope.imageEightFilename = $scope.immobilie.imageEight.name();
      }

      if ($scope.immobilie.imageNine) {
        $scope.imageNineFilename = $scope.immobilie.imageNine.name();
      }

      if ($scope.immobilie.imageTen) {
        $scope.imageTenFilename = $scope.immobilie.imageTen.name();
      }

      if ($scope.immobilie.imageEleven) {
        $scope.imageElevenFilename = $scope.immobilie.imageEleven.name();
      }

      if ($scope.immobilie.imageTwelve) {
        $scope.imageTwelveFilename = $scope.immobilie.imageTwelve.name();
      }

      if ($scope.immobilie.imageThirteen) {
        $scope.imageThirteenFilename = $scope.immobilie.imageThirteen.name();
      }

      if ($scope.immobilie.imageFourteen) {
        $scope.imageFourteenFilename = $scope.immobilie.imageFourteen.name();
      }

      if ($scope.immobilie.imageFifteen) {
        $scope.imageFifteenFilename = $scope.immobilie.imageFifteen.name();
      }

      if ($scope.immobilie.imageSixteen) {
        $scope.imageSixteenFilename = $scope.immobilie.imageSixteen.name();
      }

      $scope.input.latitude = immobilie.location.latitude;
      $scope.input.longitude = immobilie.location.longitude;

      $scope.isCreating = false;
    }

    iCategory.all({ page: 1, limit: 1000, filter: '' })
      .then(function (icategories) {
        $scope.icategories = icategories;
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
      GeoCoder.geocode({ address: $scope.immobilie.address }).then(function (result) {

        if (map) {

          var location = result[0].geometry.location;
          location = new google.maps.LatLng(location.lat(), location.lng());

          map.setCenter(location);
          map.setZoom(15);

          marker.setPosition(location);

          $scope.immobilie.location = new Parse.GeoPoint({
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
      google.maps.event.trigger(map, 'resize');

      if (immobilie) {

        var immobilieLoication = new google.maps.LatLng(
          immobilie.location.latitude,
          immobilie.location.longitude);

        map.setCenter(immobilieLoication)
        marker.setPosition(immobilieLoication);
        map.setZoom(15);
      } else {
        map.setZoom(1);
        map.setCenter(new google.maps.LatLng(0, 0));
      }
    });


    $scope.onMarkerDragEnd = function (ev) {

      var lat = ev.latLng.lat();
      var lng = ev.latLng.lng();

      $scope.immobilie.location = new Parse.GeoPoint({
        latitude: lat,
        longitude: lng
      });

      $scope.input.latitude = lat;
      $scope.input.longitude = lng;
    };

    $scope.onInputLoicationChanged = function () {

      if ($scope.input.latitude && $scope.input.longitude && map) {

        $scope.immobilie.location = new Parse.GeoPoint({
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

          $scope.immobilie.image = savedFile;
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

          $scope.immobilie.imageTwo = savedFile;
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

          $scope.immobilie.imageThree = savedFile;
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

          $scope.immobilie.imageFour = savedFile;
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

    $scope.uploadImageFive = function (file, invalidFile) {

      if (file) {

        $scope.isImageFiveUploading = true;
        $scope.imageFiveFilename = file.name;

        File.upload(file).then(function (savedFile) {

          $scope.immobilie.imageFive = savedFile;
          $scope.isImageFiveUploading = false;
          showSimpleToast('Bild hochgeladen');
        },
          function (error) {
            $scope.isImageFiveUploading = false;
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

    $scope.uploadImageSix = function (file, invalidFile) {

      if (file) {

        $scope.isImageSixUploading = true;
        $scope.imageSixFilename = file.name;

        File.upload(file).then(function (savedFile) {

          $scope.immobilie.imageSix = savedFile;
          $scope.isImageSixUploading = false;
          showSimpleToast('Bild hochgeladen');
        },
          function (error) {
            $scope.isImageSixUploading = false;
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

    $scope.uploadImageSeven = function (file, invalidFile) {

      if (file) {

        $scope.isImageSevenUploading = true;
        $scope.imageSevenFilename = file.name;

        File.upload(file).then(function (savedFile) {

          $scope.immobilie.imageSeven = savedFile;
          $scope.isImageSevenUploading = false;
          showSimpleToast('Bild hochgeladen');
        },
          function (error) {
            $scope.isImageSevenUploading = false;
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

    $scope.uploadImageEight = function (file, invalidFile) {

      if (file) {

        $scope.isImageEightUploading = true;
        $scope.imageEightFilename = file.name;

        File.upload(file).then(function (savedFile) {

          $scope.immobilie.imageEight = savedFile;
          $scope.isImageEightUploading = false;
          showSimpleToast('Bild hochgeladen');
        },
          function (error) {
            $scope.isImageEightUploading = false;
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

    $scope.uploadImageNine = function (file, invalidFile) {

      if (file) {

        $scope.isImageNineUploading = true;
        $scope.imageNineFilename = file.name;

        File.upload(file).then(function (savedFile) {

          $scope.immobilie.imageNine = savedFile;
          $scope.isImageNineUploading = false;
          showSimpleToast('Bild hochgeladen');
        },
          function (error) {
            $scope.isImageNineUploading = false;
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

    $scope.uploadImageTen = function (file, invalidFile) {

      if (file) {

        $scope.isImageTenUploading = true;
        $scope.imageTenFilename = file.name;

        File.upload(file).then(function (savedFile) {

          $scope.immobilie.imageTen = savedFile;
          $scope.isImageTenUploading = false;
          showSimpleToast('Bild hochgeladen');
        },
          function (error) {
            $scope.isImageTenUploading = false;
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

    $scope.uploadImageEleven = function (file, invalidFile) {

      if (file) {

        $scope.isImageElevenUploading = true;
        $scope.imageElevenFilename = file.name;

        File.upload(file).then(function (savedFile) {

          $scope.immobilie.imageEleven = savedFile;
          $scope.isImageElevenUploading = false;
          showSimpleToast('Bild hochgeladen');
        },
          function (error) {
            $scope.isImageElevenUploading = false;
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

    $scope.uploadImageTwelve = function (file, invalidFile) {

      if (file) {

        $scope.isImageTwelveUploading = true;
        $scope.imageTwelveFilename = file.name;

        File.upload(file).then(function (savedFile) {

          $scope.immobilie.imageTwelve = savedFile;
          $scope.isImageTwelveUploading = false;
          showSimpleToast('Bild hochgeladen');
        },
          function (error) {
            $scope.isImageTwelveUploading = false;
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

    $scope.uploadImageThirteen = function (file, invalidFile) {

      if (file) {

        $scope.isImageThirteenUploading = true;
        $scope.imageThirteenFilename = file.name;

        File.upload(file).then(function (savedFile) {

          $scope.immobilie.imageThirteen = savedFile;
          $scope.isImageThirteenUploading = false;
          showSimpleToast('Bild hochgeladen');
        },
          function (error) {
            $scope.isImageThirteenUploading = false;
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

    $scope.uploadImageFourteen = function (file, invalidFile) {

      if (file) {

        $scope.isImageFourteenUploading = true;
        $scope.imageFourteenFilename = file.name;

        File.upload(file).then(function (savedFile) {

          $scope.immobilie.imageFourteen = savedFile;
          $scope.isImageFourteenUploading = false;
          showSimpleToast('Bild hochgeladen');
        },
          function (error) {
            $scope.isImageFourteenUploading = false;
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

    $scope.uploadImageFifteen = function (file, invalidFile) {

      if (file) {

        $scope.isImageFifteenUploading = true;
        $scope.imageFifteenFilename = file.name;

        File.upload(file).then(function (savedFile) {

          $scope.immobilie.imageFifteen = savedFile;
          $scope.isImageFifteenUploading = false;
          showSimpleToast('Bild hochgeladen');
        },
          function (error) {
            $scope.isImageFifteenUploading = false;
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

    $scope.uploadImageSixteen = function (file, invalidFile) {

      if (file) {

        $scope.isImageSixteenUploading = true;
        $scope.imageSixteenFilename = file.name;

        File.upload(file).then(function (savedFile) {

          $scope.immobilie.imageSixteen = savedFile;
          $scope.isImageSixteenUploading = false;
          showSimpleToast('Bild hochgeladen');
        },
          function (error) {
            $scope.isImageSixteenUploading = false;
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

    $scope.hide = function () {
      $mdDialog.cancel();
    };

    $scope.cancel = function () {
      $mdDialog.cancel();
    };

    $scope.onSaveImmobilie = function (isFormValid) {

      if (!isFormValid) {
        showSimpleToast('Bitte korrigieren Sie alle markierten Fehler und versuchen Sie es erneut');
      } else if (!$scope.immobilie.image) {
        showSimpleToast('Laden Sie mindestens das erste Bild hoch');
      } else if (!$scope.immobilie.location) {
        showSimpleToast('Standortauswahl ist erforderlich')
      }
      else {

        $scope.isSavingImmobilie = true;

        Immobilie.create($scope.immobilie).then(function (immobilie) {
          showSimpleToast('gespeichert');
          $mdDialog.hide();
          $scope.isSavingImmobilie = false;
        },
          function (error) {
            showSimpleToast(error.message);
            $scope.isSavingImmobilie = false;
          });
      }
    };

    $scope.onUpdateImmobilie = function (isFormValid) {

      if (!isFormValid) {
        showSimpleToast('Bitte korrigieren Sie alle markierten Fehler und versuchen Sie es erneut');
      } else {

        $scope.isSavingImmobilie = true;

        Immobilie.update($scope.immobilie).then(function (immobilie) {
          showSimpleToast('aktualisiert');
          $mdDialog.hide();
          $scope.isSavingImmobilie = false;
        },
          function (error) {
            showSimpleToast(error.message);
            $scope.isSavingImmobilie = false;
          });

      }
    };

  }).controller('DialogImmobilieExpiresAtController',
  function ($scope, $mdDialog, $mdToast, Immobilie, immobilie) {

    $scope.immobilie = immobilie;
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
      immobilie.expiresAt = expiresAt;
      immobilie.isApproved = true;

      $scope.isSavingExpiresAt = true;

      Immobilie.update(immobilie).then(function (success) {
        $scope.isSavingExpiresAt = false;
        showToast('aktualisiert');
        $scope.hide();
      },
        function (error) {
          $scope.isSavingExpiresAt = false;
          showToast('Es gab einen Fehler');
        });
    }

    $scope.hide = function () {
      $mdDialog.hide();
    };

  }).directive('numbersOnly', function () {
    return {
      require: 'ngModel',
      link: function (scope, element, attr, ngModelCtrl) {
        function fromUser(text) {
          if (text) {
            var transformedInput = text.reimmobilie(/[^0-9]/g, '');

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
