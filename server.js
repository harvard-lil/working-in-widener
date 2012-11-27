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

var wid_b = ["DP612", "DP614", "DP615", "DP618", "DP621", "Q209", "Q223", "Q224", "Q295", "Q300", "DP622", "DP624", "DP625", "DP627", "DP628","Q305", "Q310", "Q315", "Q310", "Q320", "DP632", "DP635", "DP636", "DP638", "DP639", "Q325", "Q335", "Q336", "Q342", "Q350", "DP640", "DP641", "DP642", "DP646", "DP650", "Q360", "Q365", "Q370", "Q387", "Q390"];
var rooms = [];
var num_items_to_shelve = 2;

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
			var player_data = {b: '1', i: '0', j: '1'};
			rooms[key].player_postions.p2 = player_data;

			return key;
		}
	}
	
	// If we didn't find a pair. Create a new room and add player 1 to it.
	var room_id = Math.floor(Math.random()*89999+10000);
	rooms[room_id] = {player_postions: {p1: {b: '1', i: '0', j: '0'}, p2: {}}, to_shelve: {p1: [], p2: []}, player_info:{p1: {name: ""}, p2: {name: ""}}};

	socket.join(room_id);
    socket.emit('player_assignment', 'p1');
	socket.emit('room_assignment', room_id);
			
	return false;
};

var build_LibraryCloud_requests = function(room_id) {
	// Select a call number from our list of call numbers and fetch one
	// result from LibraryCloud based on that call number
    
    for (var i = 0; i < num_items_to_shelve; i ++) {
        
        var rand_index = Math.floor(Math.random() * (39 - 0 + 1)) + 0;

        var call_num = wid_b[rand_index];
        
        var options = {
          //host: 'librarycloud.harvard.edu',
          host: 'hlsl8.law.harvard.edu',
          port: 80,
          path: '/v1/api/item/?filter=holding_libs:WID&filter=090a:' + call_num + '*&limit=1',
          method: 'GET'
        };
    
        console.log('Getting: ' + '/v1/api/item/?filter=holding_libs:WID&filter=090a:' + call_num + '*&limit=1');
    
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

		      rooms[room_id].to_shelve.p1.push({title: to_shelve_formatted.docs[0].title, call_num: to_shelve_formatted.docs[0].source_record['090a']});
		      rooms[room_id].to_shelve.p2.push({title: to_shelve_formatted.docs[0].title, call_num: to_shelve_formatted.docs[0].source_record['090a']});

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
		rooms[data.r].player_postions[data.p] = {b: data.b, i: data.i, j: data.j};
		
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
 		  console.log(data);

 		  //console.log('kicking everyone out of the room: ' + data.r);
 		  
 		  // We have a winner. Kick everyone out of the room
          //io.sockets.in(data.r).leave(data.r);
    });
})