// JavaScript Document

//$(document).bind("mobileinit", function(){
    $.mobile.notesdb = openDatabase('trnotes', '1.0', 'Travel Notes', 2*1024*1024);
    $.mobile.notesdb.transaction(function (t) {
	    t.executeSql('CREATE TABLE IF NOT EXISTS notes (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, details TEXT NOT NULL, entered TEXT NOT NULL, updated TEXT, latitude REAL, longitude REAL);');
    });
//});

$(function() {
	$('#home').live('pagebeforeshow', getTitles);
	$('#new').live('pageshow', getLocation);
	$('#insert').live('submit', insertEntry);
	$('#editItem').live('click', editItem);
	$('#delete').live('click', deleteItem);
	$('#update').live('click', updateItem);
	$('#limit').live('click', swapList);
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

function getItem(id) {
	$.mobile.notesdb.transaction(function(t) {
		t.executeSql('SELECT * FROM notes WHERE id = ?',
		[id],
		function(t, result) {
			var row = result.rows.item(0),
				entered = convertToMDY(row.entered),
				updated = row.updated,
				opts = {};
			$('#display h1').text(row.title);
			$('#display article').html('<p>' + row.details + '</p>');
			if (row.latitude == null) {
				$('#showmap').parent('p').hide();
			} else {
				$('#showmap').parent('p').show();
				opts.title = row.title;
				opts.lat = row.latitude;
				opts.lng = row.longitude;
				$('#showmap').unbind('click');
				$('#showmap').click(opts, displayMap);
			}
			$('#display footer').html('<p>Created: ' + entered + '</p>');
			if (updated != null) {
				updated = convertToMDY(updated);
				$('#display footer').append('<p>Updated: ' + updated + '</p>');
			}
			$('#delete, #update').attr('data-trnote', id);
			$('#title2').val(row.title);
			$('#details2').val(row.details);
		})
	});
}

function convertToMDY(date) {
	var d = date.split('-');
	return d[1] + '/' + d[2] + '/' + d[0];
};

function displayMap(e) {
	var title = e.data.title,
	    latlng = e.data.lat + ',' + e.data.lng;
	if (typeof device !='undefined' && device.platform.toLowerCase() == 'android') {
		window.location = 'http://maps.google.com/maps?z=16&q=' + encodeURIComponent(title) + '@' + latlng;
	} else {
		$('#map h1').text(title);
		$('#map div[data-role=content]').html('<img src="http://maps.google.com/maps/api/staticmap?center=' + latlng + ' &zoom=16&size=320x420&markers=' + latlng + '&sensor=false">');
		$.mobile.changePage('#map', 'fade', false, true);
	}
}

function editItem() {
	$.mobile.changePage('#editNote', 'slideup', false, true);
}

function deleteItem(e) {
	var id = $(this).attr('data-trnote');
	$.mobile.notesdb.transaction(function(t) {
		t.executeSql('DELETE FROM notes WHERE id = ?',
			[id],
			$.mobile.changePage('#home', 'slide', false, true),
			null);
	});
	e.preventDefault();
}

function updateItem(e) {
	var title = $('#title2').val(),
	    details = $('#details2').val(),
		id = $(this).attr('data-trnote');
	$.mobile.notesdb.transaction(function(t) {
		t.executeSql('UPDATE notes SET title = ?, details = ?, updated = date("now") WHERE id = ?',
		    [title, details, id],
			$.mobile.changePage('#home', 'flip', false, true),
			null);
	});
	e.preventDefault();
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

function swapList() {
	var btn = $('#limit .ui-btn-text');
	if (btn.text() == 'List All') {
		btn.text('List Most Recent');
		$('#entries h2').text('All Notes');
		trNotes.limit = -1;
	} else {
		btn.text('List All');
		$('#entries h2').text('Most Recent Notes');
		trNotes.limit = 20;
	}
	getTitles();
}