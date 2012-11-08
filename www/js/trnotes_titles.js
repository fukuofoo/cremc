// JavaScript Document

$(document).bind("mobileinit", function(){
    $.mobile.notesdb = openDatabase('trnotes', '1.0', 'Travel Notes', 2*1024*1024);
    $.mobile.notesdb.transaction(function (t) {
	    t.executeSql('CREATE TABLE IF NOT EXISTS notes (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, details TEXT NOT NULL, entered TEXT NOT NULL, updated TEXT, latitude REAL, longitude REAL);');
    });
});

$(function() {
	$('#home').live('pagebeforeshow', getTitles);
	$('#new').live('pageshow', getLocation);
	$('#insert').live('submit', insertEntry);
});

var trNotes = {
	lat: null,
	lng: null,
	limit: 20
};

function getTitles() {
	var list = $('#recent'),
	    items = [];
	$.mobile.notesdb.transaction(function(t) {
		t.executeSql('SELECT id, title FROM notes ORDER BY id DESC LIMIT ?', [trNotes.limit], function(t, result) {
			var i,
			    len = result.rows.length,
				row;
			if (len > 0 ) {
				for (i = 0; i < len; i += 1) {
					row = result.rows.item(i);
					items.push('<li><a href="#display" data-trnote="' + row.id + '">' + row.title + '</a></li>');
					
				}
				list.html(items.join('\n'));
				list.listview('refresh');
				$('a', list).live('click', function(e) {
					getItem($(this).attr('data-trnote'));
				});
				$('#entries').show();
			} else {
				$('#entries').hide();
			}
		})
	});
}

function getLocation() {
	navigator.geolocation.getCurrentPosition(
	    locSuccess,
		locFail,
		{enableHighAccuracy: true}
	);
}

function locSuccess(position) {
	trNotes.lat = position.coords.latitude;
	trNotes.lng = position.coords.longitude;
}

function locFail(error) {
	var message = 'Cannot determine location.';
	if (error.code == error.PERMISSION_DENIED) {
		message += ' Geolocation is disabled.';
	}
	try {
		navigator.notification.alert(message, null, 'Geolocation');
	} catch (e) {
		alert(message);
	}
};

function insertEntry(e) {
	var title = $('#title').val(),
	    details = $('#details').val();
	$.mobile.notesdb.transaction(function(t) {
		t.executeSql('INSERT into notes (title, details, entered, latitude, longitude) VALUES (?,?,date("now"),?,?);',
		[title, details, trNotes.lat, trNotes.lng],
		function() {
			$.mobile.changePage('#home', 'slide', false, true);	
			$('#title').val('');
			$('#details').val('');
		}, 
		null);
	});
	e.preventDefault();
};
