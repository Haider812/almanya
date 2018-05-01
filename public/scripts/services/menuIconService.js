'use strict';
 angular.module('nearPlaceApp')
 .factory('menuIcon', function ($q) {

    var menuIcon = Parse.Object.extend('menuIcon', {}, {

      create: function (menuicon) {

        var defer = $q.defer();
        var objmenuIcon = new menuIcon();

        objmenuIcon.save(menuicon, {
          success: function (obj) {
            defer.resolve(obj);
          }, error: function (obj, error) {
            defer.reject(error);
          }
        });

        return defer.promise;
      },

      update: function (menuicon) {
		  
        var defer = $q.defer();		
		
        menuicon.save(null, {
          success: function (obj) {
            defer.resolve(obj);
          }, error: function (obj, error) {
            defer.reject(error);
          }
        });
		
        return defer.promise;
      },

      destroy: function (menuiconId) {

        var defer = $q.defer();

        var menuicon = new menuIcon();
        menuicon.id = menuiconId;

        menuicon.destroy({
          success: function (obj) {
            defer.resolve(obj);
          }, error: function (obj, error) {
            defer.reject(error);
          }
        });

        return defer.promise;
      },

      count: function (params) {

        var defer = $q.defer();

        var query = new Parse.Query(this);

        if (params.filter != '') {
          query.contains('canonical', params.filter);
        }

        query.count({
          success: function (count) {
            defer.resolve(count);
          },
          error: function (error) {
            defer.reject(error);
          }
        });

        return defer.promise;

      },

      all: function (params) {

        var defer = $q.defer();

        var query = new Parse.Query(this);

        if (params.filter != '') {
          query.contains('canonical', params.filter);
        }

        query.limit(params.limit);
        query.skip((params.page * params.limit) - params.limit);
        query.find({
          success: function (menuicons) {
            defer.resolve(menuicons);
          }, error: function (error) {
            defer.reject(error);
          }
        });

        return defer.promise;

      },

    });

    Object.defineProperty(menuIcon.prototype, 'title',
    {
      get: function () {
        return this.get('title');
      },
      set: function (val) {
        this.set('title', val);
      }
    });
	
    Object.defineProperty(menuIcon.prototype, 'icon',
    {
      get: function () {
        return this.get('icon');
      },
      set: function (val) {
        this.set('icon', val);
      }
    });	
	
return menuIcon;

});
