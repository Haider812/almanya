var Image = require('../helpers/image');

function saveImage (base64) {
  var parseFile = new Parse.File('image.jpg', { base64: base64 });
  return parseFile.save();
}

Parse.Cloud.define('getUserStats', function (req, res) {

  var user = req.user;

  if (!user) {
    return res.error('Not Authorized');
  }

  var queryReview = new Parse.Query('Review');
  queryReview.equalTo('user', user);

  var queryPlace = new Parse.Query('Place');
  queryPlace.equalTo('user', user);

  var queryFavorite = new Parse.Query('Place');
  queryFavorite.equalTo('likes', user);

  var queryReview = queryReview.count({ useMasterKey: true });
  var queryPlace = queryPlace.count({ useMasterKey: true });
  var queryFavorite = queryFavorite.count({ useMasterKey: true });

  Parse.Promise.when(queryReview, queryPlace, queryFavorite)
  .then(function (reviews, places, favorites) {
    res.success({
      reviews: reviews,
      places: places,
      favorites: favorites
    });
  }, function (error) {
    res.error(error);
  });
});

Parse.Cloud.define('findUserByEmail', function(req, res) {

  var query = new Parse.Query(Parse.User);
  query.equalTo('email', req.params.email);
  query.first({ useMasterKey: true }).then(function (results) {
    res.success(results || {});
  }, function (error) {
    res.error(error.message);
  });
});

Parse.Cloud.define('isPlaceStarred', function (req, res) {

  var user = req.user;
  var placeId = req.params.placeId;

  if (!user) {
    return res.error('Not Authorized');
  }

  var objPlace = new Parse.Object('Place');
  objPlace.id = placeId;

  var query = new Parse.Query('Review');
  query.equalTo('place', objPlace);
  query.equalTo('user', user);

  query.first({ useMasterKey: true }).then(function (review) {
    var isStarred = review ? true : false;
    res.success(isStarred);
  }, function (error) {
    res.error(error.message);
  });
});

Parse.Cloud.define('isPlaceLiked', function (req, res) {

  var user = req.user;
  var placeId = req.params.placeId;

  if (!user) {
    return res.error('Not Authorized');
  }

  var query = new Parse.Query('Place');
  query.equalTo('likes', user);
  query.equalTo('objectId', placeId);

  query.first({ useMasterKey: true }).then(function (place) {
    var isLiked = place ? true : false;
    res.success(isLiked);
  }, function (error) {
    res.error(error);
  });
});

Parse.Cloud.define('likePlace', function (req, res) {

  var user = req.user;
  var placeId = req.params.placeId;

  if (!user) {
    return res.error('Not Authorized');
  }

  var query = new Parse.Query('Place');
  var objPlace;
  var response = { action: null };

  query.get(placeId).then(function (place) {
    objPlace = place;
    var queryPlace = new Parse.Query('Place');
    queryPlace.equalTo('likes', user);
    queryPlace.equalTo('objectId', placeId)
    return queryPlace.find();
  }).then(function (result) {

    var relation = objPlace.relation('likes');

    if (result.length > 0) {
      objPlace.increment('likeCount', -1);
      relation.remove(user);
      response.action = 'unlike';
    } else {
      objPlace.increment('likeCount');
      relation.add(user);
      response.action = 'like';
    }

    return objPlace.save(null, { useMasterKey: true });
  }).then(function () {
    res.success(response);
  }, function (error) {
    res.error(error.message);
  });

});


Parse.Cloud.define('isAngebotStarred', function (req, res) {

  var user = req.user;
  var angebotId = req.params.angebotId;

  if (!user) {
    return res.error('Not Authorized');
  }

  var objAngebot = new Parse.Object('Angebot');
  objAngebot.id = angebotId;

  var query = new Parse.Query('Review');
  query.equalTo('angebot', objAngebot);
  query.equalTo('user', user);

  query.first({ useMasterKey: true }).then(function (review) {
    var isStarred = review ? true : false;
    res.success(isStarred);
  }, function (error) {
    res.error(error.message);
  });
});

Parse.Cloud.define('isAngebotLiked', function (req, res) {

  var user = req.user;
  var angebotId = req.params.angebotId;

  if (!user) {
    return res.error('Not Authorized');
  }

  var query = new Parse.Query('Angebot');
  query.equalTo('likes', user);
  query.equalTo('objectId', angebotId);

  query.first({ useMasterKey: true }).then(function (angebot) {
    var isLiked = angebot ? true : false;
    res.success(isLiked);
  }, function (error) {
    res.error(error);
  });
});

Parse.Cloud.define('likeAngebot', function (req, res) {

  var user = req.user;
  var angebotId = req.params.angebotId;

  if (!user) {
    return res.error('Not Authorized');
  }

  var query = new Parse.Query('Angebot');
  var objAngebot;
  var response = { action: null };

  query.get(angebotId).then(function (angebot) {
    objAngebot = angebot;
    var queryAngebot = new Parse.Query('Angebot');
    queryAngebot.equalTo('likes', user);
    queryAngebot.equalTo('objectId', angebotId)
    return queryAngebot.find();
  }).then(function (result) {

    var relation = objAngebot.relation('likes');

    if (result.length > 0) {
      objAngebot.increment('likeCount', -1);
      relation.remove(user);
      response.action = 'unlike';
    } else {
      objAngebot.increment('likeCount');
      relation.add(user);
      response.action = 'like';
    }

    return objAngebot.save(null, { useMasterKey: true });
  }).then(function () {
    res.success(response);
  }, function (error) {
    res.error(error.message);
  });

});


Parse.Cloud.define('isImmobilieStarred', function (req, res) {

  var user = req.user;
  var immobilieId = req.params.immobilieId;

  if (!user) {
    return res.error('Not Authorized');
  }

  var objImmobilie = new Parse.Object('Immobilie');
  objImmobilie.id = immobilieId;

  var query = new Parse.Query('Review');
  query.equalTo('immobilie', objImmobilie);
  query.equalTo('user', user);

  query.first({ useMasterKey: true }).then(function (review) {
    var isStarred = review ? true : false;
    res.success(isStarred);
  }, function (error) {
    res.error(error.message);
  });
});

Parse.Cloud.define('isImmobilieLiked', function (req, res) {

  var user = req.user;
  var immobilieId = req.params.immobilieId;

  if (!user) {
    return res.error('Not Authorized');
  }

  var query = new Parse.Query('Immobilie');
  query.equalTo('likes', user);
  query.equalTo('objectId', immobilieId);

  query.first({ useMasterKey: true }).then(function (immobilie) {
    var isLiked = immobilie ? true : false;
    res.success(isLiked);
  }, function (error) {
    res.error(error);
  });
});

Parse.Cloud.define('likeImmobilie', function (req, res) {

  var user = req.user;
  var immobilieId = req.params.immobilieId;

  if (!user) {
    return res.error('Not Authorized');
  }

  var query = new Parse.Query('Immobilie');
  var objImmobilie;
  var response = { action: null };

  query.get(immobilieId).then(function (immobilie) {
    objImmobilie = immobilie;
    var queryImmobilie = new Parse.Query('Immobilie');
    queryImmobilie.equalTo('likes', user);
    queryImmobilie.equalTo('objectId', immobilieId)
    return queryImmobilie.find();
  }).then(function (result) {

    var relation = objImmobilie.relation('likes');

    if (result.length > 0) {
      objImmobilie.increment('likeCount', -1);
      relation.remove(user);
      response.action = 'unlike';
    } else {
      objImmobilie.increment('likeCount');
      relation.add(user);
      response.action = 'like';
    }

    return objImmobilie.save(null, { useMasterKey: true });
  }).then(function () {
    res.success(response);
  }, function (error) {
    res.error(error.message);
  });

});


Parse.Cloud.define('isVeranstaltungStarred', function (req, res) {

  var user = req.user;
  var veranstaltungId = req.params.veranstaltungId;

  if (!user) {
    return res.error('Not Authorized');
  }

  var objVeranstaltung = new Parse.Object('Veranstaltung');
  objVeranstaltung.id = veranstaltungId;

  var query = new Parse.Query('Review');
  query.equalTo('veranstaltung', objVeranstaltung);
  query.equalTo('user', user);

  query.first({ useMasterKey: true }).then(function (review) {
    var isStarred = review ? true : false;
    res.success(isStarred);
  }, function (error) {
    res.error(error.message);
  });
});

Parse.Cloud.define('isVeranstaltungLiked', function (req, res) {

  var user = req.user;
  var veranstaltungId = req.params.veranstaltungId;

  if (!user) {
    return res.error('Not Authorized');
  }

  var query = new Parse.Query('Veranstaltung');
  query.equalTo('likes', user);
  query.equalTo('objectId', veranstaltungId);

  query.first({ useMasterKey: true }).then(function (veranstaltung) {
    var isLiked = veranstaltung ? true : false;
    res.success(isLiked);
  }, function (error) {
    res.error(error);
  });
});

Parse.Cloud.define('likeVeranstaltung', function (req, res) {

  var user = req.user;
  var veranstaltungId = req.params.veranstaltungId;

  if (!user) {
    return res.error('Not Authorized');
  }

  var query = new Parse.Query('Veranstaltung');
  var objVeranstaltung;
  var response = { action: null };

  query.get(veranstaltungId).then(function (veranstaltung) {
    objVeranstaltung = veranstaltung;
    var queryVeranstaltung = new Parse.Query('Veranstaltung');
    queryVeranstaltung.equalTo('likes', user);
    queryVeranstaltung.equalTo('objectId', veranstaltungId)
    return queryVeranstaltung.find();
  }).then(function (result) {

    var relation = objVeranstaltung.relation('likes');

    if (result.length > 0) {
      objVeranstaltung.increment('likeCount', -1);
      relation.remove(user);
      response.action = 'unlike';
    } else {
      objVeranstaltung.increment('likeCount');
      relation.add(user);
      response.action = 'like';
    }

    return objVeranstaltung.save(null, { useMasterKey: true });
  }).then(function () {
    res.success(response);
  }, function (error) {
    res.error(error.message);
  });

});

Parse.Cloud.define('getUsers', function (req, res) {

  var params = req.params;
  var user = req.user;

  var query = new Parse.Query(Parse.Role);
  query.equalTo('name', 'Admin');
  query.equalTo('users', user);
  query.first().then(function (adminRole) {

    if (!adminRole) {
      return res.error('Not Authorized');
    }

    var query = new Parse.Query(Parse.User);

    if (params.filter != '') {
      query.contains('email', params.filter);
    }

    query.descending('createdAt');
    query.limit(params.limit);
    query.skip((params.page * params.limit) - params.limit);

    var queryUsers = query.find({ useMasterKey: true });
    var queryCount = query.count({ useMasterKey: true });

    return Parse.Promise.when(queryUsers, queryCount);
  }).then(function (users, total) {
    res.success({ users: users, total: total });
  }, function (error) {
    res.error(error);
  });
});

Parse.Cloud.define('createUser', function (req, res) {

  var data = req.params;
  var user = req.user;

  var query = new Parse.Query(Parse.Role);
  query.equalTo('name', 'Admin');
  query.equalTo('users', user);
  query.first().then(function (adminRole) {

    if (!adminRole) {
      return res.error('Not Authorized');
    } else {

      var user = new Parse.User();
      user.set('name', data.name);
      user.set('username', data.email);
      user.set('email', data.email);
      user.set('password', data.password);
      user.set('photo', data.photo);
      user.set('roleName', data.roleName);

      var acl = new Parse.ACL();
      acl.setPublicReadAccess(false);
      acl.setPublicWriteAccess(false);
      user.setACL(acl);

      user.signUp().then(function (objUser) {
        res.success(objUser);
      }, function (error) {
        res.error(error);
      });
    }
  }, function (error) {
    res.error(error);
  });
});

Parse.Cloud.define('updateUser', function (req, res) {

  var data = req.params;
  var user = req.user;

  var query = new Parse.Query(Parse.Role);
  query.equalTo('name', 'Admin');
  query.equalTo('users', user);
  query.first().then(function (adminRole) {

    if (!adminRole) {
      return res.error('Not Authorized');
    }

    var query = new Parse.Query(Parse.User);
    query.equalTo('objectId', data.id);
    return query.first({ useMasterKey: true });
  }).then(function (objUser) {

    objUser.set('name', data.name);
    objUser.set('username', data.email);
    objUser.set('email', data.email);
    objUser.set('photo', data.photo);

    if (!data.password) {
      objUser.set('password', data.password);
    }

    return objUser.save(null, { useMasterKey: true });
  }).then(function (success) {
    res.success(success);
  }, function (error) {
    res.error(error);
  });
});

Parse.Cloud.define('destroyUser', function (req, res) {

  var params = req.params;
  var user = req.user;

  var query = new Parse.Query(Parse.Role);
  query.equalTo('name', 'Admin');
  query.equalTo('users', user);
  query.first().then(function (adminRole) {

    if (!adminRole) {
      return res.error('Not Authorized');
    }

    var query = new Parse.Query(Parse.User);
    query.equalTo('objectId', params.id);
    return query.first({ useMasterKey: true });
  }).then(function (objUser) {

    if (!objUser) {
      return res.error('User not found');
    }

    return objUser.destroy({ useMasterKey: true });
  }).then(function (success) {
    res.success(success);
  }, function (error) {
    res.error(error);
  });
});

Parse.Cloud.define('saveFacebookPicture', function (req, res) {

   var user = req.user;

   if (!user) {
     res.error('Not Authorized');
     return;
   }

   user.fetch({ sessionToken: user.getSessionToken() }).then(function (objUser) {

     var authData = objUser.get('authData');

     if (!authData) {
       res.error('No auth data found');
       return;
     }

     var url = 'https://graph.facebook.com/' + authData.facebook.id + '/picture';
     return Parse.Cloud.httpRequest({ url: url, followRedirects: true, params: { type: 'large' } });

   }).then(function (httpResponse) {
     var buffer = httpResponse.buffer;
     var base64 = buffer.toString('base64');
     var parseFile = new Parse.File('image.jpg', { base64: base64 });
     return parseFile.save();
   }).then(function (savedFile) {
     user.set({ 'photo': savedFile });
     return user.save(null, { sessionToken: user.getSessionToken() });
   }).then(function (success) {
     res.success(success);
   }, function (error) {
     res.error(error);
   });
});

Parse.Cloud.beforeSave('Category', function (req, res) {

  var category = req.object;
  var user = req.user;

  if (!user) {
    return res.error('Not Authorized');
  }

  if (!category.get('image')) {
   return res.error('Bild erforderlich.');
  }

  if (!category.existed()) {
    var acl = new Parse.ACL();
    acl.setPublicReadAccess(true);
    acl.setRoleWriteAccess('Admin', true);
    category.setACL(acl);
  }

  if (category.dirty('title') && category.get('title')) {
    category.set('canonical', category.get('title').toLowerCase());
    return res.success();
  }

  if (!category.dirty('image')) {
    return res.success();
  }

  var imageUrl = category.get('image').url();

  Image.resize(imageUrl, 810, 540).then(function (base64) {
    return saveImage(base64);
  }).then(function (savedFile) {
    category.set('image', savedFile);
    return Image.resize(imageUrl, 160, 160);
  }).then(function (base64) {
    return saveImage(base64);
  }).then(function (savedFile) {
    category.set('imageThumb', savedFile);
    res.success();
  }, function (error) {
    res.error(error.message);
  });

});


Parse.Cloud.beforeSave('iCategory', function (req, res) {

  var icategory = req.object;
  var user = req.user;

  if (!user) {
    return res.error('Not Authorized');
  }

  if (!icategory.get('image')) {
   return res.error('Bild erforderlich.');
  }

  if (!icategory.existed()) {
    var acl = new Parse.ACL();
    acl.setPublicReadAccess(true);
    acl.setRoleWriteAccess('Admin', true);
    icategory.setACL(acl);
  }

  if (icategory.dirty('title') && icategory.get('title')) {
    icategory.set('canonical', icategory.get('title').toLowerCase());
    return res.success();
  }

  if (!icategory.dirty('image')) {
    return res.success();
  }

  var imageUrl = icategory.get('image').url();

  Image.resize(imageUrl, 810, 540).then(function (base64) {
    return saveImage(base64);
  }).then(function (savedFile) {
    icategory.set('image', savedFile);
    return Image.resize(imageUrl, 160, 160);
  }).then(function (base64) {
    return saveImage(base64);
  }).then(function (savedFile) {
    icategory.set('imageThumb', savedFile);
    res.success();
  }, function (error) {
    res.error(error.message);
  });

});

Parse.Cloud.beforeSave('eCategory', function (req, res) {

  var ecategory = req.object;
  var user = req.user;

  if (!user) {
    return res.error('Not Authorized');
  }

  if (!ecategory.get('image')) {
   return res.error('Bild erforderlich.');
  }

  if (!ecategory.existed()) {
    var acl = new Parse.ACL();
    acl.setPublicReadAccess(true);
    acl.setRoleWriteAccess('Admin', true);
    ecategory.setACL(acl);
  }

  if (ecategory.dirty('title') && ecategory.get('title')) {
    ecategory.set('canonical', ecategory.get('title').toLowerCase());
    return res.success();
  }

  if (!ecategory.dirty('image')) {
    return res.success();
  }

  var imageUrl = ecategory.get('image').url();

  Image.resize(imageUrl, 810, 540).then(function (base64) {
    return saveImage(base64);
  }).then(function (savedFile) {
    ecategory.set('image', savedFile);
    return Image.resize(imageUrl, 160, 160);
  }).then(function (base64) {
    return saveImage(base64);
  }).then(function (savedFile) {
    ecategory.set('imageThumb', savedFile);
    res.success();
  }, function (error) {
    res.error(error.message);
  });

});


Parse.Cloud.beforeSave('cCategory', function (req, res) {

  var ccategory = req.object;
  var user = req.user;

  if (!user) {
    return res.error('Not Authorized');
  }

  if (!ccategory.get('image')) {
   return res.error('Bild erforderlich.');
  }

  if (!ccategory.existed()) {
    var acl = new Parse.ACL();
    acl.setPublicReadAccess(true);
    acl.setRoleWriteAccess('Admin', true);
    ccategory.setACL(acl);
  }

  if (ccategory.dirty('title') && ccategory.get('title')) {
    ccategory.set('canonical', ccategory.get('title').toLowerCase());
	 return res.success();
  }

  if (!ccategory.dirty('image')) {
    return res.success();
  }

  var imageUrl = ccategory.get('image').url();

  Image.resize(imageUrl, 810, 540).then(function (base64) {
    return saveImage(base64);
  }).then(function (savedFile) {
    ccategory.set('image', savedFile);
    return Image.resize(imageUrl, 160, 160);
  }).then(function (base64) {
    return saveImage(base64);
  }).then(function (savedFile) {
    ccategory.set('imageThumb', savedFile);
    res.success();
  }, function (error) {
    res.error(error.message);
  });

});

Parse.Cloud.beforeSave('sCategory', function (req, res) {

  var scategory = req.object;
  var user = req.user;

  if (!user) {
    return res.error('Not Authorized');
  }

  if (!scategory.get('image')) {
   return res.error('Bild erforderlich.');
  }

  if (!scategory.existed()) {
    var acl = new Parse.ACL();
    acl.setPublicReadAccess(true);
    acl.setRoleWriteAccess('Admin', true);
    scategory.setACL(acl);
  }

  if (scategory.dirty('title') && scategory.get('title')) {
    scategory.set('canonical', scategory.get('title').toLowerCase());
	 return res.success();
  }

  if (!scategory.dirty('image')) {
    return res.success();
  }

  var imageUrl = scategory.get('image').url();

  Image.resize(imageUrl, 810, 540).then(function (base64) {
    return saveImage(base64);
  }).then(function (savedFile) {
    scategory.set('image', savedFile);
    return Image.resize(imageUrl, 160, 160);
  }).then(function (base64) {
    return saveImage(base64);
  }).then(function (savedFile) {
    scategory.set('imageThumb', savedFile);
    res.success();
  }, function (error) {
    res.error(error.message);
  });

});

Parse.Cloud.beforeSave('menuIcon', function (req, res) {

  var menuicon = req.object;
  var user = req.user;

  if (!user) {
    return res.error('Not Authorized');
  }

  // if (!menuicon.get('image')) {
   // return res.error('Bild erforderlich.');
  // }

  if (!menuicon.existed()) {
    var acl = new Parse.ACL();
    acl.setPublicReadAccess(true);
    acl.setRoleWriteAccess('Admin', true);
    menuicon.setACL(acl);
  }

  if (menuicon.dirty('title') && menuicon.get('title')) {
    menuicon.set('canonical', menuicon.get('title').toLowerCase());
	 return res.success();
  }

  // if (!menuicon.dirty('image')) {
    // return res.success();
  // }

  // var imageUrl = menuicon.get('image').url();

  // Image.resize(imageUrl, 810, 540).then(function (base64) {
    // return saveImage(base64);
  // }).then(function (savedFile) {
    // menuicon.set('image', savedFile);
    // return Image.resize(imageUrl, 160, 160);
  // }).then(function (base64) {
    // return saveImage(base64);
  // }).then(function (savedFile) {
    // menuicon.set('imageThumb', savedFile);
    // res.success();
  // }, function (error) {
    // res.error(error.message);
  // });

});

Parse.Cloud.beforeSave('tCategory', function (req, res) {

  var tcategory = req.object;
  var user = req.user;

  if (!user) {
    return res.error('Not Authorized');
  }

  if (!tcategory.get('image')) {
   return res.error('Bild erforderlich.');
  }

  if (!tcategory.existed()) {
    var acl = new Parse.ACL();
    acl.setPublicReadAccess(true);
    acl.setRoleWriteAccess('Admin', true);
    tcategory.setACL(acl);
  }

  if (tcategory.dirty('title') && tcategory.get('title')) {
    tcategory.set('canonical', tcategory.get('title').toLowerCase());
	 return res.success();
  }

  if (!tcategory.dirty('image')) {
    return res.success();
  }

  var imageUrl = tcategory.get('image').url();

  Image.resize(imageUrl, 810, 540).then(function (base64) {
    return saveImage(base64);
  }).then(function (savedFile) {
    tcategory.set('image', savedFile);
    return Image.resize(imageUrl, 160, 160);
  }).then(function (base64) {
    return saveImage(base64);
  }).then(function (savedFile) {
    tcategory.set('imageThumb', savedFile);
    res.success();
  }, function (error) {
    res.error(error.message);
  });

});



Parse.Cloud.beforeSave('Place', function (req, res) {

  var place = req.object;
  var user = req.user;

  if (req.master) {
    return res.success();
  }

  if (!user) {
    return res.error('Not Authorized');
  }

  if (!place.existed()) {
    var acl = new Parse.ACL();
    acl.setPublicReadAccess(true);
    acl.setRoleWriteAccess('Admin', true);
    acl.setWriteAccess(user, true);
    place.setACL(acl);
  }

  if (!place.get('image')) {
    return res.error('Upload the first image');
  }

  if (place.dirty('title') && place.get('title')) {
    place.set('canonical', place.get('title').toLowerCase());
  }

  if (!place.dirty('image') && !place.dirty('imageTwo') &&
   !place.dirty('imageThree') && !place.dirty('imageFour')) {
    return res.success();
  }

  var promises = [];

  if (place.get('image') && place.dirty('image')) {
    var url = place.get('image').url();

    var promise = Image.resize(url, 800, 510).then(function (base64) {
      return saveImage(base64);
    }).then(function (savedFile) {
      place.set('image', savedFile);
    });

    promises.push(promise);

    var promiseThumb = Image.resize(url, 160, 160).then(function (base64) {
      return saveImage(base64);
    }).then(function (savedFile) {
      place.set('imageThumb', savedFile);
    });

    promises.push(promiseThumb);
  }

  if (place.get('imageTwo') && place.dirty('imageTwo')) {
    var url = place.get('imageTwo').url();

    var promise = Image.resize(url, 800, 510).then(function (base64) {
      return saveImage(base64);
    }).then(function (savedFile) {
      place.set('imageTwo', savedFile);
    });
    promises.push(promise);
  }

  if (place.get('imageThree') && place.dirty('imageThree')) {
    var url = place.get('imageThree').url();

    var promise = Image.resize(url, 800, 510).then(function (base64) {
      return saveImage(base64);
    }).then(function (savedFile) {
      place.set('imageThree', savedFile);
    });
    promises.push(promise);
  }

  if (place.get('imageFour') && place.dirty('imageFour')) {
    var url = place.get('imageFour').url();

    var promise = Image.resize(url, 800, 510).then(function (base64) {
      return saveImage(base64);
    }).then(function (savedFile) {
      place.set('imageFour', savedFile);
    });
    promises.push(promise);
  }

  Parse.Promise.when(promises).then(function (result) {
    res.success();
  }, function (error) {
    res.error(error);
  });
});



// Parse.Cloud.beforeSave('Veranstaltung', function (req, res) {

  // var veranstaltung = req.object;
  
  // console.log("Veranstaltung Objekt:");
  // console.log(veranstaltung);
  
  // var user = req.user;

  // if (req.master) {
	    // console.log(1);
    // return res.success();
  // }

  // if (!user) {
		    // console.log(2);
    // return res.error('Not Authorized');
  // }

  // if (!veranstaltung.existed()) {
	  	    // console.log(3);
    // var acl = new Parse.ACL();
    // acl.setPublicReadAccess(true);
    // acl.setRoleWriteAccess('Admin', true);
    // acl.setWriteAccess(user, true);
    // veranstaltung.setACL(acl);
  // }

  // if (!veranstaltung.get('image')) {
    // return res.error('Upload the first image');
  // }

  // if (veranstaltung.dirty('title') && veranstaltung.get('title')) {
    // veranstaltung.set('canonical', veranstaltung.get('title').toLowerCase());
		    // console.log(4);
  // }

  // if (!veranstaltung.dirty('image') && !veranstaltung.dirty('imageTwo') &&
   // !veranstaltung.dirty('imageThree') && !veranstaltung.dirty('imageFour')) {
	    // console.log(5);
 
    // return res.success();
 // }	
  // var promises = [];

  // if (veranstaltung.get('image') && veranstaltung.dirty('image')) {
    // var url = veranstaltung.get('image').url();

    // var promise = Image.resize(url, 800, 510).then(function (base64) {
      // return saveImage(base64);
    // }).then(function (savedFile) {
      // veranstaltung.set('image', savedFile);
    // });

    // promises.push(promise);

    // var promiseThumb = Image.resize(url, 160, 160).then(function (base64) {
      // return saveImage(base64);
    // }).then(function (savedFile) {
      // veranstaltung.set('imageThumb', savedFile);
    // });

    // promises.push(promiseThumb);
  // }

  // if (veranstaltung.get('imageTwo') && veranstaltung.dirty('imageTwo')) {
    // var url = veranstaltung.get('imageTwo').url();

    // var promise = Image.resize(url, 800, 510).then(function (base64) {
      // return saveImage(base64);
    // }).then(function (savedFile) {
      // veranstaltung.set('imageTwo', savedFile);
    // });
    // promises.push(promise);
  // }

  // if (veranstaltung.get('imageThree') && veranstaltung.dirty('imageThree')) {
    // var url = veranstaltung.get('imageThree').url();

    // var promise = Image.resize(url, 800, 510).then(function (base64) {
      // return saveImage(base64);
    // }).then(function (savedFile) {
      // veranstaltung.set('imageThree', savedFile);
    // });
    // promises.push(promise);
  // }

  // if (veranstaltung.get('imageFour') && veranstaltung.dirty('imageFour')) {
    // var url = veranstaltung.get('imageFour').url();

    // var promise = Image.resize(url, 800, 510).then(function (base64) {
      // return saveImage(base64);
    // }).then(function (savedFile) {
      // veranstaltung.set('imageFour', savedFile);
    // });
    // promises.push(promise);
  // }

  // Parse.Promise.when(promises).then(function (result) {
	  	    // console.log(6);
    // res.success();
  // }, function (error) {
	  	    // console.log(7);
    // res.error(error);
  // });
// });


Parse.Cloud.beforeSave('Immobilie', function (req, res) {

  var immobilie = req.object;
  var user = req.user;

  if (req.master) {
    return res.success();
  }

  if (!user) {
    return res.error('Not Authorized');
  }

  if (!immobilie.existed()) {
    var acl = new Parse.ACL();
    acl.setPublicReadAccess(true);
    acl.setRoleWriteAccess('Admin', true);
    acl.setWriteAccess(user, true);
    immobilie.setACL(acl);
  }

  if (!immobilie.get('image')) {
    return res.error('Upload the first image');
  }

  if (immobilie.dirty('title') && immobilie.get('title')) {
    immobilie.set('canonical', immobilie.get('title').toLowerCase());
  }

  if (!immobilie.dirty('image') && !immobilie.dirty('imageTwo') &&
   !immobilie.dirty('imageThree') && !immobilie.dirty('imageFour')
   && !immobilie.dirty('imageFive') && !immobilie.dirty('imageSix')
   && !immobilie.dirty('imageSeven') && !immobilie.dirty('imageEight')
   && !immobilie.dirty('imageNine') && !immobilie.dirty('imageTen')
   && !immobilie.dirty('imageEleven') && !immobilie.dirty('imageTwelve')
   && !immobilie.dirty('imageThirteen') && !immobilie.dirty('imageFourteen')
   && !immobilie.dirty('imageFifteen') && !immobilie.dirty('imageSixteen')
  ) {
    return res.success();
  }

  var promises = [];

  if (immobilie.get('image') && immobilie.dirty('image')) {
    var url = immobilie.get('image').url();

    var promise = Image.resize(url, 800, 510).then(function (base64) {
      return saveImage(base64);
    }).then(function (savedFile) {
      immobilie.set('image', savedFile);
    });

    promises.push(promise);

    var promiseThumb = Image.resize(url, 160, 160).then(function (base64) {
      return saveImage(base64);
    }).then(function (savedFile) {
      immobilie.set('imageThumb', savedFile);
    });

    promises.push(promiseThumb);
  }

  if (immobilie.get('imageTwo') && immobilie.dirty('imageTwo')) {
    var url = immobilie.get('imageTwo').url();

    var promise = Image.resize(url, 800, 510).then(function (base64) {
      return saveImage(base64);
    }).then(function (savedFile) {
      immobilie.set('imageTwo', savedFile);
    });
    promises.push(promise);
  }

  if (immobilie.get('imageThree') && immobilie.dirty('imageThree')) {
    var url = immobilie.get('imageThree').url();

    var promise = Image.resize(url, 800, 510).then(function (base64) {
      return saveImage(base64);
    }).then(function (savedFile) {
      immobilie.set('imageThree', savedFile);
    });
    promises.push(promise);
  }

  if (immobilie.get('imageFour') && immobilie.dirty('imageFour')) {
    var url = immobilie.get('imageFour').url();

    var promise = Image.resize(url, 800, 510).then(function (base64) {
      return saveImage(base64);
    }).then(function (savedFile) {
      immobilie.set('imageFour', savedFile);
    });
    promises.push(promise);
  }

  if (immobilie.get('imageFive') && immobilie.dirty('imageFive')) {
    var url = immobilie.get('imageFive').url();

    var promise = Image.resize(url, 800, 510).then(function (base64) {
      return saveImage(base64);
    }).then(function (savedFile) {
      immobilie.set('imageFive', savedFile);
    });
    promises.push(promise);
  }

  if (immobilie.get('imageSix') && immobilie.dirty('imageSix')) {
    var url = immobilie.get('imageSix').url();

    var promise = Image.resize(url, 800, 510).then(function (base64) {
      return saveImage(base64);
    }).then(function (savedFile) {
      immobilie.set('imageSix', savedFile);
    });
    promises.push(promise);
  }

  if (immobilie.get('imageSeven') && immobilie.dirty('imageSeven')) {
    var url = immobilie.get('imageSeven').url();

    var promise = Image.resize(url, 800, 510).then(function (base64) {
      return saveImage(base64);
    }).then(function (savedFile) {
      immobilie.set('imageSeven', savedFile);
    });
    promises.push(promise);
  }

  if (immobilie.get('imageEight') && immobilie.dirty('imageEight')) {
    var url = immobilie.get('imageEight').url();

    var promise = Image.resize(url, 800, 510).then(function (base64) {
      return saveImage(base64);
    }).then(function (savedFile) {
      immobilie.set('imageEight', savedFile);
    });
    promises.push(promise);
  }

  if (immobilie.get('imageNine') && immobilie.dirty('imageNine')) {
    var url = immobilie.get('imageNine').url();

    var promise = Image.resize(url, 800, 510).then(function (base64) {
      return saveImage(base64);
    }).then(function (savedFile) {
      immobilie.set('imageNine', savedFile);
    });
    promises.push(promise);
  }

  if (immobilie.get('imageTen') && immobilie.dirty('imageTen')) {
    var url = immobilie.get('imageTen').url();

    var promise = Image.resize(url, 800, 510).then(function (base64) {
      return saveImage(base64);
    }).then(function (savedFile) {
      immobilie.set('imageTen', savedFile);
    });
    promises.push(promise);
  }

  if (immobilie.get('imageEleven') && immobilie.dirty('imageEleven')) {
    var url = immobilie.get('imageEleven').url();

    var promise = Image.resize(url, 800, 510).then(function (base64) {
      return saveImage(base64);
    }).then(function (savedFile) {
      immobilie.set('imageEleven', savedFile);
    });
    promises.push(promise);
  }

  if (immobilie.get('imageTwelve') && immobilie.dirty('imageTwelve')) {
    var url = immobilie.get('imageTwelve').url();

    var promise = Image.resize(url, 800, 510).then(function (base64) {
      return saveImage(base64);
    }).then(function (savedFile) {
      immobilie.set('imageTwelve', savedFile);
    });
    promises.push(promise);
  }

  if (immobilie.get('imageThirteen') && immobilie.dirty('imageThirteen')) {
    var url = immobilie.get('imageThirteen').url();

    var promise = Image.resize(url, 800, 510).then(function (base64) {
      return saveImage(base64);
    }).then(function (savedFile) {
      immobilie.set('imageThirteen', savedFile);
    });
    promises.push(promise);
  }

  if (immobilie.get('imageFourteen') && immobilie.dirty('imageFourteen')) {
    var url = immobilie.get('imageFourteen').url();

    var promise = Image.resize(url, 800, 510).then(function (base64) {
      return saveImage(base64);
    }).then(function (savedFile) {
      immobilie.set('imageFourteen', savedFile);
    });
    promises.push(promise);
  }

  if (immobilie.get('imageFifteen') && immobilie.dirty('imageFifteen')) {
    var url = immobilie.get('imageFifteen').url();

    var promise = Image.resize(url, 800, 510).then(function (base64) {
      return saveImage(base64);
    }).then(function (savedFile) {
      immobilie.set('imageFifteen', savedFile);
    });
    promises.push(promise);
  }

  if (immobilie.get('imageSixteen') && immobilie.dirty('imageSixteen')) {
    var url = immobilie.get('imageSixteen').url();

    var promise = Image.resize(url, 800, 510).then(function (base64) {
      return saveImage(base64);
    }).then(function (savedFile) {
      immobilie.set('imageSixteen', savedFile);
    });
    promises.push(promise);
  }

  Parse.Promise.when(promises).then(function (result) {
    res.success();
  }, function (error) {
    res.error(error);
  });
});


Parse.Cloud.beforeSave('Event', function (req, res) {

  var evente = req.object;
  var user = req.user;

  if (req.master) {
    return res.success();
  }

  if (!user) {
    return res.error('Not Authorized');
  }

  if (!evente.existed()) {
    var acl = new Parse.ACL();
    acl.setPublicReadAccess(true);
    acl.setRoleWriteAccess('Admin', true);
    acl.setWriteAccess(user, true);
    evente.setACL(acl);
  }

  if (!evente.get('image')) {
    return res.error('Upload the first image');
  }

  if (evente.dirty('title') && evente.get('title')) {
    evente.set('canonical', evente.get('title').toLowerCase());
  }

  if (!evente.dirty('image') && !evente.dirty('imageTwo') &&
   !evente.dirty('imageThree') && !evente.dirty('imageFour')) {
    return res.success();
  }

  var promises = [];

  if (evente.get('image') && evente.dirty('image')) {
    var url = evente.get('image').url();

    var promise = Image.resize(url, 800, 510).then(function (base64) {
      return saveImage(base64);
    }).then(function (savedFile) {
      evente.set('image', savedFile);
    });

    promises.push(promise);

    var promiseThumb = Image.resize(url, 160, 160).then(function (base64) {
      return saveImage(base64);
    }).then(function (savedFile) {
      evente.set('imageThumb', savedFile);
    });

    promises.push(promiseThumb);
  }

  if (evente.get('imageTwo') && evente.dirty('imageTwo')) {
    var url = evente.get('imageTwo').url();

    var promise = Image.resize(url, 800, 510).then(function (base64) {
      return saveImage(base64);
    }).then(function (savedFile) {
      evente.set('imageTwo', savedFile);
    });
    promises.push(promise);
  }

  if (evente.get('imageThree') && evente.dirty('imageThree')) {
    var url = evente.get('imageThree').url();

    var promise = Image.resize(url, 800, 510).then(function (base64) {
      return saveImage(base64);
    }).then(function (savedFile) {
      evente.set('imageThree', savedFile);
    });
    promises.push(promise);
  }

  if (evente.get('imageFour') && evente.dirty('imageFour')) {
    var url = evente.get('imageFour').url();

    var promise = Image.resize(url, 800, 510).then(function (base64) {
      return saveImage(base64);
    }).then(function (savedFile) {
      evente.set('imageFour', savedFile);
    });
    promises.push(promise);
  }

  Parse.Promise.when(promises).then(function (result) {
    res.success();
  }, function (error) {
    res.error(error);
  });
});

Parse.Cloud.beforeSave('Sonderangebot', function (req, res) {

  var sonderangebot = req.object;
  var user = req.user;

  if (req.master) {
    return res.success();
  }

  if (!user) {
    return res.error('Not Authorized');
  }

  if (!sonderangebot.existed()) {
    var acl = new Parse.ACL();
    acl.setPublicReadAccess(true);
    acl.setRoleWriteAccess('Admin', true);
    acl.setWriteAccess(user, true);
    sonderangebot.setACL(acl);
  }

  if (!sonderangebot.get('image')) {
    return res.error('Upload the first image');
  }

  if (sonderangebot.dirty('title') && sonderangebot.get('title')) {
    sonderangebot.set('canonical', sonderangebot.get('title').toLowerCase());
  }

  if (!sonderangebot.dirty('image') && !sonderangebot.dirty('imageTwo') &&
   !sonderangebot.dirty('imageThree') && !sonderangebot.dirty('imageFour')) {
    return res.success();
  }

  var promises = [];

  if (sonderangebot.get('image') && sonderangebot.dirty('image')) {
    var url = sonderangebot.get('image').url();

    var promise = Image.resize(url, 800, 510).then(function (base64) {
      return saveImage(base64);
    }).then(function (savedFile) {
      sonderangebot.set('image', savedFile);
    });

    promises.push(promise);

    var promiseThumb = Image.resize(url, 160, 160).then(function (base64) {
      return saveImage(base64);
    }).then(function (savedFile) {
      sonderangebot.set('imageThumb', savedFile);
    });

    promises.push(promiseThumb);
  }

  if (sonderangebot.get('imageTwo') && sonderangebot.dirty('imageTwo')) {
    var url = sonderangebot.get('imageTwo').url();

    var promise = Image.resize(url, 800, 510).then(function (base64) {
      return saveImage(base64);
    }).then(function (savedFile) {
      sonderangebot.set('imageTwo', savedFile);
    });
    promises.push(promise);
  }

  if (sonderangebot.get('imageThree') && sonderangebot.dirty('imageThree')) {
    var url = sonderangebot.get('imageThree').url();

    var promise = Image.resize(url, 800, 510).then(function (base64) {
      return saveImage(base64);
    }).then(function (savedFile) {
      sonderangebot.set('imageThree', savedFile);
    });
    promises.push(promise);
  }

  if (sonderangebot.get('imageFour') && sonderangebot.dirty('imageFour')) {
    var url = sonderangebot.get('imageFour').url();

    var promise = Image.resize(url, 800, 510).then(function (base64) {
      return saveImage(base64);
    }).then(function (savedFile) {
      sonderangebot.set('imageFour', savedFile);
    });
    promises.push(promise);
  }

  Parse.Promise.when(promises).then(function (result) {
    res.success();
  }, function (error) {
    res.error(error);
  });
});


Parse.Cloud.beforeSave('Review', function (req, res) {

  var review = req.object;
  var user = req.user;

  if (req.master) {
    return res.success();
  }

  if (!user) {
    return res.error('Not Authorized');
  }

  if (!review.existed()) {
    var acl = new Parse.ACL();
    acl.setPublicReadAccess(true);
    acl.setRoleWriteAccess('Admin', true);
    acl.setWriteAccess(user, true);
    review.setACL(acl);
    review.set('isInappropriate', false);
    review.set('user', user);
  }

  if (review.existed() && review.dirty('isInappropriate')) {
    return res.success();
  }

  var query = new Parse.Query('Review');
  query.equalTo('user', user);
  query.equalTo('place', review.get('place'));

  query.find().then(function (obj) {

    if (obj.length > 0) {
      return res.error('You already write a review for this place');
    } else if (review.get('rating') < 1) {
      return res.error('You cannot give less than one star');
    } else if (review.get('rating') > 5) {
      return res.error('You cannot give more than five stars');
    } else {

      var query = new Parse.Query('UserData');
      query.equalTo('user', user);
      return query.first();
    }
  }).then(function (userData) {

    if (userData) {
      review.set('userData', userData);
      res.success();
    } else {
      res.error('UserData not found');
    }
  }, function (error) {
    res.error(error.message);
  });

  query.find({
    success: function (res1) {

    },
    error: function (obj, error) {
      res.error(error);
    }
  });
});

Parse.Cloud.afterSave('Review', function (req) {

  var review = req.object;
  var rating = review.get('rating');
  var placeId = review.get('place').id;

  var query = new Parse.Query('Place');

  query.get(placeId).then(function (place) {

    var currentTotalRating = place.get('ratingTotal') || 0;

    place.increment('ratingCount');
    place.set('ratingTotal', currentTotalRating + rating);
    place.save(null, { useMasterKey: true });

  });
});

Parse.Cloud.beforeSave(Parse.User, function (req, res) {

  var user = req.object;

  if (user.existed() && user.dirty('roleName') && !req.master) {
    return res.error('Role cannot be changed');
  }

  if (!user.get('photo') || !user.dirty('photo')) {
    return res.success();
  }

  var imageUrl = user.get('photo').url();

  Image.resize(imageUrl, 160, 160).then(function (base64) {
    return saveImage(base64);
  }).then(function (savedFile) {
    user.set('photo', savedFile);
    res.success();
  }, function (error) {
    res.error(error);
  });
});

Parse.Cloud.afterSave(Parse.User, function (req) {

  var user = req.object;
  var userRequesting = req.user;

  var queryUserData = new Parse.Query('UserData');
  queryUserData.equalTo('user', user);
  queryUserData.first().then(function (userData) {

    if (userData) {
      userData.set('name', user.get('name'));
      userData.set('photo', user.get('photo'));
    } else {

      var aclUserData = new Parse.ACL();
      aclUserData.setPublicReadAccess(true);
      aclUserData.setWriteAccess(user, true);

      var userData = new Parse.Object('UserData', {
        user: user,
        ACL: aclUserData,
        name: user.get('name'),
        photo: user.get('photo'),
      });
    }
    userData.save(null, { useMasterKey: true });
  });

  if (!user.existed()) {

    var query = new Parse.Query(Parse.Role);
    query.equalTo('name', 'Admin');
    query.equalTo('users', userRequesting);
    query.first({ useMasterKey: true }).then(function (isAdmin) {

      if (!isAdmin && user.get('roleName') === 'Admin') {
        return Parse.Promise.error(new Parse.Error(1, 'Not Authorized'));
      }

      var roleName = user.get('roleName') || 'User';

      var innerQuery = new Parse.Query(Parse.Role);
      innerQuery.equalTo('name', roleName);
      return innerQuery.first({ useMasterKey: true });
    }).then(function (role) {

      if (!role) {
        return Parse.Promise.error(new Parse.Error(1, 'Role not found'));
      }

      role.getUsers().add(user);
      return role.save(null, { useMasterKey: true });
    }).then(function () {
      console.log(success);
    }, function (error) {
      console.error('Got an error ' + error.code + ' : ' + error.message);
    })
  }
});
