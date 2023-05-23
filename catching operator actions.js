if (Event.SourceType == "INC_SERVER" && Event.Action == "EVENT") {
    var timestamp = Event.GetParam("date") + " " + Event.GetParam("time");
    var param2 = Event.GetParam("param2");
    DebugLogString("camera is "+param2)
    var full_event = Base64Decode(Event.GetParam("serializeBase64"), 0);
    var json = JSON.parse(full_event);
    var WorksBase64 = json.rows[0].WorksBase64;
    var WorksBase64_length = WorksBase64.length;
DebugLogString("JSOn is"+full_event)

    var event_status = json.rows[0].Status;
    var event_resolution = json.rows[0].Resolution;

    if (WorksBase64_length >= 2 && event_status == 1 && event_resolution == 0) { //only process the script when operator done at least one step in the workflow; status=1 is acknolwedged; resolution=0 is event is not resolved
        last_step = Base64Decode(WorksBase64[WorksBase64_length - 2], 0);
        var step_raw = last_step.substring(3);
        var step_name = getStepName(step_raw);
        var slave = getHostNameFromOperatorSteps(step_raw);
        var siteId = json.rows[0].Region.Name;
	var eventType = json.rows[0].HumanValues.Action;
DebugLogString("Event is "+eventType)
        // ***** OVERACTIVE LOGIC START *****
      //  if (step_name == "CameraButton") {	// catching when operator selects the no_dispatch step in IM to check if Overactive logic applies
        //     DoReactStr("MACRO", "500", "RUN", "param0<" + siteId + ">");
                
            
         //   }

            if (step_name == "Spray Deployed") {	// catching when operator selects the no_dispatch step in IM to check if Overactive logic applies
                DoReactStr("MACRO", "256", "RUN", "param0<" + siteId + ">");
                   
               
               }

            //if (step_name == "1") {	// catching when operator selects the no_dispatch step in IM to check if Overactive logic applies
             //   DoReactStr("MACRO", "999", "RUN", "param0<" + siteId + ">,computer<" + slave + ">"); // Do the the dispatch confirmation dialog
             //     DebugLogString("MAcro 999"); 
               
              // }

              if (step_name == "Operator Comment") {	// catching open the CiiMS report button pressed by an operator in the IM workflow
                DoReactStr("MACRO", "2201", "RUN", "full_event<" + full_event + ">,computer<" + slave + ">,eventType<" + eventType + ">");
                DebugLogString(timestamp + " Catching operator actions for logics script: catched the IM population of report event on workstation " + slave + "!");
                // ***** CiiMS POPULATION LOGIC STOP *****
            } 

            if (step_name == "Report_Review") {	// catching open the CiiMS report button pressed by an operator in the IM workflow

                    DoReactStr("MACRO", "721", "RUN", "action<expand>,opcieId<5>");

                DebugLogString("Resizing For" + slave + "!");
                // ***** CiiMS POPULATION LOGIC STOP *****
            }

    }
};


function getGuidOfSourceEvent(step_string) {
    var message_split = step_string.split("guid_pk<");
    var guid = message_split[1].split(">,");
    return guid[0];
};

function getChildControlIdValue(step_string, id) {
    var message_split = step_string.split("child_control_id." + id + "<");
    if (!empty(message_split[1])) {
        var value = message_split[1].split(">,");
        return value[0].replace(/[<>]/g, "");
    } else {
        return "";
    }
};




function getHostNameFromOperatorSteps(step_string) {
    var message_split = step_string.split("slave_id<");
    var slave = message_split[1].split(">,");
    return slave[0];
};

function getStepName(step_string) {
    var message_split = step_string.split("control_id<");
    var step_name = message_split[1].split(">,");
    return step_name[0];
};

function empty(str) {
    if (typeof str == 'undefined' || !str || str.length === 0 || str === "" || !/[^\s]/.test(str) || /^\s*$/.test(str) || str === "") { return true; }
    else { return false; }
};