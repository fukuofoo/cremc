// JavaScript Document

$(document).bind("mobileinit", function(){
    $.mobile.notesdb = openDatabase('trnotes', '1.0', 'Travel Notes', 2*1024*1024);
    $.mobile.notesdb.transaction(function (t) {
	    t.executeSql('CREATE TABLE IF NOT EXISTS notes (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, details TEXT NOT NULL, entered TEXT NOT NULL, updated TEXT, latitude REAL, longitude REAL);');
    });
});