set id=%1

mshta "javascript:var sh=new ActiveXObject( 'WScript.Shell' ); sh.Popup( 'You have successfully created an event for %id%', 2000, 'Success!', 64 );close()"