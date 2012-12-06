$(function() {
    // Load our config
    var config;

    $.getJSON("config.json", function(json) {
        config = json;

        // All of our call numbers and endcaps
        var wid = {0 : ["DP612", "DP614", "DP615", "DP618", "DP621", "Q209", "Q223", "Q224", "Q295", "Q300", "DP622", "DP624", "DP625", "DP627", "DP628","Q305", "Q310", "Q315", "Q310", "Q320", "DP632", "DP635", "DP636", "DP638", "DP639", "Q325", "Q335", "Q336", "Q342", "Q350", "DP640", "DP641", "DP642", "DP646", "DP650", "Q360", "Q365", "Q370", "Q387", "Q390", "PG13", "PG135", "PG510", "M1", "M32", "M1503", "PG14", "PG303", "PG3223", "M21", "M1490", "M1507", "PG127", "PG305", "PG3225", "M24", "M1495", "M1509", "PG129", "PG406", "PG3235", "M25", "M1497", "M1513", "PG133", "PG507", "PG3435", "M30", "M1500", "M1518"], 1 : ["PH101", "PH107", "PH123", "PH124", "PH125", "BR450", "BR470", "BR479", "BR481", "BR500", "PH131", "PH135", "PH139", "PH159", "PH161","BR510", "BR515", "BR516", "BR516.5", "BR517", "PH225", "PH235", "PH241", "PH275", "PH279", "BR520", "BR525", "BR526", "BR530", "BR535", "PH285", "PH300", "PH301", "PH302", "PH303", "BR555", "BR560", "BR563", "BR570", "BR620", "DK403", "DK430", "DK439", "PB2369", "PB2813", "PB2856", "DK404", "DK432", "DK440", "PB2591", "PB2815", "PB2887", "DK411", "DK434", "DK441", "PB2808", "PB2831", "PB2891", "DK418", "DK435.5", "DK443", "PB2809", "PB2837", "PB2905", "DK420", "DK436", "DK448", "PB2811", "PB2839", "PB2931"], 2 : ["PN441", "PN451", "PN452", "PN453", "PN457", "DA3", "DA10", "DA11", "DA13", "DA16", "PN462", "PN466", "PN471", "PN472", "PN479","DA17", "DA18", "DA25", "DA26", "DA27", "PN481", "PN495", "PN500", "PN501", "PN503", "DA27.5", "DA28", "DA28.1", "DA28.2", "DA28.3", "PN504", "PN505", "PN507", "PN508", "PN509", "DA28.4", "DA28.7", "DA30", "DA32", "DA34", "F200", "F273", "F311", "E621", "E647", "E661", "F225", "F285", "F314", "E628", "E649", "E664", "F226", "F286", "F345", "E631", "E655", "E667", "F227", "F289", "F351", "E635", "E656", "E668", "F272", "F310", "F370", "E641", "E660", "E672"], 3 : ["PM731", "PM782", "PM921", "PM987", "PM988", "PS146", "PS147", "PS151", "PS152", "PS157", "PM989", "PM1021", "PM1022", "PM1023", "PM1024","PS163", "PS185", "PS201", "PS208", "PS211", "PM1272", "PM1855", "PM1883", "PM2073", "PM2076", "PS214", "PS221", "PS223", "PS225", "PS229", "PM2135", "PM2342", "PM2501", "PM2591", "PM3007", "PS243", "PS261", "PS271", "PS273", "PS277", "P361", "P375", "P501", "PS301", "PS323.5", "PS350", "P365", "P380", "P505", "PS303", "PS324", "PS351", "P367", "P381", "P511", "PS305", "PS325", "PS352", "P368", "P408", "P512", "PS316", "PS326", "PS369", "P371", "P409", "P525", "PS319", "PS332", "PS371"]};
        var wid_endcaps = {0 : ["DP612 - DP621", "Q209 - Q300", "DP622 - DP628", "Q305 - Q320", "DP632 - DP639", "Q325 - Q350", "DP640 - DP650", "Q360 - Q390", "PG13 - PG133", "PG135 - PG507", "PG510 - PG3434", "M2 - M30", "M32 - M1500", "M1503 - M1518"], 1 : ["PH101 - PH125", "BR450 - BR500", "PH131 - PH161", "BR510 - BR517", "PH225 - PH279", "BR520 - BR535", "PH285 - PH303", "BR555 - BR620", "DK403 - DK420", "DK430 - DK436", "DK439 - DK448", "PB2369 - PB2811", "PB2813 - PB2839", "PB2856 - PB2931"], 2 : ["PN441 - PN457", "DA3 - DA16", "PN462 - PN479", "DA17 - DA27", "PN481 - PN503", "DA27.5 - DA28.3", "PN504 - PN509", "DA28.4 - DA34", "F200 - F272", "F273 - F370", "F311 - F370", "E621 - E641", "E647 - E660", "E661 - E672"], 3 : ["PM731 - PM988", "PS146 - PS157", "PM989 - PM1024", "PS163 - PS211", "PM1272 - PM2076", "PS214 - PS229", "PM2135 - PM3007", "PS243 - PS277", "P361 - P371", "P375 - P409", "P501 - P525", "PS301 - PS319", "PS323.5 - PS332", "PS350 - PS371"]};

        var player_id, current_callno, cart_contents, room_id, start_time;
        var current_board = 0;
        var ready = false;
        var current_book = 0;
        var solo = true;
        $('#progress').data('current-book', current_book);

        // Socket.io stuff
        // Comment this out if you're serving the socket.io client from node.js
        var WEB_SOCKET_SWF_LOCATION = 'scripts/WebSocketMain.swf';
        var iosocket = io.connect(config.node_host + ':' + config.node_port);
        iosocket.on('connect', function () {
            //iosocket.on('player_assignment', function(data) {
            //    player_id = data;
            //});

            iosocket.on('shelve_list', function(data) {
                cart_contents = data[player_id];
                $('.title').html(cart_contents[current_book].title);
                $('.current-target-callno').html(cart_contents[current_book].call_num);
                $('.creator').html(cart_contents[current_book].creator);
                current_callno = cart_contents[current_book].call_num;
            });

            iosocket.on('assignments', function(data) {
                player_id = data.player_id
                room_id = data.room_id;
            });

            iosocket.on('board_update', function(data) {
                
                // If we changed boards, redraw all the data elements
                if (data[player_id].b !== current_board) {
                    current_board = data[player_id].b;
                
                    var legend = $('.legend')[3 - current_board];
                    $('.current-legend').removeClass('current-legend');
                    $(legend).addClass('current-legend');

                    $.each(wid[current_board], function(index, item) {
                        $(".aisle:eq(" + index + ")").data("callno", item);
                    });
                    $.each(wid_endcaps[current_board], function(index, item) {
                        $(".endcap:eq(" + index + ")").data("sign", item);
                        $(".endcap-far:eq(" + index + ")").data("sign", item);
                    });
                    
                    if (current_board === 0) {
                        $('.stairs-down').addClass('stairs-down-disabled').removeClass('stairs-down');
                        $('.stairs-down-disabled.stairs-outside').addClass('stairs-outside-disabled');
                    } else {
                        $('.stairs-down-disabled').addClass('stairs-down').removeClass('stairs-down-disabled');
                        $('.stairs-down').removeClass('stairs-outside-disabled');
                    }
                    
                    if (current_board === 1) {
                        $('.bridge').addClass('blocked');
                        
                        $('#no-entry').show();
                        $('.north-bridge-wall').addClass('north-bridge-wall-disabled').removeClass('north-bridge-wall');
                        $('.west-bridge-wall-disabled').addClass('west-bridge-wall').removeClass('west-bridge-wall-disabled');
                        $('.south-bridge-wall').addClass('south-bridge-wall-disabled').removeClass('south-bridge-wall');
                        $('.east-bridge-wall-disabled').addClass('east-bridge-wall').removeClass('east-bridge-wall-disabled');
                        
                        $('.tunnel').addClass('tunnel-disabled').removeClass('tunnel');
                        
                    } else {
                        $('.bridge').removeClass('blocked');
                        
                        $('#no-entry').hide();
                        $('.north-bridge-wall-disabled').addClass('north-bridge-wall').removeClass('north-bridge-wall-disabled');
                        $('.west-bridge-wall').addClass('west-bridge-wall-disabled').removeClass('west-bridge-wall');
                        $('.south-bridge-wall-disabled').addClass('south-bridge-wall').removeClass('south-bridge-wall-disabled');
                        $('.east-bridge-wall').addClass('east-bridge-wall-disabled').removeClass('east-bridge-wall');
                        
                        $('.tunnel-disabled').addClass('tunnel').removeClass('tunnel-disabled');
                    }
                    
                    if (current_board === 3) {
                        $('.stairs-up').addClass('stairs-up-disabled').removeClass('stairs-up');
                        $('.stairs-up-disabled.stairs-outside').addClass('stairs-outside-disabled');
                    } else {
                        $('.stairs-up-disabled').addClass('stairs-up').removeClass('stairs-up-disabled');
                        $('.stairs-up').removeClass('stairs-outside-disabled');
                    }
                }

                // now redraw the player positions
                $.each(data, function(index, value) { 

                    var target_i = $('.tile-row')[value.i];
                    var target_tile = $(target_i).children()[value.j];

                    // If our opponent is not on our board, don't draw them
                    if (value.b === current_board ) {
                        var n = $('.' + index);
                        $(n).removeClass(index);
                        $('.stairs').css('background-position', '0px 0px');
                    
                        $(target_tile).addClass(index);
                        $(target_tile).css('background-position', '0px -' + 30 * value.c + 'px');

                    } else {
                        $('.' + index).removeClass(index);
                        //$(target_tile).css('background-position', '0px -' + 35 * value.c + 'px');
                    }
                    
                    if(index == player_id) {
                        var tile_position = $(target_tile).position();
                        var callno = $(target_tile).data("callno");
                        $('#callno_sign, #endcap_sign').hide();
                        if(callno) {
                            $('#callno_sign').show().text(callno);
                            $('#callno_sign').css("top", tile_position.top + 30).css("left", tile_position.left - 7);
                        }
                        var sign = $(target_tile).data("sign");
                        if(sign) { 
                            $('#endcap_sign').show().text(sign);
                            $('#endcap_sign').css("top", tile_position.top + 30).css("left", tile_position.left - 7);
                        }
                    }
                });
            });
            iosocket.on('ready', function(data) {
                // The ready signal is when we have two players and all data loaded
                // This is the equivalent of the waving of the checkered flag
                if (!solo) {
                    var opponent_id = 'p1';
                    if (player_id === 'p1') {
                        opponent_id = 'p2';
                    } 
                    
                    $('#opponent_name').text(data[opponent_id].name).addClass(opponent_id + '-text');                    
                    $('#opponent-progress').addClass(opponent_id + 'progress');                    
                    
                }

                $('#your_name').text(data[player_id].name).addClass(player_id + '-text');
                $('#progress').addClass(player_id + 'progress');

                // Start our timer
                start_time = new Date().getTime();

                ready = true;
                $('#main').removeClass('light');
                $('#hover').hide();

            });

            iosocket.on('progress_update', function(data) {

            if(data.p != player_id) {
              $('.' + data.p + 'progress').fadeOut('fast').delay(500).fadeIn('fast', function() { $(this).css('background-position', '0px -' + 100 * data.c + 'px');});
            }
            else {
              $('.' + data.p + 'progress').css('background-position', '0px -' + 100 * data.c + 'px');
            }
        });

        iosocket.on('winner', function(data) {
            ready = false;
            //iosocket.disconnect()
            $('#hover').html('<h1>' + data.name + ' WINS!</h1>').addClass('winner');
            $('#hover').append('<p> in ' + data.elapsed_time + '</p>');
            $('#hover').append('<div id="#start-status" class="status-update"><a href="." class="button">Start a new game?</a></div>');
            $('#hover').append('<div class="footer"><a href="leader-board.html" class="left top-scores">Top Scores</a><img class="logo" src="images/liblabstamp.png"> <a href="http://librarylab.law.harvard.edu" class="right">A Harvard Library Innovation Lab Project</a></div>');
            $('#main').addClass('light');
            $('#hover').show();
            //$('#dashboard').text(data + ' WINS!').css('font-size', '108px');
        });


        iosocket.on('disconnect', function() {
            //console.log('disconnect')
        });
        

        iosocket.on('booted', function(data) {
            $('#hover').html('<p>You have been the disconnected from the Working in Widener server. This means that you\'ve been idle for too long or that something went wrong. Sorry. Refresh to try again.</p>');
            $('#main').addClass('light');
            $('#hover').show();

        });

        
    });

    // Board setup/game control stuff
    $(document).keydown(function(e) {

        /** Get the current position */
        if (ready === true) {
            if (e.which === 32 || e.which === 37 || e.which === 38 || e.which === 39 || e.which === 40) {
                var currently_selected = $('.' + player_id);
                var next_tile = currently_selected;
                var next_board = current_board;

                switch(e.keyCode) {
                    case 32: // space
                
                        var callno = $(currently_selected).data("callno");
                        if (callno) {
                            if(callno === current_callno) {
                                current_book = current_book + 1;
                                $('#progress').data('current-book', current_book);
                                iosocket.emit('shelved', {p: player_id, c: current_book});
                                if(current_book == cart_contents.length) {
                                    // Send elapsed time for leader board
                                    var now = new Date().getTime();
                                    var elapsed_time = now - start_time;
                                    iosocket.emit('completed', {p: player_id, r: room_id, elapsed_time: elapsed_time});
                                }
                                else {
                            
                                    $('.current-target').fadeOut(500, function() {
                                      $('.title').html(cart_contents[current_book].title);
                                      $('.current-target-callno').html(cart_contents[current_book].call_num);
                                      $('.creator').html('by ' + cart_contents[current_book].creator);
                                    }).fadeIn(500);
                            
                                    current_callno = cart_contents[current_book].call_num;

                                }
        //                        $('#callno_sign').show().text(callno);
        //                        $('#callno_sign').css("top", tile_position.top + 35).css("left", tile_position.left - 7);
                            }
                        }
                
                        if ($(currently_selected).hasClass('stairs-up') && current_board !== 3) {
                            next_board = current_board + 1;
                        }

                        if ($(currently_selected).hasClass('stairs-down') && current_board !== 0) {
                            next_board = current_board - 1;
                        }

                        break;
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
                var c_book = $('#progress').data('current-book');

                // Our final, packaged message.
                var message = {p: player_id, r: room_id, b: next_board, i: i_pl, j: j_pl, c: c_book};

                // Sometimes we don't actually move (when a user tries to walk into a wall)
                if(!$(next_tile).hasClass('blocked') && !$(next_tile).hasClass('stairs-outside-disabled')){
                    iosocket.emit('move', message);
                }
            }
        }
    });

    // On load, we display a hover panel. Get user's name and ask them to hit play.
    $('#name-form').submit(function() {
        if ($('#player-handle').val() !== "Waiting for your challenger.") {

            var waiting_message = "Loading books on your cart now";
            
            if ($('#num-players').val() === 'two_player') {
                solo = false;
                waiting_message = ""
            }
            //var message = {p: player_id, r: room_id, name: $('#player-handle').val(), solo: solo};
            var message = {name: $('#player-handle').val(), solo: solo};

            iosocket.emit('start-game-request', message);
            
            $('#start-status').text(waiting_message).addClass('status-update');
            $('#name-form').hide();
        } else{
            // The box loses focus. refocus.
             $("#player-handle").focus();
        }
        return false;
    });
    
     $("#player-handle").focus();
});
});
