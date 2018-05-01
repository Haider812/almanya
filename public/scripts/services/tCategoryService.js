'use strict';
 angular.module('nearPlaceApp')
 .factory('tCategory', function ($q) {

    var tCategory = Parse.Object.extend('tCategory', {}, {

      create: function (tcategory) {

        var defer = $q.defer();
        var objtCategory = new tCategory();

        objtCategory.save(tcategory, {
          success: function (obj) {
            defer.resolve(obj);
          }, error: function (obj, error) {
            defer.reject(error);
          }
        });

        return defer.promise;
      },

      update: function (tcategory) {

        var defer = $q.defer();

        tcategory.save(null, {
          success: function (obj) {
            defer.resolve(obj);
          }, error: function (obj, error) {
            defer.reject(error);
          }
        });

        return defer.promise;
      },

      destroy: function (tcategoryId) {

        var defer = $q.defer();

        var tcategory = new tCategory();
        tcategory.id = tcategoryId;

        tcategory.destroy({
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
          success: function (tcategories) {
            defer.resolve(tcategories);
          }, error: function (error) {
            defer.reject(error);
          }
        });

        return defer.promise;

      },

    });

    Object.defineProperty(tCategory.prototype, 'title',
    {
      get: function () {
        return this.get('title');
      },
      set: function (val) {
        this.set('title', val);
      }
    });

    Object.defineProperty(tCategory.prototype, 'image',
    {
      get: function () {
        return this.get('image');
      },
      set: function (val) {
        this.set('image', val);
      }
    });

    Object.defineProperty(tCategory.prototype, 'imageThumb',
    {
      get: function () {
        return this.get('imageThumb');
      }
    });

    Object.defineProperty(tCategory.prototype, 'icon',
    {
      get: function () {
        return this.get('icon');
      },
      set: function (val) {
        this.set('icon', val);
      }
    });

    Object.defineProperty(tCategory.prototype, 'order',
    {
      get: function () {
        return this.get('order');
      },
      set: function (val) {
        this.set('order', val);
      }
    });

return tCategory;

});
