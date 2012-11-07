// JavaScript Document

$(document).bind("mobileinit", function(){
    $.mobile.notesdb = openDatabase('trnotes', '1.0', 'Travel Notes', 2*1024*1024);
    $.mobile.notesdb.transaction(function (t) {
	    t.executeSql('CREATE TABLE IF NOT EXISTS notes (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, details TEXT NOT NULL, entered TEXT NOT NULL, updated TEXT, latitude REAL, longitude REAL);');
    });
});

$(function() {
	$('#new').live('pageshow', getLocation);
	$('#insert').live('submit', insertEntry);
});

var trNotes = {
	lat: null,
	lng: null,
	limit: 20
};

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
