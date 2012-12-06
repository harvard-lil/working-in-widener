$(function() {
    // Load our config
    var config;

    $.getJSON("config.json", function(json) {
        config = json;
   
   
        $.ajax({
            type : "GET",
            dataType : "jsonp",
            url : config.node_host + ':' + config.node_port +"/leader-board.json",
            data : {},
            success: function(leader_board_data){
                
                var table_markup = "";
                $.each(leader_board_data, function(key, val) {
                    table_markup = table_markup + "<tr><td>" + (key + 1) + "</td><td>" + val.winner + "</td><td>";
                    
                    if (val.play_type === "solo") {
                        table_markup = table_markup + "solo game</td><td>";
                    } else {
                        table_markup = table_markup + "against " + val.loser + "</td><td>";
                    }
                    
                      table_markup = table_markup + dateFormat(val.date_played, "mmm dS, yyyy, h:MM TT") + "</td><td>" + get_pretty_time(val.num_ms) + "</td></tr>";
                   });
                   
                   $('tbody').html(table_markup);                
            },
            error: function (xhr, ajaxOptions, thrownError) {
                    console.log("problem getting leader-board.json" + xhr.status);
                    console.log(thrownError);
                  }
        });        
});        
   // Get a pretty time
   // Thanks to http://stackoverflow.com/a/8212878
   function get_pretty_time(milliseconds){
       // TIP: to find current time in milliseconds, use:
       // var milliseconds_now = new Date().getTime();

       var seconds = milliseconds / 1000;
       var numyears = Math.floor(seconds / 31536000);
       if(numyears){
           return numyears + ' year' + ((numyears > 1) ? 's' : '');
       }
       var numdays = Math.floor((seconds % 31536000) / 86400);
       if(numdays){
           return numdays + ' day' + ((numdays > 1) ? 's' : '');
       }
       var numhours = Math.floor(((seconds % 31536000) % 86400) / 3600);
       if(numhours){
           return numhours + ' hour' + ((numhours > 1) ? 's' : '');
       }
       var numminutes = Math.floor((((seconds % 31536000) % 86400) % 3600) / 60);
       if(numminutes){
           return numminutes + ' minute' + ((numminutes > 1) ? 's' : '');
       }
       var numseconds = (((seconds % 31536000) % 86400) % 3600) % 60;
       if(numseconds){
           return numseconds + ' second' + ((numseconds > 1) ? 's' : '');
       }
       return 'less then a second'; //'just now' //or other string you like;
   } 
   
   /*
    * Date Format 1.2.3
    * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
    * MIT license
    *
    * Includes enhancements by Scott Trenda <scott.trenda.net>
    * and Kris Kowal <cixar.com/~kris.kowal/>
    *
    * Accepts a date, a mask, or a date and a mask.
    * Returns a formatted version of the given date.
    * The date defaults to the current date/time.
    * The mask defaults to dateFormat.masks.default.
    */

   var dateFormat = function () {
   	var	token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
   		timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
   		timezoneClip = /[^-+\dA-Z]/g,
   		pad = function (val, len) {
   			val = String(val);
   			len = len || 2;
   			while (val.length < len) val = "0" + val;
   			return val;
   		};

   	// Regexes and supporting functions are cached through closure
   	return function (date, mask, utc) {
   		var dF = dateFormat;

   		// You can't provide utc if you skip other args (use the "UTC:" mask prefix)
   		if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
   			mask = date;
   			date = undefined;
   		}

   		// Passing date through Date applies Date.parse, if necessary
   		date = date ? new Date(date) : new Date;
   		if (isNaN(date)) throw SyntaxError("invalid date");

   		mask = String(dF.masks[mask] || mask || dF.masks["default"]);

   		// Allow setting the utc argument via the mask
   		if (mask.slice(0, 4) == "UTC:") {
   			mask = mask.slice(4);
   			utc = true;
   		}

   		var	_ = utc ? "getUTC" : "get",
   			d = date[_ + "Date"](),
   			D = date[_ + "Day"](),
   			m = date[_ + "Month"](),
   			y = date[_ + "FullYear"](),
   			H = date[_ + "Hours"](),
   			M = date[_ + "Minutes"](),
   			s = date[_ + "Seconds"](),
   			L = date[_ + "Milliseconds"](),
   			o = utc ? 0 : date.getTimezoneOffset(),
   			flags = {
   				d:    d,
   				dd:   pad(d),
   				ddd:  dF.i18n.dayNames[D],
   				dddd: dF.i18n.dayNames[D + 7],
   				m:    m + 1,
   				mm:   pad(m + 1),
   				mmm:  dF.i18n.monthNames[m],
   				mmmm: dF.i18n.monthNames[m + 12],
   				yy:   String(y).slice(2),
   				yyyy: y,
   				h:    H % 12 || 12,
   				hh:   pad(H % 12 || 12),
   				H:    H,
   				HH:   pad(H),
   				M:    M,
   				MM:   pad(M),
   				s:    s,
   				ss:   pad(s),
   				l:    pad(L, 3),
   				L:    pad(L > 99 ? Math.round(L / 10) : L),
   				t:    H < 12 ? "a"  : "p",
   				tt:   H < 12 ? "am" : "pm",
   				T:    H < 12 ? "A"  : "P",
   				TT:   H < 12 ? "AM" : "PM",
   				Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
   				o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
   				S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
   			};

   		return mask.replace(token, function ($0) {
   			return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
   		});
   	};
   }();

   // Some common format strings
   dateFormat.masks = {
   	"default":      "ddd mmm dd yyyy HH:MM:ss",
   	shortDate:      "m/d/yy",
   	mediumDate:     "mmm d, yyyy",
   	longDate:       "mmmm d, yyyy",
   	fullDate:       "dddd, mmmm d, yyyy",
   	shortTime:      "h:MM TT",
   	mediumTime:     "h:MM:ss TT",
   	longTime:       "h:MM:ss TT Z",
   	isoDate:        "yyyy-mm-dd",
   	isoTime:        "HH:MM:ss",
   	isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
   	isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
   };

   // Internationalization strings
   dateFormat.i18n = {
   	dayNames: [
   		"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
   		"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
   	],
   	monthNames: [
   		"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
   		"January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
   	]
   };

   // For convenience...
   Date.prototype.format = function (mask, utc) {
   	return dateFormat(this, mask, utc);
   };
});