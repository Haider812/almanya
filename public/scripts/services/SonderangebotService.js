'use strict';

 angular.module('nearPlaceApp')
 .factory('Sonderangebot', function ($q, moment) {

 	var Sonderangebot = Parse.Object.extend('Sonderangebot', {

    getStatus: function () {

      if (moment().toDate() >= this.expiresAt) {
        return 'Expired';
      }
      else if (this.isApproved) {
        return 'Genehmigt';
      } else if (this.isApproved === false) {
        return 'Abgelehnt';
      } else {
        return 'Ausstehend';
      }
    }

  }, {

 		create: function (sonderangebot) {

 			var defer = $q.defer();

 			var objSonderangebot = new Sonderangebot();
      sonderangebot.user = Parse.User.current();

 			objSonderangebot.save(sonderangebot, {
 				success: function (success) {
 					defer.resolve(success);
 				}, error: function (obj, error) {
 					defer.reject(error);
 				}
 			});

 			return defer.promise;
 		},

 		update: function (sonderangebot) {

 			var defer = $q.defer();

    	sonderangebot.save(null, {
    		success: function (success) {
    			defer.resolve(success);
    		}, error: function (obj, error) {
    			defer.reject(error);
    		}
    	});

    	return defer.promise;

 		},

 		destroy: function (sonderangebot) {

 			var defer = $q.defer();

 			sonderangebot.destroy({
 				success: function (obj) {
 					defer.resolve(obj);
 				}, error: function (obj, error) {
 					defer.reject(error);
 				}
 			});

 			return defer.promise;

 		},

 		all: function(params) {

 			var defer = $q.defer();

 			var query = new Parse.Query(this);

      if (params.filter != '') {
        query.contains('canonical', params.filter);
      }

      if (params.scategory && params.scategory!== null) {
        query.equalTo('scategory', params.scategory);
      }

      if (params.date && params.date !== null) {
        var start = moment(params.date).startOf('day');
        var end = moment(params.date).endOf('day');
        query.greaterThanOrEqualTo('createdAt', start.toDate());
        query.lessThanOrEqualTo('createdAt', end.toDate());
      }

      if (params.status && params.status !== null) {

        if (params.status === 'pending') {
          query.doesNotExist('isApproved');
        } else if (params.status === 'rejected') {
          query.equalTo('isApproved', false);
        } else if (params.status === 'approved') {
          query.equalTo('isApproved', true);
        } else if (params.status === 'expired') {
          query.lessThanOrEqualTo('expiresAt', moment().toDate());
        } else if (params.status === 'expireInTenDays') {
          var expiresAt = moment().add(10, 'days').toDate();
          query.lessThanOrEqualTo('expiresAt', expiresAt);
          query.greaterThanOrEqualTo('expiresAt', moment().toDate());
        } else if (params.status === 'expireInThirtyDays') {
          var expiresAt = moment().add(30, 'days').toDate();
          query.lessThanOrEqualTo('expiresAt', expiresAt);
          query.greaterThanOrEqualTo('expiresAt', moment().toDate());
        }
      }

 			query.include('scategory')
      query.descending('createdAt');
      query.limit(params.limit);
 			query.skip((params.page * params.limit) - params.limit);
 			query.find({
 				success: function(sonderangebote) {
 					defer.resolve(sonderangebote);
 				}, error: function(error) {
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

      if (params.scategory && params.scategory !== null) {
        query.equalTo('scategory', params.scategory);
      }

      if (params.date && params.date !== null) {
        var start = moment(params.date).startOf('day');
        var end = moment(params.date).endOf('day');
        query.greaterThanOrEqualTo('createdAt', start.toDate());
        query.lessThanOrEqualTo('createdAt', end.toDate());
      }

      if (params.status && params.status !== null) {

        if (params.status === 'pending') {
          query.doesNotExist('isApproved');
        } else if (params.status === 'rejected') {
          query.equalTo('isApproved', false);
        } else if (params.status === 'approved') {
          query.equalTo('isApproved', true);
          query.greaterThanOrEqualTo('expiresAt', moment().toDate());
        } else if (params.status === 'expired') {
          query.lessThanOrEqualTo('expiresAt', moment().toDate());
        } else if (params.status === 'expireInTenDays') {
          var expiresAt = moment().add(10, 'days').toDate();
          query.lessThanOrEqualTo('expiresAt', expiresAt);
          query.greaterThanOrEqualTo('expiresAt', moment().toDate());
        } else if (params.status === 'expireInThirtyDays') {
          var expiresAt = moment().add(30, 'days').toDate();
          query.lessThanOrEqualTo('expiresAt', expiresAt);
          query.greaterThanOrEqualTo('expiresAt', moment().toDate());
        }
      }

      query.count({
        success: function(count) {
          defer.resolve(count);
        }, error: function(error) {
          defer.reject(error);
        }
      });

      return defer.promise;
    }

 	});

    Object.defineProperty(Sonderangebot.prototype, 'scategory', {
        get: function () {
            return this.get('scategory');
        },
        set: function (value) {
            this.set('scategory', value);
        }
    }); 

	   Object.defineProperty(Sonderangebot.prototype, 'check', {
        get: function () {
            return this.get('check');
        },
        set: function (value) {
            this.set('check', value);
        }
    });
	
    Object.defineProperty(Sonderangebot.prototype, 'user', {
      get: function () {
        return this.get('user');
      },
      set: function (value) {
        this.set('user', value);
      }
    });

    Object.defineProperty(Sonderangebot.prototype, 'title', {
        get: function () {
            return this.get('title');
        },
        set: function (value) {
            this.set('title', value);
        }
    });

	Object.defineProperty(Sonderangebot.prototype, 'sbeginn', {
        get: function () {
            return this.get('sbeginn');
        },
        set: function (value) {
            this.set('sbeginn', value);
        }
    });
	
	Object.defineProperty(Sonderangebot.prototype, 'sende', {
        get: function () {
            return this.get('sende');
        },
        set: function (value) {
            this.set('sende', value);
        }
    });
    
    Object.defineProperty(Sonderangebot.prototype, 'price', {
        get: function () {
            return this.get('price');
        },
        set: function (value) {
            this.set('price', value);
        }
    });

    Object.defineProperty(Sonderangebot.prototype, 'description', {
        get: function () {
            return this.get('description');
        },
        set: function (value) {
            this.set('description', value);
        }
    });

    Object.defineProperty(Sonderangebot.prototype, 'phone', {
        get: function () {
            return this.get('phone');
        },
        set: function (value) {
            this.set('phone', value);
        }
    });

    Object.defineProperty(Sonderangebot.prototype, 'website', {
        get: function () {
            return this.get('website');
        },
        set: function (value) {
            this.set('website', value);
        }
    });

    Object.defineProperty(Sonderangebot.prototype, 'address', {
        get: function () {
            return this.get('address');
        },
        set: function (value) {
            this.set('address', value);
        }
    });

    Object.defineProperty(Sonderangebot.prototype, 'image', {
        get: function () {
            return this.get('image');
        },
        set: function (value) {
            this.set('image', value);
        }
    });

    Object.defineProperty(Sonderangebot.prototype, 'imageTwo', {
        get: function () {
            return this.get('imageTwo');
        },
        set: function (value) {
            this.set('imageTwo', value);
        }
    });

    Object.defineProperty(Sonderangebot.prototype, 'imageThree', {
        get: function () {
            return this.get('imageThree');
        },
        set: function (value) {
            this.set('imageThree', value);
        }
    });

    Object.defineProperty(Sonderangebot.prototype, 'imageFour', {
        get: function () {
            return this.get('imageFour');
        },
        set: function (value) {
            this.set('imageFour', value);
        }
    });

    Object.defineProperty(Sonderangebot.prototype, 'imageThumb', {
        get: function () {
            return this.get('imageThumb');
        }
    });

    Object.defineProperty(Sonderangebot.prototype, 'location', {
        get: function () {
            return this.get('location');
        },
        set: function (val) {
            this.set('location', new Parse.GeoPoint({
                latitude: val.latitude,
                longitude: val.longitude
            }));
        }
    });

    Object.defineProperty(Sonderangebot.prototype, 'isApproved', {
      get: function () {
          return this.get('isApproved');
      },
      set: function (value) {
          this.set('isApproved', value);
      }
    });

    Object.defineProperty(Sonderangebot.prototype, 'expiresAt', {
      get: function () {
          return this.get('expiresAt');
      },
      set: function (value) {
          this.set('expiresAt', value);
      }
    });

 	return Sonderangebot;

 });
