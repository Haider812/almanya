'use strict';
 angular.module('nearPlaceApp')
 .factory('cCategory', function ($q) {

    var cCategory = Parse.Object.extend('cCategory', {}, {

      create: function (ccategory) {

        var defer = $q.defer();
        var objcCategory = new cCategory();

        objcCategory.save(ccategory, {
          success: function (obj) {
            defer.resolve(obj);
          }, error: function (obj, error) {
            defer.reject(error);
          }
        });

        return defer.promise;
      },

      update: function (ccategory) {

        var defer = $q.defer();

        ccategory.save(null, {
          success: function (obj) {
            defer.resolve(obj);
          }, error: function (obj, error) {
            defer.reject(error);
          }
        });

        return defer.promise;
      },

      destroy: function (ccategoryId) {

        var defer = $q.defer();

        var ccategory = new cCategory();
        ccategory.id = ccategoryId;

        ccategory.destroy({
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

        if (params.order === 'order') {
          query.ascending('order');
        } else if (params.order === '-order') {
          query.descending('order');
        } else {
          query.ascending('order');
        }

        query.limit(params.limit);
        query.skip((params.page * params.limit) - params.limit);
        query.find({
          success: function (ccategories) {
            defer.resolve(ccategories);
          }, error: function (error) {
            defer.reject(error);
          }
        });

        return defer.promise;

      },

    });

    Object.defineProperty(cCategory.prototype, 'title',
    {
      get: function () {
        return this.get('title');
      },
      set: function (val) {
        this.set('title', val);
      }
    });

    Object.defineProperty(cCategory.prototype, 'image',
    {
      get: function () {
        return this.get('image');
      },
      set: function (val) {
        this.set('image', val);
      }
    });
	


    Object.defineProperty(cCategory.prototype, 'imageThumb',
    {
      get: function () {
        return this.get('imageThumb');
      }
    });

    Object.defineProperty(cCategory.prototype, 'icon',
    {
      get: function () {
        return this.get('icon');
      },
      set: function (val) {
        this.set('icon', val);
      }
    });

    Object.defineProperty(cCategory.prototype, 'order',
    {
      get: function () {
        return this.get('order');
      },
      set: function (val) {
        this.set('order', val);
      }
    });

return cCategory;

});
