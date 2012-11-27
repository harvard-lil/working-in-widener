$(function() {
    // Load our config
    var config;

    $.getJSON("/config.json", function(json) {
        config = json;

        // TODO: clean up this list. We'll use the first 15 for our first test
        var wid = {'b' : ["DP612", "DP614", "DP615", "DP618", "DP621", "Q209", "Q223", "Q224", "Q295", "Q300", "DP622", "DP624", "DP625", "DP627", "DP628","Q305", "Q310", "Q315", "Q310", "Q320", "DP632", "DP635", "DP636", "DP638", "DP639", "Q325", "Q335", "Q336", "Q342", "Q350", "DP640", "DP641", "DP642", "DP646", "DP650", "Q360", "Q365", "Q370", "Q387", "Q390", "PG13", "PG135", "PG510", "M2", "M32", "M1503", "PG14", "PG303", "PG3223", "M21", "M1490", "M1507", "PG127", "PG305", "PG3225", "M24", "M1495", "M1509", "PG129", "PG406", "PG3235", "M25", "M1497", "M1513", "PG133", "PG507", "PG3435", "M30", "M1500", "M1518"], 'a' : ["PH101", "PH107", "PH123", "PH124", "PH125", "BR450", "BR470", "BR479", "BR481", "BR500", "PH131", "PH135", "PH139", "PH159", "PH161","BR510", "BR515", "BR516", "BR516.5", "BR517", "PH225", "PH235", "PH241", "PH275", "PH279", "BR520", "BR525", "BR526", "BR530", "BR535", "PH285", "PH300", "PH301", "PH302", "PH303", "BR555", "BR560", "BR563", "BR570", "BR620", "DK403", "DK430", "DK439", "PB2369", "PB2813", "PB2856", "DK404", "DK432", "DK440", "PB2591", "PB2815", "PB2887", "DK411", "DK434", "DK441", "PB2808", "PB2831", "PB2891", "DK418", "DK435.5", "DK443", "PB2809", "PB2837", "PB2905", "DK420", "DK436", "DK448", "PB2811", "PB2839", "PB2931"]};
        var wid_endcaps = {"b" : ["DP612 - DP621", "Q209 - Q300", "DP622 - DP628", "Q305 - Q320", "DP632 - DP639", "Q325 - Q350", "DP640 - DP650", "Q360 - Q390", "PG13 - PG133", "PG135 - PG507", "PG6700 - PG6722", "M2 - M30", "M32 - M1500", "M1503 - M1518"], "a" : ["PH101 - PH125", "BR450 - BR500", "PH131 - PH161", "BR510 - BR517", "PH225 - PH279", "BR520 - BR535", "PH285 - PH303", "BR555 - BR620", "DK403 - DK420", "DK430 - DK436", "DK439 - DK448", "PB2369 - PB2811", "PB2813 - PB2839", "PB2856 - PB2931"]};
        $.each(wid.a, function(index, item) {
            $(".aisle:eq(" + index + ")").data("callno", item);
        });
        $.each(wid_endcaps.a, function(index, item) {
            $(".endcap:eq(" + index + ")").data("sign", item);
        });

        var player_id, current_callno, cart_contents, room_id;
        var ready = false;
        var current_book = 0;

        // Socket.io stuff
        var iosocket = io.connect(config.node_host + ':' + config.node_port);
        iosocket.on('connect', function () {

            iosocket.on('player_assignment', function(data) {
                player_id = data;
            });

            iosocket.on('shelve_list', function(data) {
                cart_contents = data[player_id];
                $('.title').html(cart_contents[current_book].title);
                $('.current-target-callno').html(cart_contents[current_book].call_num);
                current_callno = cart_contents[current_book].call_num;
            });

            iosocket.on('room_assignment', function(data) {
                room_id = data;
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
                                current_book = current_book + 1;
                                iosocket.emit('shelved', {p: player_id, c: current_book});
                                if(current_book == cart_contents.length) {
                                    iosocket.emit('completed', {p: player_id, r: room_id});
                                }
                                else {
                                    $('.title').fadeOut().delay(500).html(cart_contents[current_book].title).fadeIn();
                                    $('.current-target-callno').fadeOut().delay(500).html(cart_contents[current_book].call_num).fadeIn();
                                    current_callno = cart_contents[current_book].call_num;
                                }
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
            iosocket.on('ready', function(data) {
                console.log('received ready emit');
                console.log(data);
                var opponent_id = 'p1';
                if (player_id === 'p1') {
                    opponent_id = 'p2';
                } 

                $('#your_name').text(data[player_id].name +  ' ( ' + player_id + ' )').addClass(player_id + '-text');
                $('#opponent_name').text(data[opponent_id].name +  ' ( ' + opponent_id + ' )').addClass(opponent_id + '-text');

                $('#progress').addClass(player_id + 'progress');
                $('#opponent-progress').addClass(opponent_id + 'progress');

                ready = true;
                $('#hover').hide();
            });

            iosocket.on('progress_update', function(data) { console.log('updating ' + data.c);
            var position = 100 * data.c;
            $('.' + data.p + 'progress').css('background-position', '0px -' + position + 'px');
        });

        iosocket.on('winner', function(data) {
            ready = false;
            iosocket.disconnect()
            $('#start-status').html(data + ' WINS!' + '<br /><a href=".">Start a new game?</a>');
            $('#hover').show();
            //$('#dashboard').text(data + ' WINS!').css('font-size', '108px');
        });


        iosocket.on('disconnect', function() {

            console.log('disconnected');
        });
    });

    // Board setup/game control stuff
    $(document).keydown(function(e) {

        /** Get the current position */
        if (ready && e.which === 37 || e.which === 38 || e.which === 39 || e.which === 40)     {
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

    // On load, we display a hover panel. Get user's name and ask them to hit play.
    $('#name-form').submit(function() {
        var message = {p: player_id, r: room_id, name: $('#player-handle').val()};
        iosocket.emit('name-update', message);
        $('#start-status').text('Waiting for your challenger.');
        $('#name-form').hide();
        return false;
    });
});
});