var app = require('express')()
, http = require('http')
, server = http.createServer(app)
, io = require('socket.io').listen(server)
, fs = require('fs');

// Load our config
var data = fs.readFileSync(__dirname + '/static/config.json'),
    config;

try {
  config = JSON.parse(data);
}
catch (err) {
  console.log('There has been an error parsing the JSON config.')
  console.log(err);
}

// Start node
server.listen(config.node_port);

// Routing handled by express
app.get('/', function (req, res) {
    res.sendfile(__dirname + '/static/index.html');
});
app.get('/style.css', function (req, res) {
    res.sendfile(__dirname + '/static/style.css');
});
app.get('/shelve-game.js', function (req, res) {
    res.sendfile(__dirname + '/static/shelve-game.js');
});
app.get('/config.json', function (req, res) {
    res.sendfile(__dirname + '/static/config.json');
});

app.get('/widener-8-bit.png', function (req, res) {
    res.sendfile(__dirname + '/static/images/widener-8-bit.png');
});

var wid = ["DP612", "DP614", "DP615", "DP618", "DP621", "Q209", "Q223", "Q224", "Q295", "Q300", "DP622", "DP624", "DP625", "DP627", "DP628","Q305", "Q310", "Q315", "Q310", "Q320", "DP632", "DP635", "DP636", "DP638", "DP639", "Q325", "Q335", "Q336", "Q342", "Q350", "DP640", "DP641", "DP642", "DP646", "DP650", "Q360", "Q365", "Q370", "Q387", "Q390", "PG13", "PG135", "PG510", "M2", "M32", "M1503", "PG14", "PG303", "PG3223", "M21", "M1490", "M1507", "PG127", "PG305", "PG3225", "M24", "M1495", "M1509", "PG129", "PG406", "PG3235", "M25", "M1497", "M1513", "PG133", "PG507", "PG3435", "M30", "M1500", "M1518", "PH101", "PH107", "PH123", "PH124", "PH125", "BR450", "BR470", "BR479", "BR481", "BR500", "PH131", "PH135", "PH139", "PH159", "PH161","BR510", "BR515", "BR516", "BR516.5", "BR517", "PH225", "PH235", "PH241", "PH275", "PH279", "BR520", "BR525", "BR526", "BR530", "BR535", "PH285", "PH300", "PH301", "PH302", "PH303", "BR555", "BR560", "BR563", "BR570", "BR620", "DK403", "DK430", "DK439", "PB2369", "PB2813", "PB2856", "DK404", "DK432", "DK440", "PB2591", "PB2815", "PB2887", "DK411", "DK434", "DK441", "PB2808", "PB2831", "PB2891", "DK418", "DK435.5", "DK443", "PB2809", "PB2837", "PB2905", "DK420", "DK436", "DK448", "PB2811", "PB2839", "PB2931", "PN441", "PN451", "PN452", "PN453", "PN457", "DA3", "DA10", "DA11", "DA13", "DA16", "PN462", "PN466", "PN471", "PN472", "PN479","DA17", "DA18", "DA25", "DA26", "DA27", "PN481", "PN495", "PN500", "PN501", "PN503", "DA27.5", "DA28", "DA28.1", "DA28.2", "DA28.3", "PN504", "PN505", "PN507", "PN508", "PN509", "DA28.4", "DA28.7", "DA30", "DA32", "DA34", "F200", "F273", "F311", "E621", "E647", "E661", "F225", "F285", "F314", "E628", "E649", "E664", "F226", "F286", "F345", "E631", "E655", "E667", "F227", "F289", "F351", "E635", "E656", "E668", "F272", "F310", "F370", "E641", "E660", "E672", "PM731", "PM782", "PM921", "PM987", "PM988", "PS146", "PS147", "PS151", "PS152", "PS157", "PM989", "PM1021", "PM1022", "PM1023", "PM1024","PS163", "PS185", "PS201", "PS208", "PS211", "PM1272", "PM1855", "PM1883", "PM2073", "PM2076", "PS214", "PS221", "PS223", "PS225", "PS229", "PM2135", "PM2342", "PM2501", "PM2591", "PM3007", "PS243", "PS261", "PS271", "PS273", "PS277", "P361", "P375", "P501", "PS301", "PS323.5", "PS350", "P365", "P380", "P505", "PS303", "PS324", "PS351", "P367", "P381", "P511", "PS305", "PS325", "PS352", "P368", "P408", "P512", "PS316", "PS326", "PS369", "P371", "P409", "P525", "PS319", "PS332", "PS371"];

var rooms = [];
var num_items_to_shelve = 5;

// Socket.io business
//io.set('loglevel',10) // set log level to get all debug messages

/////////// A helper. Shuffle our lists./////////// 
//+ Jonas Raoni Soares Silva
//@ http://jsfromhell.com/array/shuffle [v1.0]

shuffle = function(o){ //v1.0
    for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};

var add_user = function(socket) {
	// A new user wants to play. If we have an unpaired user waiting, add the
	// new user to the room. If we don't have an unpaired user, create a new room
	//
	// return false if our player is waiting for a pair
	// return the room id if we paired a player
	
	// Loop through our rooms and find an unpaired player.
	// Return the room id
	for (var key in rooms) {
		if (Object.keys(rooms[key].player_postions.p2).length === 0) {
			socket.emit('player_assignment', 'p2');
			socket.emit('room_assignment', key);
			socket.join(key);
			var player_data = {b: 2, i: 0, j: 1};
			rooms[key].player_postions.p2 = player_data;

			return key;
		}
	}
	
	// If we didn't find a pair. Create a new room and add player 1 to it.
	var room_id = Math.floor(Math.random()*89999+10000);
	rooms[room_id] = {player_postions: {p1: {b: 2, i: 0, j: 0}, p2: {}}, to_shelve: {p1: [], p2: []}, player_info:{p1: {name: ""}, p2: {name: ""}}};

	socket.join(room_id);
    socket.emit('player_assignment', 'p1');
	socket.emit('room_assignment', room_id);
			
	return false;
};

var build_LibraryCloud_requests = function(room_id) {
	// Select a call number from our list of call numbers and fetch one
	// result from LibraryCloud based on that call number
    
    for (var i = 0; i < num_items_to_shelve; i ++) {
        
        var rand_index = Math.floor(Math.random() * (279 - 0 + 1)) + 0;

        var call_num = wid[rand_index];
        
        var options = {
          //host: 'librarycloud.harvard.edu',
          host: 'hlsl8.law.harvard.edu',
          port: 80,
          path: '/v1/api/item/?filter=holding_libs:WID&filter=090a:' + call_num + '&limit=1',
          method: 'GET'
        };
    
        //console.log('Getting: ' + '/v1/api/item/?filter=holding_libs:WID&filter=090a:' + call_num + '&limit=1');
    
        // make the request, and then end it, to close the connection
		// once we have the request pass it off to our packaging function
		var req = http.request(options, function(res) {
			var call_num_searched = call_num;
			// Receive a response from LibraryCloud, pull out the title and call number
			// and add it to our list. Do this num_items_to_shelve times.

		    var to_shelve_raw = "";

		  // Keep tacking chunks on as we receive them.
		  res.on('data', function(chunk) {
		    to_shelve_raw += chunk;
		  });

		  // Finished receiving chunks? If so, package.
		  res.on('end', function() {
		      var to_shelve_formatted = JSON.parse(to_shelve_raw);

              var creator = '(No Creator)';
              
              if (to_shelve_formatted.docs[0].creator[0]) {
                  creator = to_shelve_formatted.docs[0].creator[0];
              }

		      rooms[room_id].to_shelve.p1.push({title: to_shelve_formatted.docs[0].title, creator: creator, call_num: to_shelve_formatted.docs[0].source_record['090a']});
		      rooms[room_id].to_shelve.p2.push({title: to_shelve_formatted.docs[0].title, creator: creator, call_num: to_shelve_formatted.docs[0].source_record['090a']});

			  // We want num_items_to_shelve items. This is the number of things we're going
			  // to ask our players to shelve. Once we have all the requests from LibraryCloud,
			  // send to our clients. This is the "everything's ready, play" signal
		      if (num_items_to_shelve === rooms[room_id].to_shelve.p1.length) {
		          //var packaged_to_shelve_list = {p1: shelve_list, p2: shelve_list};

                  var p1_shuffled_list = shuffle(rooms[room_id].to_shelve.p1);
                  rooms[room_id].to_shelve.p1 = p1_shuffled_list;
                  var p2_shuffled_list = shuffle(rooms[room_id].to_shelve.p2);
                  rooms[room_id].to_shelve.p2 = p2_shuffled_list;

		          io.sockets.in(room_id).emit('shelve_list', rooms[room_id].to_shelve);
		      }
		  });
			
			
			});
		
		req.end();
    }
};


io.on('connection', function(socket){
    
	// Add a user to a room
	var room_id = add_user(socket);
	
	// If we added a user we should get a room number. Now get the to shelve data.
    if (room_id !== false) {
		build_LibraryCloud_requests(room_id);
    }
    
    socket.on('move', function (data) {
		rooms[data.r].player_postions[data.p] = {b: data.b, i: data.i, j: data.j, c: data.c};
		
        // Send to the sender and then to everyone else in the room.
		// You've got to serve the servants.
        io.sockets.in(data.r).emit('board_update', rooms[data.r].player_postions);
    });

    socket.on('name-update', function (data) {
 		rooms[data.r].player_info[data.p].name = data.name;
 		
 		if(rooms[data.r].player_info.p1.name !== "" && rooms[data.r].player_info.p2.name !== "") {
 		    io.sockets.in(room_id).emit('board_update', rooms[data.r].player_postions);
 		    io.sockets.in(room_id).emit('ready', rooms[data.r].player_info);
	    }
    });
    
    socket.on('shelved', function (data) {
 		  io.sockets.in(data.r).emit('progress_update', data);
    });
    
    socket.on('completed', function (data) {
 		  io.sockets.in(data.r).emit('winner', rooms[data.r].player_info[data.p].name);
    });
})