$(function() {

	// Load our config
	var config;

	$.getJSON("/config.json", function(json) {
	   config = json;	

    // TODO: clean up this list. We'll use the first 15 for our first test
    var wid_b = ["DP612", "DP614", "DP615", "DP618", "DP621", "Q22", "Q223", "Q224", "Q225", "Q226", "DP618", "DP622", "DP624", "DP625", "DP627","Q678", "Q679", "Q680", "Q681", "Q682", "DP730", "DP732", "DP746", "DP780", "DP781", "Q625", "Q725", "Q730", "Q732", "Q734", "DP782", "DP790", "DP793", "DP794", "DP795", "Q736", "Q737", "Q739", "Q750", "Q801", "PG12", "PG106", "PG6700", "M433", "M470", "M475", "PG13", "PG222", "PG6718", "M35", "M471", "M479", "PG90", "PG322", "PG6719", "M450", "M472", "M482", "PG94", "PG422", "PG6720", "M451", "M473", "M700", "PG105", "PG523", "PG6722", "M456", "M474", "M809"];
    var wid_b_endcaps = ["DP612 - DP621", "Q22 - Q226", "DP618 - DP627", "Q625 - Q682", "DP730 - DP781", "Q625 - Q734", "DP782 - DP795", "Q736 - Q801", "PG12 - PG105", "PG106 - PG523", "PG6700 - PG6722", "M433 - M456", "M470 - M474", "M475 - M809"];
    $.each(wid_b, function(index, item) {
      $(".aisle:eq(" + index + ")").data("callno", item);
    });
    $.each(wid_b_endcaps, function(index, item) {
      $(".endcap:eq(" + index + ")").data("sign", item);
    });
    
    // generate a randomish player id. we also use this for color.
    // var player_id = Math.floor(Math.random()*16777215).toString(16);
    
    var player_id, current_callno;

	  var room_id;

    // Socket.io stuff
    var iosocket = io.connect(config.node_host + ':' + config.node_port);
    iosocket.on('connect', function () {
    
      iosocket.on('player_assignment', function(data) {
          player_id = data;
          $('#player_id').append(' ( ' + player_id + ' )');
        });

        iosocket.on('room_assignment', function(data) {
          room_id = data;
        });

        iosocket.on('player_assignment', function(data) {
          player_id = data;
        });
        
        iosocket.on('shelve_list', function(data) {
            console.log(data);
            $.each(data[player_id], function(index, value) {
                $('.title').html(value.title);
                $('.current-target-callno').html(value.call_num);
                current_callno = value.call_num;
            });
        });

        iosocket.on('board_update', function(data) {

            $.each(data, function(index, value) {
                var n = $('.' + index);
                $(n).removeClass(index);
                $('#book-cart-' + index).remove();

                var target_i = $('.tile-row')[value.i];
                var target_tile = $(target_i).children()[value.j];

                $(target_tile).addClass(index);
                $(target_tile).append('<img id="book-cart-' + index + '" src="http://hlsl7.law.harvard.edu/dev/annie/game/static/images/book-cart.png">');

                if(index == player_id) {
                  var tile_position = $(target_tile).position();
                  var callno = $(target_tile).data("callno");
                  $('#callno_sign, #endcap_sign').hide();
                  if(callno) {
                    if(callno === current_callno) {
                      iosocket.emit('completed', player_id);
                    }
                    $('#callno_sign').show().text(callno);
                    $('#callno_sign').css("top", tile_position.top + 35).css("left", tile_position.left - 7);
                  }
                  var sign = $(target_tile).data("sign");
                  if(sign) { 
                    $('#endcap_sign').show().text(sign);
                    $('#endcap_sign').css("top", tile_position.top + 35).css("left", tile_position.left - 7);
                  }
                }

            });

        });
        
        iosocket.on('winner', function(data) {
          $('#dashboard').text(data + ' WINS!').css('font-size', '108px');
        });

        iosocket.on('disconnect', function() {
            console.log('disconnected');
        });
    });

    // Board setup/game control stuff

    $(document).keydown(function(e) {

        /** Get the current position */
        if (e.which === 37 || e.which === 38 || e.which === 39 || e.which === 40)     {
            var currently_selected = $('.' + player_id);
            var next_tile;

            switch(e.keyCode) {
                case 37: // left
                next_tile = $(currently_selected).prev('.tile');

                if (next_tile.length === 0) {
                    next_tile = currently_selected;
                }

                break;
                case 38: // up

                // What column are we in?
                var currently_selected_index = $(currently_selected).index();

                // What row we're in?
                var current_row = $(currently_selected).parent();

                var prev_row = $(current_row).prev('.tile-row');

                if (prev_row.length === 0) {
                    prev_row = current_row;
                }

                next_tile = $(prev_row).children()[currently_selected_index];

                break;
                case 39: // right
                var next_tile = $(currently_selected).next('.tile');
                if (next_tile.length === 0) {
                    next_tile = currently_selected;
                }

                break;
                case 40: // down
                // What column are we in?
                var currently_selected_index = $(currently_selected).index();

                // Now get the row we're in
                var current_row = $(currently_selected).parent();

                var next_row = $(current_row).next('.tile-row');

                if (next_row.length === 0) {
                    next_row = current_row;
                }

                next_tile = $(next_row).children()[currently_selected_index];
                
                break;
            }

            var i_pl = $(next_tile).parent().index();
            var j_pl = $(next_tile).index();

            // Now get the row we're in
            var message = {p: player_id, r: room_id, b: '1', i: i_pl, j: j_pl};
                
                            
            // Sometimes we don't actually move (when a user tries to walk into a wall)
            if(!$(next_tile).hasClass('blocked')){

                iosocket.emit('move', message);
            }
        }
    });
	 });
});
