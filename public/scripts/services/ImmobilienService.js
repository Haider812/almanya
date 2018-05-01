'use strict';

angular.module('nearPlaceApp')
    .factory('Immobilie', function ($q, moment) {

        var Immobilie = Parse.Object.extend('Immobilie', {

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

                create: function (immobilie) {

                    var defer = $q.defer();

                    var objImmobilie = new Immobilie();
                    immobilie.user = Parse.User.current();

                    objImmobilie.save(immobilie, {
                        success: function (success) {
                            defer.resolve(success);
                        }, error: function (obj, error) {
                            defer.reject(error);
                        }
                    });

                    return defer.promise;
                },

                update: function (immobilie) {

                    var defer = $q.defer();

                    immobilie.save(null, {
                        success: function (success) {
                            defer.resolve(success);
                        }, error: function (obj, error) {
                            defer.reject(error);
                        }
                    });

                    return defer.promise;

                },

                destroy: function (immobilie) {

                    var defer = $q.defer();

                    immobilie.destroy({
                        success: function (obj) {
                            defer.resolve(obj);
                        }, error: function (obj, error) {
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

                    if (params.icategory && params.icategory !== null) {
                        query.equalTo('icategory', params.icategory);
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

                    query.include('icategory')
                    query.descending('createdAt');
                    query.limit(params.limit);
                    query.skip((params.page * params.limit) - params.limit);
                    query.find({
                        success: function (immobilien) {
                            defer.resolve(immobilien);
                        }, error: function (error) {
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

                    if (params.icategory && params.icategory !== null) {
                        query.equalTo('icategory', params.icategory);
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
                        success: function (count) {
                            defer.resolve(count);
                        }, error: function (error) {
                            defer.reject(error);
                        }
                    });

                    return defer.promise;
                }

            });

        Object.defineProperty(Immobilie.prototype, 'icategory', {
            get: function () {
                return this.get('icategory');
            },
            set: function (value) {
                this.set('icategory', value);
            }
        });

        Object.defineProperty(Immobilie.prototype, 'user', {
            get: function () {
                return this.get('user');
            },
            set: function (value) {
                this.set('user', value);
            }
        });

        Object.defineProperty(Immobilie.prototype, 'title', {
            get: function () {
                return this.get('title');
            },
            set: function (value) {
                this.set('title', value);
            }
        });

        Object.defineProperty(Immobilie.prototype, 'kaufpreis', {
            get: function () {
                return this.get('kaufpreis');
            },
            set: function (value) {
                this.set('kaufpreis', value);
            }
        });

        Object.defineProperty(Immobilie.prototype, 'miete', {
            get: function () {
                return this.get('miete');
            },
            set: function (value) {
                this.set('miete', value);
            }
        });

        Object.defineProperty(Immobilie.prototype, 'nebenkosten', {
            get: function () {
                return this.get('nebenkosten');
            },
            set: function (value) {
                this.set('nebenkosten', value);
            }
        });

        Object.defineProperty(Immobilie.prototype, 'wohnflaeche', {
            get: function () {
                return this.get('wohnflaeche');
            },
            set: function (value) {
                this.set('wohnflaeche', value);
            }
        });

        Object.defineProperty(Immobilie.prototype, 'grundstuecksflaeche', {
            get: function () {
                return this.get('grundstuecksflaeche');
            },
            set: function (value) {
                this.set('grundstuecksflaeche', value);
            }
        });

        Object.defineProperty(Immobilie.prototype, 'bezugsfrei', {
            get: function () {
                return this.get('bezugsfrei');
            },
            set: function (value) {
                this.set('bezugsfrei', value);
            }
        });

        Object.defineProperty(Immobilie.prototype, 'zimmer', {
            get: function () {
                return this.get('zimmer');
            },
            set: function (value) {
                this.set('zimmer', value);
            }
        });

        Object.defineProperty(Immobilie.prototype, 'balkonGarten', {
            get: function () {
                return this.get('balkonGarten');
            },
            set: function (value) {
                this.set('balkonGarten', value);
            }
        });

        Object.defineProperty(Immobilie.prototype, 'description', {
            get: function () {
                return this.get('description');
            },
            set: function (value) {
                this.set('description', value);
            }
        });

        Object.defineProperty(Immobilie.prototype, 'phone', {
            get: function () {
                return this.get('phone');
            },
            set: function (value) {
                this.set('phone', value);
            }
        });

        Object.defineProperty(Immobilie.prototype, 'website', {
            get: function () {
                return this.get('website');
            },
            set: function (value) {
                this.set('website', value);
            }
        });

        Object.defineProperty(Immobilie.prototype, 'address', {
            get: function () {
                return this.get('address');
            },
            set: function (value) {
                this.set('address', value);
            }
        });

        Object.defineProperty(Immobilie.prototype, 'image', {
            get: function () {
                return this.get('image');
            },
            set: function (value) {
                this.set('image', value);
            }
        });

        Object.defineProperty(Immobilie.prototype, 'imageTwo', {
            get: function () {
                return this.get('imageTwo');
            },
            set: function (value) {
                this.set('imageTwo', value);
            }
        });

        Object.defineProperty(Immobilie.prototype, 'imageThree', {
            get: function () {
                return this.get('imageThree');
            },
            set: function (value) {
                this.set('imageThree', value);
            }
        });

        Object.defineProperty(Immobilie.prototype, 'imageFour', {
            get: function () {
                return this.get('imageFour');
            },
            set: function (value) {
                this.set('imageFour', value);
            }
        });

        Object.defineProperty(Immobilie.prototype, 'imageFive', {
            get: function () {
                return this.get('imageFive');
            },
            set: function (value) {
                this.set('imageFive', value);
            }
        });

        Object.defineProperty(Immobilie.prototype, 'imageSix', {
            get: function () {
                return this.get('imageSix');
            },
            set: function (value) {
                this.set('imageSix', value);
            }
        });

        Object.defineProperty(Immobilie.prototype, 'imageSeven', {
            get: function () {
                return this.get('imageSeven');
            },
            set: function (value) {
                this.set('imageSeven', value);
            }
        });

        Object.defineProperty(Immobilie.prototype, 'imageEight', {
            get: function () {
                return this.get('imageEight');
            },
            set: function (value) {
                this.set('imageEight', value);
            }
        });

        Object.defineProperty(Immobilie.prototype, 'imageNine', {
            get: function () {
                return this.get('imageNine');
            },
            set: function (value) {
                this.set('imageNine', value);
            }
        });

        Object.defineProperty(Immobilie.prototype, 'imageTen', {
            get: function () {
                return this.get('imageTen');
            },
            set: function (value) {
                this.set('imageTen', value);
            }
        });

        Object.defineProperty(Immobilie.prototype, 'imageEleven', {
            get: function () {
                return this.get('imageEleven');
            },
            set: function (value) {
                this.set('imageEleven', value);
            }
        });

        Object.defineProperty(Immobilie.prototype, 'imageTwelve', {
            get: function () {
                return this.get('imageTwelve');
            },
            set: function (value) {
                this.set('imageTwelve', value);
            }
        });

        Object.defineProperty(Immobilie.prototype, 'imageThirteen', {
            get: function () {
                return this.get('imageThirteen');
            },
            set: function (value) {
                this.set('imageThirteen', value);
            }
        });

        Object.defineProperty(Immobilie.prototype, 'imageFourteen', {
            get: function () {
                return this.get('imageFourteen');
            },
            set: function (value) {
                this.set('imageFourteen', value);
            }
        });

        Object.defineProperty(Immobilie.prototype, 'imageFifteen', {
            get: function () {
                return this.get('imageFifteen');
            },
            set: function (value) {
                this.set('imageFifteen', value);
            }
        });

        Object.defineProperty(Immobilie.prototype, 'imageSixteen', {
            get: function () {
                return this.get('imageSixteen');
            },
            set: function (value) {
                this.set('imageSixteen', value);
            }
        });

        Object.defineProperty(Immobilie.prototype, 'imageThumb', {
            get: function () {
                return this.get('imageThumb');
            }
        });

        Object.defineProperty(Immobilie.prototype, 'location', {
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

        Object.defineProperty(Immobilie.prototype, 'isApproved', {
            get: function () {
                return this.get('isApproved');
            },
            set: function (value) {
                this.set('isApproved', value);
            }
        });

        Object.defineProperty(Immobilie.prototype, 'expiresAt', {
            get: function () {
                return this.get('expiresAt');
            },
            set: function (value) {
                this.set('expiresAt', value);
            }
        });

        return Immobilie;

    });
