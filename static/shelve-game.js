$(function() {

    // generate a randomish player id. we also use this for color.
    var player_id = Math.floor(Math.random()*16777215).toString(16);

    // Socket.io stuff
    var iosocket = io.connect('http://localhost:3000');	
    iosocket.on('connect', function () {

        iosocket.on('board_update', function(data) {

console.log(data);
            $.each(data, function(index, value) {            
                var n = $('#' + index);
                $(n).removeAttr("id");
                $(n).css("background-color","");


                var target_i = $('.tile-row')[value.i];
                var target_tile = $(target_i).children()[value.j];

                $(target_tile).attr('id', index);
                $(target_tile).css("background-color","#" + index);


            });

        });


        iosocket.on('disconnect', function() {
            console.log('disconnected');
        });
    });

    // Board setup/game control stuff
    $('.tile:first').attr('id', player_id);
    $('.tile:first').css("background-color","#" + player_id);

    $(document).keydown(function(e) {

        /** Get the current position */
        if (event.which === 37 || event.which === 38 || event.which === 39 || event.which === 40)     {
            var currently_selected = $('#' + player_id);
            var next_tile;


            switch(e.keyCode) {
                case 37: // left
                next_tile = $(currently_selected).prev('.tile');
                if (next_tile.length == 0) {
                    next_tile =	$(currently_selected).siblings(':last');
                }

                break;
                case 38: // up

                // What column are we in?
                var currently_selected_index = $(currently_selected).index();

                // Now get the row we're in
                var current_row = $(currently_selected).parent();

                var prev_row = $(current_row).prev('.tile-row');

                if (prev_row.length == 0) {
                    prev_row = $(current_row).siblings(':last');
                }

                next_tile = $(prev_row).children()[currently_selected_index];

                break;
                case 39: // right				
                var next_tile = $(currently_selected).next('.tile');
                if (next_tile.length == 0) {
                    next_tile =	$(currently_selected).siblings(':first');
                }

                break;
                case 40: // down
                // What column are we in?
                var currently_selected_index = $(currently_selected).index();

                // Now get the row we're in
                var current_row = $(currently_selected).parent();

                var next_row = $(current_row).next('.tile-row');

                if (next_row.length == 0) {
                    next_row = $(current_row).siblings(':first');
                }

                next_tile = $(next_row).children()[currently_selected_index];
                break;
            }

            var i_pl = $(next_tile).parent().index();
            var j_pl = $(next_tile).index();

            // Now get the row we're in
            var message = {p: player_id, b: '1', i: i_pl, j: j_pl};
            iosocket.emit('move', message);
        }
    });
});
