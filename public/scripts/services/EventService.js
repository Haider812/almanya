'use strict';

 angular.module('nearPlaceApp')
 .factory('Event', function ($q, moment) {

 	var Event = Parse.Object.extend('Event', {

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

 		create: function (evente) {

 			var defer = $q.defer();

 			var objEvent = new Event();
      evente.user = Parse.User.current();

 			objEvent.save(evente, {
 				success: function (success) {
 					defer.resolve(success);
 				}, error: function (obj, error) {
 					defer.reject(error);
 				}
 			});

 			return defer.promise;
 		},

 		update: function (evente) {

 			var defer = $q.defer();

    	evente.save(null, {
    		success: function (success) {
    			defer.resolve(success);
    		}, error: function (obj, error) {
    			defer.reject(error);
    		}
    	});

    	return defer.promise;

 		},

 		destroy: function (evente) {

 			var defer = $q.defer();

 			evente.destroy({
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

      if (params.ecategory && params.ecategory!== null) {
        query.equalTo('ecategory', params.ecategory);
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

 			query.include('ecategory')
      query.descending('createdAt');
      query.limit(params.limit);
 			query.skip((params.page * params.limit) - params.limit);
 			query.find({
 				success: function(Eventn) {
 					defer.resolve(Eventn);
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

      if (params.ecategory && params.ecategory !== null) {
        query.equalTo('ecategory', params.ecategory);
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

    Object.defineProperty(Event.prototype, 'ecategory', {
        get: function () {
            return this.get('ecategory');
        },
        set: function (value) {
            this.set('ecategory', value);
        }
    }); 

    Object.defineProperty(Event.prototype, 'user', {
      get: function () {
        return this.get('user');
      },
      set: function (value) {
        this.set('user', value);
      }
    });

    Object.defineProperty(Event.prototype, 'title', {
        get: function () {
            return this.get('title');
        },
        set: function (value) {
            this.set('title', value);
        }
    });
	
	Object.defineProperty(Event.prototype, 'maxTeilnehmer', {
        get: function () {
            return this.get('maxTeilnehmer');
        },
        set: function (value) {
            this.set('maxTeilnehmer', value);
        }
    });

    Object.defineProperty(Event.prototype, 'datum', {
        get: function () {
            return this.get('datum');
        },
        set: function (value) {
            this.set('datum', value);
        }
    });

    Object.defineProperty(Event.prototype, 'price', {
        get: function () {
            return this.get('price');
        },
        set: function (value) {
            this.set('price', value);
        }
    });

    Object.defineProperty(Event.prototype, 'zeit', {
        get: function () {
            return this.get('zeit');
        },
        set: function (value) {
            this.set('zeit', value);
        }
    });
	
    Object.defineProperty(Event.prototype, 'description', {
        get: function () {
            return this.get('description');
        },
        set: function (value) {
            this.set('description', value);
        }
    });

    Object.defineProperty(Event.prototype, 'phone', {
        get: function () {
            return this.get('phone');
        },
        set: function (value) {
            this.set('phone', value);
        }
    });

    Object.defineProperty(Event.prototype, 'website', {
        get: function () {
            return this.get('website');
        },
        set: function (value) {
            this.set('website', value);
        }
    });

    Object.defineProperty(Event.prototype, 'address', {
        get: function () {
            return this.get('address');
        },
        set: function (value) {
            this.set('address', value);
        }
    });

    Object.defineProperty(Event.prototype, 'image', {
        get: function () {
            return this.get('image');
        },
        set: function (value) {
            this.set('image', value);
        }
    });

    Object.defineProperty(Event.prototype, 'imageTwo', {
        get: function () {
            return this.get('imageTwo');
        },
        set: function (value) {
            this.set('imageTwo', value);
        }
    });

    Object.defineProperty(Event.prototype, 'imageThree', {
        get: function () {
            return this.get('imageThree');
        },
        set: function (value) {
            this.set('imageThree', value);
        }
    });

    Object.defineProperty(Event.prototype, 'imageFour', {
        get: function () {
            return this.get('imageFour');
        },
        set: function (value) {
            this.set('imageFour', value);
        }
    });

    Object.defineProperty(Event.prototype, 'imageThumb', {
        get: function () {
            return this.get('imageThumb');
        }
    });

 

    Object.defineProperty(Event.prototype, 'location', {
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

    Object.defineProperty(Event.prototype, 'isApproved', {
      get: function () {
          return this.get('isApproved');
      },
      set: function (value) {
          this.set('isApproved', value);
      }
    });

    Object.defineProperty(Event.prototype, 'expiresAt', {
      get: function () {
          return this.get('expiresAt');
      },
      set: function (value) {
          this.set('expiresAt', value);
      }
    });

 	return Event;

 });
