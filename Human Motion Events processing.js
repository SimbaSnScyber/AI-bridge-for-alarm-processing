if (Event.SourceType == "MACRO" && Event.SourceId == 3050 && Event.Action == "RUN") {	// Macro 3050 is used for sites
    var id = Event.GetParam("param0");
    var eventType = Event.GetParam("param1");
    var cameraId = Event.GetParam("param2");
    var regionId = GetObjectParam("SIGNALTOWER", id, "region_id");	
    var eventTimestampOne = Event.GetParam("param3");
	var timestamp = eventTimestampOne;
	var check = isMoreThan15Minutes(timestamp);
	DebugLogString("Check value is: " +check)
	var slave =  Event.GetParam("slave_id").split('.')[0]

    if (!empty(id) && !empty(eventType)  && !check) { // only proceed if those 3 parameters are not empty
  
        switch (eventType) {
        case "motion":
	    var imEvent = "MOTION";
	    break;

	    case "face":
	    var imEvent = "FD";
	    break;

	    case "alarm":
	    var imEvent = "ALARM";
	    break;

		case "manual_event":
	    var imEvent = "MANUAL_EVENT";
	    break;

	    default:
	    var imEvent = "UNKNOWN";
        }

       SetObjectParam("SIGNALTOWER", id, "last_message", eventType);			// setting the last message for the tower
	       
	if ( (imEvent != "UNKNOWN") && (!empty(cameraId)) ) { // Producing event        
            DebugLogString("SignalTower processing script: producing event for Site " + id + " for event: " +eventType + " from camera: " +cameraId);
            NotifyEventStr("SIGNALTOWER", id, imEvent, "siteId<" + id + ">,region_id<" + regionId + ">");
			if(imEvent == "MANUAL_EVENT" ){
				DebugLogString("Calling confirmation to manual event creation to site " + id );
				popupConfirmation(id, slave);
			}
        }
    }
};

function isMoreThan15Minutes(timestamp) {
	var currentTime = new Date();
	var year = timestamp.substring(0, 4);
	var month = timestamp.substring(4, 6) - 1; // Months are zero-indexed
	var day = timestamp.substring(6, 8);
	var hour = timestamp.substring(9, 11);
	var minute = timestamp.substring(11, 13);
	var second = timestamp.substring(13, 15);
	var timestampDate = new Date(Date.UTC(year, month, day, hour, minute, second));
	DebugLogString("isMoreThan15Minutes(): the current time: "+currentTime+"; timestamp is: "+timestampDate);
	var diffInSeconds = (currentTime - timestampDate)/1000;
	//DebugLogString("isMoreThan15Minutes(): difference in seconds is: "+diffInSeconds);
	var diffInMinutes = diffInSeconds / 60;
	//DebugLogString("isMoreThan15Minutes(): difference in minutes is: "+diffInMinutes);
  
   if (diffInMinutes >= 130) {
	  DebugLogString("true, \""+currentTime+"\" is bigger then \""+timestampDate+"\" for more than 15 mins");
	  return true;
	  } else {
	  DebugLogString("false, \""+currentTime+"\" is not bigger then \""+timestampDate+"\" for more than 15 mins");
	  return false;
	  }
  };

  function popupConfirmation(id, slave) {
    var cmd = "nircmd.exe exec hide C:\\notification.bat " + id;
    DebugLogString("Creating notification : \"" + cmd + "\" on computer " + slave);
    DoReactStr("SLAVE", slave, "CREATE_PROCESS", "command_line<" + cmd + ">");
};


function empty(str) {
    if (typeof str == 'undefined' || !str || str.length === 0 || str === "" || !/[^\s]/.test(str) || /^\s*$/.test(str) || str === "") { return true; }
    else { return false; }
};
