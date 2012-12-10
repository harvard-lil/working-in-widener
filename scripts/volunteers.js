$(document).ready(function() {
    $('#signup').submit(function() {
        params = $('#signup').serialize();
        $.getJSON("signup.php?" + params, function(data) {
            $(".response").html('<p>' + data.thanks + '</p>').fadeIn("slow");
            loadBracket();
        });
        return false;
    });

    loadBracket();

    function loadBracket() {
        $('#bracket').html('');
        $.getJSON("bracket.php", function(data) {
            $.each(data, function(index, value) {
                $('#bracket').append('<p>' + value + '</p>');
            });
        });
    }
});