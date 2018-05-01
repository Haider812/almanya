angular.module('nearPlaceApp')
  .controller('UserCtrl', function(User, $scope, $mdDialog, $mdToast, Auth) {

    // Pagination options.
    $scope.rowOptions = [10, 20, 40];

    $scope.query = {
      filter: '',
      limit: 40,
      page: 1,
      total: 0
    }

    $scope.users = [];

    var showToast = function (message) {
      $mdToast.show(
        $mdToast.simple()
        .content(message)
        .action('OK')
        .hideDelay(3000)
      );
    }

    Auth.ensureLoggedIn().then(function () {
      User.fetch().then(function (user) {
        $scope.loggedUser = user;
      })
    });

    var loadUsers = function() {
      Auth.ensureLoggedIn().then(function () {
        $scope.promise = User.all($scope.query).then(function (data) {
          $scope.users = data.users;
          $scope.query.total = data.total;
        });
      });
    }

    loadUsers();

   	$scope.onSearch = function () {
   		$scope.query.page = 1;
   		loadUsers();
   	}

   	$scope.onPaginationChange = function (page, limit) {
   		$scope.query.page = page;
   		$scope.query.limit = limit;
   		loadUsers();
   	}

    $scope.openMenu = function($mdOpenMenu, ev) {
      originatorEv = ev;
      $mdOpenMenu(ev);
    }

    $scope.onSaveUser = function(ev) {

      $mdDialog.show({
          controller: 'DialogUserController',
          templateUrl: '/views/partials/user.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          locals: {
            user: null
          },
          clickOutsideToClose: true
        })
        .then(function (answer) {
          loadUsers();
        });
    }

    $scope.onUpdateUser = function(ev, user) {

      var objUser = angular.copy(user);

      $mdDialog.show({
          controller: 'DialogUserController',
          templateUrl: '/views/partials/user.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          locals: {
            user: objUser
          },
          clickOutsideToClose: true
        })
        .then(function (answer) {
          loadUsers();
        });
    };

    $scope.onDeleteUser = function (ev, user) {

      var confirm = $mdDialog.confirm()
      .title('Sind Sie sicher, dass Sie den Benutzer löschen möchten?')
      .ok('Löschen')
      .cancel('Zurück')
      .targetEvent(ev);

      $mdDialog.show(confirm).then(function() {

        User.delete({ id: user.id }).then(function () {
          loadUsers();
          showToast('Benutzer ' + user.getUsername() + ' gelöscht');
        },
        function (error) {
          console.log(error);
          showToast(error.message);
        });
      });
    };

  }).controller('DialogUserController',
    function(User, File, $scope, $mdDialog, $mdToast, user) {

    $scope.imageFilename = '';
    $scope.objUser = {};

    if (user) {
      $scope.objUser = user;
      if ($scope.objUser.photo) {
        $scope.imageFilename = $scope.objUser.photo.name();
      }
    }

    var showSimpleToast = function (message) {
      $mdToast.show(
        $mdToast.simple()
        .content(message)
        .action('OK')
        .hideDelay(3000)
      );
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
          $scope.objUser.photo = savedFile;
          $scope.isUploading = false;
          showSimpleToast('Datei hochgeladen');
        }, function(error) {

          showSimpleToast(error.message);
          $scope.isUploading = false;
          $scope.objUser.photo = null;

        });
      }
    }

    $scope.onEventSaveUser = function(isValidForm) {

      if (isValidForm) {

        if (!$scope.objUser.password) {
          showSimpleToast('Passwort erforderlich');
        } else if ($scope.objUser.password.length < 6) {
          showSimpleToast('Das Passwort sollte mindestens 6 Zeichen lang sein');
        } else {

          $scope.isSavingUser = true;

          User.create($scope.objUser).then(function(data) {
            showSimpleToast('Benutzer gespeichert');
            $mdDialog.hide();
            $scope.isSavingUser = false;
          }, function (error) {
            showSimpleToast(error.message);
            $scope.isSavingUser = false;
          });
        }
      } else {
        showSimpleToast('Bitte korrigieren Sie alle markierten Fehler und versuchen Sie es erneut');
      }
    }

    $scope.onEventUpdateUser = function (isValidForm) {

      if (isValidForm) {

        if ($scope.objUser.password && $scope.objUser.password.length < 6) {
          showSimpleToast('Das Passwort sollte mindestens 6 Zeichen lang sein');
          return;
        }

        $scope.isSavingUser = true;

        User.update($scope.objUser).then(function(data) {
            showSimpleToast('Benutzer aktualisiert');
            $mdDialog.hide();
            $scope.isSavingUser = false;
        }, function(error) {
          showSimpleToast(error.message);
          $scope.isSavingUser = false;
        });
      } else {
        showSimpleToast('Bitte korrigieren Sie alle markierten Fehler und versuchen Sie es erneut');
      }
    }

    $scope.hide = function() {
      $mdDialog.cancel();
    }

    $scope.cancel = function() {
      $mdDialog.cancel();
    }

  });
