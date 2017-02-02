var express = require('express');
var serveStatic = require('serve-static');
var mongodb = require('mongodb').MongoClient;

var app = express();
var port =  process.env.PORT;

var eventsJson= [  {
                name: 'Event 1',
                description: 'The first event',
                date: '2016.01.01',
                time: '1:00 PM',
                duration: '1 Hour',
                location: {
                    streetAddr: '101 Main St.',
                    city: 'Los Angeles',
                    state: 'CA',
                    zip: '87885',
                    lon: 0,
                    lat: 0
                    },
                capacity: 100
                },
                {
                name: 'Event 2',
                description: 'The second event',
                date: '2016.02.02',
                time: '2:00 PM',
                duration: '2 Hours',
                location: {
                    streetAddr: '202 Main St.',
                    city: 'Los Angeles',
                    state: 'CA',
                    zip: '87885',
                    lon: 0,
                    lat: 0
                    },
                capacity: 200
                },
                {
                name: 'Event 3',
                description: 'The third event',
                date: '2016.03.03',
                time: '3:00 PM',
                duration: '3 Hours',
                location: {
                    streetAddr: '303 Main St.',
                    city: 'Los Angeles',
                    state: 'CA',
                    zip: '87885',
                    lon: 0,
                    lat: 0
                    },
                capacity: 300
                },
                {
                name: 'Event 4',
                description: 'The fourth event',
                date: '2016.04.04',
                time: '4:00 PM',
                duration: '4 Hours',
                location: {
                    streetAddr: '404 Main St.',
                    city: 'Los Angeles',
                    state: 'CA',
                    zip: '87885',
                    lon: 0,
                    lat: 0
                    },
                capacity: 400
                }
];

app.use(serveStatic(__dirname + '/bower_components'));
app.use(serveStatic(__dirname + '/public'));
// app.use(serveStatic(__dirname + '/src/views'));

app.set('views', './src/views');
app.set('view engine', 'ejs');

var registryDox = "[]";
var zipAggDox = "[]";

var registryAggregate = function(db, callback){
    db.collection('registry').aggregate(
        [{"$group" : {"_id" : "$user.email", "attending" : { "$addToSet" : "$event.name" }}}, {"$sort" : {"_id" : 1 }}]
    ).toArray(function(err, result) {
     console.log(result);
     registryDox = result;
  });
}

var zipAggregate = function(db, callback){
    db.collection('registry').aggregate(
        [    
            {"$project" : { "ZIP_CODE" : "$event.location.zip", "EVENT_NAME":"$event.name"}},
            {"$group" : {"_id" : "$ZIP_CODE", "Attending" : { "$sum" : 1}}},
 		    {"$sort" : {"Attending" : -1 }}
		]
    ).toArray(function(err, result) {
     console.log(result);
     zipAggDox = result;
  });
}

app.get('/', function(req, res){
    var url = 'mongodb://localhost:27017/eventApp';
    mongodb.connect(url, function(err, db){
        var eventsCol = db.collection('events');
        var usersCol = db.collection('users');
        var usersAll = "[]";
        
        
        registryAggregate(db, function() { });
        zipAggregate(db, function() { });
        
        usersCol.find({}).toArray( function(err, results) {
            usersAll = results;
        });
        
        eventsCol.find({}).toArray( function (err, results) {
            if(results.length === 0) {
                eventsCol.insertMany(eventsJson, function(err, results){
                    console.log(results);
                    db.close;
                });
            }
            
            res.render('index', {
                // list: ['services','portfolio','events','team','contact'],
                list: ['services','portfolio','events','users','team','contact'],
                events: results,
                users: usersAll,
                registry: registryDox,
                zipagg: zipAggDox
            });
        });
    });
});

// app.get('/events', function(req, res){
//     res.send('Aloha Events Route!');
// });

app.listen(port, function(err){
    console.log('App server running on port ' + port);
});