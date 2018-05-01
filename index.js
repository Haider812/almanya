require('newrelic');
var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var S3Adapter = require('parse-server').S3Adapter;
var FSFilesAdapter = require('parse-server-fs-adapter');
var expressLayouts = require('express-ejs-layouts');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var methodOverride = require('method-override');
var cookieSession = require('cookie-session');
var MongoClient = require('mongodb').MongoClient;

// Parse configuration
var databaseUri = process.env.MONGO_URL || 'mongodb://cityapp:U2m5APN3MLad@ds153853.mlab.com:53853/cityapp';
var publicServerUrl = process.env.PUBLIC_SERVER_URL || 'https://mysterious-sierra-22150.herokuapp.com/parse';
var serverUrl = process.env.SERVER_URL || 'https://mysterious-sierra-22150.herokuapp.com/parse';
var appId = 'whispering-stream-70727';
var masterKey = process.env.MASTER_KEY || 'omf0jß3d0j2d30j2d30j2d390jd3290jd3';
// var appName = process.env.APP_NAME || 'My App Name';
var appName = process.env.APP_NAME || 'We Love Almanya';

// Mailgun configuration
// var apiKey = process.env.MAILGUN_API_KEY || 'key-58ad50510427d7e13dda8b35b1e67fdb';
// var domain = process.env.MAILGUN_DOMAIN || 'sandbox82fa6ddc816d451192c454bcb9ccb3e3.mailgun.org';
// var fromAddress = process.env.MAILGUN_FROM_ADDRESS || 'postmaster@sandbox82fa6ddc816d451192c454bcb9ccb3e3.mailgun.org';
// var toAddress = process.env.MAILGUN_TO_ADDRESS || 'fateh.chaabna@schleier.it';

var apiKey = process.env.MAILGUN_API_KEY || 'key-dd20e671b70b2d3acde981f3cb4e29d2';
var domain = process.env.MAILGUN_DOMAIN || 'sandboxae0e6d9c3446456383083117df8c5799.mailgun.org';
var fromAddress = process.env.MAILGUN_FROM_ADDRESS || 'postmaster@sandboxae0e6d9c3446456383083117df8c5799.mailgun.org';
var toAddress = process.env.MAILGUN_TO_ADDRESS || 'andreas.dreessen@schleier.it';

// AWS S3 configuration
var accessKeyId = 'AKIAIZYPPRVSFKXXRFAA';
var secretAccessKey = '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';
var bucketName = 'welovealmanya';

var filesAdapter = new FSFilesAdapter();

if (accessKeyId && secretAccessKey && bucketName) {
  filesAdapter = new S3Adapter(
    accessKeyId, secretAccessKey, bucketName, { directAccess: true });
}

var api = new ParseServer({
  databaseURI: databaseUri,
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: appId,
  masterKey: masterKey,
  serverURL: serverUrl,
  filesAdapter: filesAdapter,
  verifyUserEmails: false,
  publicServerURL: publicServerUrl,
  appName: appName,
  emailAdapter: {
    module: 'parse-server-simple-mailgun-adapter',
    options: {
      fromAddress: fromAddress,
      domain: domain,
      apiKey: apiKey,
    }
  }
});

var app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

app.use(express.static('public'));
app.use(expressLayouts);
app.use(cookieParser());
app.use(methodOverride());

app.use(cookieSession({
  name: 'nearme.sess',
  secret: 'SECRET_SIGNING_KEY',
  maxAge: 15724800000
}));

app.use(function (req, res, next) {
  res.locals.user = req.session.user;
  res.locals.page = req.url.split('/').pop();
  res.locals.appId = appId;
  res.locals.serverUrl = serverUrl;
  next();
});

var checkDatabaseConnection = function (req, res, next) {
  MongoClient.connect(databaseUri, function(error, database) {
    if (error) {
      return res.status(200).send('Verbindung mit der Datenbank fehlgeschlagen.');
    } else {

      var query = new Parse.Query('Place');
      query.count().then(function () {
        return next();
      }, function (error) {
        if (error.code === 100) {
          return res.status(200).send('Es konnte keine Verbindung zu API hergestellt werden.');
        } else {
          return next();
        }
      });
    }
  });
};

app.use(checkDatabaseConnection);

var isNotInstalled = function (req, res, next) {

  var query = new Parse.Query(Parse.Role);
  query.equalTo('name', 'Admin');
  query.first().then(function (adminRole) {

    if (!adminRole) {
      return Parse.Promise.error(new Parse.Error(5000, 'Admin Rolle nicht gefunden'));
    }

    var userRelation = adminRole.relation('users');
    return userRelation.query().count({ useMasterKey: true });
  }).then(function (count) {

    if (count === 0) {
      next();
    } else {
      req.session = null;
      res.redirect('/login');
    }
  }, function (error) {
    if (error.code === 5000) {
      next();
    } else {
      req.session = null;
      res.redirect('/login');
    }
  })
}

var isAdmin = function (req, res, next) {

  var objUser;

  return Parse.Cloud.httpRequest({
    url: serverUrl + '/users/me',
    headers: {
      'X-Parse-Application-Id': appId,
      'X-Parse-Session-Token': req.session.token
    }
  }).then(function (userData) {

    objUser = Parse.Object.fromJSON(userData.data);

    var query = new Parse.Query(Parse.Role);
    query.equalTo('name', 'Admin');
    query.equalTo('users', objUser);
    return query.first();

  }).then(function (isAdmin) {

    if (!isAdmin) {
      return Parse.Promise.error();
    }

    req.user = objUser;
    return next();

  }).then(null, function () {
    req.session = null;
    res.redirect('/login');
  });
}

var isNotAuthenticated = function (req, res, next) {

  if (!req.session.token) return next();

  Parse.Cloud.httpRequest({
    url: serverUrl + '/users/me',
    headers: {
      'X-Parse-Application-Id': appId,
      'X-Parse-Session-Token': req.session.token
    }
  }).then(function (userData) {
    res.redirect('/dashboard/places');
  }, function (error) {
    next();
  });
}

var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.get('/install', isNotInstalled, function (req, res) {
  res.render('install');
});

app.post('/install', [urlencodedParser, isNotInstalled], function (req, res) {

  var name = req.body.name.trim();
  var username = req.body.username.toLowerCase().trim();
  var password = req.body.password.trim();
  var passwordConfirmation = req.body.passwordConfirmation.trim();

  if (!name) {
    return res.render('install', {
      flash: 'Name ist erforderlich',
      input: req.body
    });
  }

  if (!username) {
    return res.render('install', {
      flash: 'Email ist erforderlich',
      input: req.body
    });
  }

  if (password !== passwordConfirmation) {
    return res.render('install', {
      flash: "Kennwort stimmt nicht überein",
      input: req.body
    });
  }

  if (password.length < 6) {
    return res.render('install', {
      flash: 'Das Passwort sollte mindestens 6 Zeichen lang sein',
      input: req.body
    });
  }

  var roles = [];

  var roleACL = new Parse.ACL();
  roleACL.setPublicReadAccess(true);

  var role = new Parse.Role('Admin', roleACL);
  roles.push(role);
  var role = new Parse.Role('User', roleACL);
  roles.push(role);

  var user = new Parse.User();
  user.set('name', name);
  user.set('username', username);
  user.set('email', username);
  user.set('password', password);
  user.set('roleName', 'Admin');
  user.set('photoThumb', undefined);


  var acl = new Parse.ACL();
  acl.setPublicReadAccess(false);
  acl.setPublicWriteAccess(false);
  user.setACL(acl);

  var query = new Parse.Query(Parse.Role);

  query.find().then(function (objRoles) {
    return Parse.Object.destroyAll(objRoles, { useMasterKey: true });
  }).then(function () {
    return Parse.Object.saveAll(roles);
  }).then(function () {
    return user.signUp();
  }).then(function (objUser) {

    req.session.user = objUser;
    req.session.token = objUser.getSessionToken();
    res.redirect('/dashboard/places');
  }, function (error) {
    res.render('install', {
      flash: error.message,
      input: req.body
    });
  });
});

app.get('/', function (req, res) {
  res.redirect('/login');
});

app.get('/login', isNotAuthenticated, function (req, res) {
  res.render('login');
});

app.get('/reset-password', isNotAuthenticated, function (req, res) {
  res.render('reset-password');
});

app.get('/dashboard/places', isAdmin, function (req, res) {
  res.render('places');
});

app.get('/dashboard/tipps', isAdmin, function (req, res) {
  res.render('tkategorien');
});

app.get('/dashboard/menuicons', isAdmin, function (req, res) {
  res.render('icons');
});

app.get('/dashboard/staedte', isAdmin, function (req, res) {
  res.render('ckategorien');
});

app.get('/dashboard/ikategorien', isAdmin, function (req, res) {
  res.render('ikategorien');
});

app.get('/dashboard/vkategorien', isAdmin, function (req, res) {
  res.render('vkategorien');
});

app.get('/dashboard/ekategorien', isAdmin, function (req, res) {
  res.render('ekategorien');
});

app.get('/dashboard/skategorien', isAdmin, function (req, res) {
  res.render('skategorien');
});

app.get('/dashboard/akategorien', isAdmin, function (req, res) {
  res.render('akategorien');
});

app.get('/dashboard/immobilien', isAdmin, function (req, res) {
  res.render('immobilien');
});

app.get('/dashboard/videos', isAdmin, function (req, res) {
  res.render('videos');
});

app.get('/dashboard/events', isAdmin, function (req, res) {
  res.render('events');
});

app.get('/dashboard/sonderangebote', isAdmin, function (req, res) {
  res.render('sonderangebote');
});

app.get('/dashboard/categories', isAdmin, function (req, res) {
  res.render('categories');
});

app.get('/dashboard/users', isAdmin, function (req, res) {
  res.render('users');
});

app.get('/dashboard/reviews', isAdmin, function (req, res) {
  res.render('reviews');
});


// Logs in the user
app.post('/login', [urlencodedParser, isNotAuthenticated], function (req, res) {

  var username = req.body.username || '';
  var password = req.body.password || '';

  Parse.User.logIn(username, password).then(function (user) {

    var query = new Parse.Query(Parse.Role);
    query.equalTo('name', 'Admin');
    query.equalTo('users', user);
    query.first().then(function (isAdmin) {

      if (!isAdmin) {
        res.render('login', {
          flash: 'Nicht berechtigt'
        });
      } else {
        req.session.user = user;
        req.session.token = user.getSessionToken();
        res.redirect('/dashboard/places');
      }

    }, function (error) {
      res.render('login', {
        flash: error.message
      });
    });
  }, function (error) {
    res.render('login', {
      flash: error.message
    });
  });
});

app.get('/logout', isAdmin, function (req, res) {
  req.session = null;
  res.redirect('/login');
});

var port = process.env.PORT || 1337;
app.listen(port, function() {
    console.log('Parse-Server läuft auf Port ' + port + '.');
});
