// This script shows the Custom CiiMS webpage

var instanceName = "DESKTOP-VSGE0M5\\SQLEXPRESS";		// MTN SQL core - some of the data is being gathered from there
var dbName = "axxon_psim";				// 
var sqlUser = "sa";
var sqlPass = "Intellect_default_db_4";
var CiiMS_operator_step = "Operator Comment";	// name of IM workflow step which will trigger the script execution
var CiiMS_operator_step_final = "Report_Review";	// name of IM workflow step which will trigger the script execution

// Catching the MACRO|2201 events:
if (Event.SourceType == "MACRO" && Event.Action == "RUN" && Event.SourceId == "2201") {

    var slave = Event.GetParam("computer");
    var full_event = Event.GetParam("full_event");
    switch (slave) {
        case "DESKTOP-VSGE0M5":
            opcieId = [1];
            not_found = false;
            break;
        case "OPERATOR-1":
            opcieId = [5];
            not_found = false;
            break;
        case "OPERATOR-2":
            opcieId = [2];
            not_found = false;
            break;
        default:
            opcieId = [9998];
            not_found = true;
            break;
    }

    if (!not_found) {		// if interface has been found
        DebugLogString("CiiMS custom page script: computer " + slave + ": displaying CiiMS custom HTML page...");

        
        var json = JSON.parse(full_event);	// parsing JSON from the previous variable

        var region_id = json.rows[0].Region.Id;
        var siteId = GetObjectIdByParam("SIGNALTOWER", "region_id", region_id);	// siteID

        var source_event = json.rows[0].SourceMsgBase64;
        var SourceMsgBase64_b64_decoded = Base64Decode(source_event, 0);
	DebugLogString("json is" + SourceMsgBase64_b64_decoded);
        var SourceMsgSplit = SourceMsgBase64_b64_decoded.split("|");
        var objectType = SourceMsgSplit[0];		// src_objtype
        var objectId = SourceMsgSplit[1];		// src_objid
        var eventType = Event.GetParam("eventType");		// src_action

        var event_uuid = getGuidOfSourceEvent(SourceMsgBase64_b64_decoded).replace(/[{}]/g, ""); // event_guid

        var eventFullTimestamp = getSourceAlertTimestamp(SourceMsgBase64_b64_decoded); // alert_timestamp
        var timestampSplit = eventFullTimestamp.split(" ");
        var eventDate = timestampSplit[0];					// eventDate
        var eventTime = timestampSplit[1];					// eventTime
        var id = siteId;

      //  var popTime = GetObjectParam("SIGNALTOWER", siteId, "response_time");		// POP time
      var address = GetObjectParam("SIGNALTOWER", id, "address");				// Address
      DebugLogString("Address is " + address);

        var userId = json.rows[0].Assignee.Id;						// userId
        var userName = GetObjectName("PERSON", userId);				// userName
        DebugLogString("CiiMS custom page script: username " + userName);

        var processedTime = Event.GetParam("time");				// processedTime
        var processedDate = Event.GetParam("date");				// processedDate



        var acknowledge_timestamp = getAcknowledgeTimestamp(event_uuid);		// acknowledge timestamp

	var cameraID = getCamera(event_uuid);	// get camera
	var timestamp =axxonOneEventTime(event_uuid);	//get axxon one event time
	DebugLogString("Camera id is " + cameraID + " and timestamp is" + timestamp);


        var operatorActions = getOperatorActions2(event_uuid);               //operator actions
        DebugLogString("CiiMS custom page script: Operator Actions: " + operatorActions);

        var operatorActionsToCiims = getOperatorActionsToSendToCiims(event_uuid);
        DebugLogString("CiiMS custom page script: Operator Actions to CiiMs: " + operatorActionsToCiims);

        for (k = 0; k < opcieId.length; k++) {				// sending the captured data to the CiiMS page by calling OPCIE|FUNC with function inside the page to display the data
            DoReactStr("OPCIE", opcieId[k], "FUNC", "func_name<setAllInfo>,eventUuid<" + event_uuid + ">,eventFullTimestamp<" + eventFullTimestamp + ">,eventDate<" + eventDate + ">,eventTime<" + eventTime + ">,eventType<" + eventType + ">,siteId<" + siteId + ">,address<" + address + ">,interfaceName<" + slave + " Live>,computerName<" + slave + ">,userId<" + userId + ">,userName<" + userName + ">,cameraID<" + cameraID + ">,timestamp<" + timestamp + ">,processedTime<" + processedTime + ">,processedDate<" + processedDate + ">,operatorActions<" + operatorActionsToCiims + ">");
            DebugLogString("CiiMS custom page script: sending data to " + opcieId[k]);
            DebugLogString("CiiMS custom page script: DoReactStr(\"OPCIE\"," + opcieId[k] + ",\"FUNC\",\"func_name<setAllInfo>,eventUuid<" + event_uuid + ">,eventFullTimestamp<" + eventFullTimestamp + ">,eventDate<" + eventDate + ">,eventTime<" + eventTime + ">,eventType<" + eventType + ">,siteId<" + siteId + ">,address<" + address + ">,interfaceName<" + slave + " Live>,computerName<" + slave + ">,userId<" + userId + ">,userName<" + userName + ">,cameraID<" + cameraID + ">,timestamp<" + timestamp + ">,processedTime<" + processedTime + ">,processedDate<" + processedDate + ">,operatorActions<" + operatorActionsToCiims + ">)");
        }
        // Inserting the captured data both to BPC database and to MTN databases:
       // doInsertCiiMStoBPCDatabase(event_uuid, eventFullTimestamp, siteId, popTime, "1", eventType, transmitter, acknowledge_timestamp, subcontractors, refNo, siteR24DispatchTime, arrivalTime, category, rootCause, investigators, operatorActions, siteR24Updates, "");
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

function getControlTypeFromStep(step_string) {
    var message_split = step_string.split("control_type<");
    var control_type = message_split[1].split(">,");
    return control_type[0];
};

function getTimestampFromStep(step_string) {
    var message_split = step_string.split("timestamp<");
    var step_timestamp = message_split[1].split(">,");
    return step_timestamp[0];
};

function getGuidOfSourceEvent(step_string) {
    var message_split = step_string.split("guid_pk<");
    var guid = message_split[1].split(">,");
    return guid[0];
};

function getSourceAlertTimestamp(step_string) {
    var message_split1 = step_string.split("date<");
    var dateSplit = message_split1[1].split(">,");
    var date = dateSplit[0];
    var split = date.split("-");
    var newDate = "20" + split[2] + "-" + split[1] + "-" + split[0];
    var newDate2 = newDate.replace(/[<>]/g, "")
    var message_split2 = step_string.split(",time<");
    var timeSplit = message_split2[1].split(">,");
    var time = timeSplit[0];
    return newDate2 + " " + time
};

function getCommentTextFromOperatorStep(step_string) {
    var message_split = step_string.split("edit_text<");
    var text = message_split[1].split(">,");
    return text[0].replace(/[<>]/g, "");
};




function getOperatorActions2(uuid) {
    var cmd = "sqlcmd -U \"" + sqlUser + "\" -P \"" + sqlPass + "\" -S \"" + instanceName + "\" -W -h -1 -s \"|\" -Q \"SET NOCOUNT ON;";
    var sqlQuery = "SELECT dateadd(HOUR, 2, ack_timestamp) as ack_timestamp, parent_control_id, child_control_id, edit_text FROM [axxon_psim].[dbo].[operator_action] WHERE event_guid = '" + uuid + "' order by ack_timestamp ASC\"";
    var execution = cmd + " " + sqlQuery;
    DebugLogString("CiiMS custom page script: getOperatorActions2: the cmd for Operator Actions: " + execution);
    var run = run_cmd_timeout(execution, 11000);
    DebugLogString("CiiMS custom page script: getOperatorActions2: the result of Operator Actions: " + run);
    return run.replace(/(\r\n|\n|\r)/gm, "");

};

// This function differs from getOperatorActions2 by adding a delimiter between each action and 
// combining the step name and the value chosen for that step
function getOperatorActionsToSendToCiims(uuid) {
    var cmd = "sqlcmd -U \"" + sqlUser + "\" -P \"" + sqlPass + "\" -S \"" + instanceName + "\" -W -h -1 -s \"|\" -Q \"SET NOCOUNT ON;";
    var sqlQuery = "SELECT CONCAT(dateadd(HOUR, 2, ack_timestamp), ';', parent_control_id, ';', edit_text) FROM [axxon_psim].[dbo].[operator_action] WHERE event_guid = '" + uuid + "' order by ack_timestamp ASC\"";
    var execution = cmd + " " + sqlQuery;
    DebugLogString("CiiMS custom page script: getOperatorActionsToSendToCiims: the cmd for Operator Actions to CiiMs: " + execution);
    var run = run_cmd_timeout(execution, 11000);
    DebugLogString("CiiMS custom page script: getOperatorActionsToSendToCiims: the result of Operator Actions to CiiMs: " + run);
    return run.replace(/(\r\n|\n|\r)/gm, "|");
};

function getDataFromStepName(step_name, tower) {
    var cmd = "sqlcmd -U \"" + sqlUser + "\" -P \"" + sqlPass + "\" -S \"" + instanceName + "\" -W -h -1 -s \"|\" -Q \"SET NOCOUNT ON;";
    var sqlQuery = "declare @Investigator int; SET @Investigator = (SELECT TOP 1 child_control_id_0 FROM operator_action WHERE siteId = '" + tower + "' AND parent_control_id = '" + step_name + "' AND ack_timestamp >= DATEADD(hour, -5, GETDATE()) ORDER by ack_timestamp DESC); SELECT g.content_value FROM (SELECT ROW_NUMBER() OVER (ORDER BY (SELECT 1)) AS rownumber, right(value,len(value)-1) as content_value FROM STRING_SPLIT((SELECT SUBSTRING(h.content0, 0, CHARINDEX('>,', h.content0)) as content FROM (SELECT TOP 1 (SUBSTRING(control_descr, CHARINDEX('combo.content.0', control_descr) + 17, LEN(convert(varchar(MAX), control_descr)))) as content0 FROM [axxon_psim].[dbo].[OBJ_INC_SERVER_PROCESSOR_CTRLS] WHERE control_id = '" + step_name + "' and main_id = '1') h), '\\')) g WHERE rownumber = @Investigator+1\"";
    var execution = cmd + " " + sqlQuery;
    DebugLogString("CiiMS custom page script: getDataFromStepName: The cmd for " + step_name + " is: " + execution);
    var run = run_cmd_timeout(execution, 11000);
    DebugLogString("CiiMS custom page script: getDataFromStepName: The result of " + step_name + " is: " + run);
    return run.replace(/(\r\n|\n|\r)/gm, "");

};

function getAcknowledgeTimestamp(event) {
    var cmd = "sqlcmd -U \"" + sqlUser + "\" -P \"" + sqlPass + "\" -S \"" + instanceName + "\" -W -h -1 -s \"|\" -Q \"SET NOCOUNT ON;";
    var sqlQuery = "SELECT TOP 1 ack_timestamp FROM [axxon_psim].[dbo].[operator_action] WHERE event_guid = '" + event + "' ORDER by alert_timestamp DESC;\"";
    var execution = cmd + " " + sqlQuery;
    DebugLogString("CiiMS custom page script: getAcknowledgeTimestamp: the cmd for is: " + execution);
    var run = run_cmd_timeout(execution, 11000);
    DebugLogString("CiiMS custom page script: getAcknowledgeTimestamp: the result of execution is: " + run);
    return run.replace(/(\r\n|\n|\r)/gm, "");
};


function getCamera(event) {
    var cmd = "sqlcmd -U \"" + sqlUser + "\" -P \"" + sqlPass + "\" -S \"" + instanceName + "\" -W -h -1 -s \"|\" -Q \"SET NOCOUNT ON;";
    var sqlQuery = "SELECT TOP 1 param2 FROM [axxon_psim].[dbo].[PROTOCOL] WHERE pk = '" + event + "' ORDER by param2 DESC;\"";
    var execution = cmd + " " + sqlQuery;
    DebugLogString("Camera for event is: " + execution);
    var run = run_cmd_timeout(execution, 11000);
    DebugLogString("Camera param2 for event is: " + run);
    return run.replace(/(\r\n|\n|\r)/gm, "");
};

function axxonOneEventTime(event) {
    var cmd = "sqlcmd -U \"" + sqlUser + "\" -P \"" + sqlPass + "\" -S \"" + instanceName + "\" -W -h -1 -s \"|\" -Q \"SET NOCOUNT ON;";
    var sqlQuery = "SELECT TOP 1 param3 FROM [axxon_psim].[dbo].[PROTOCOL] WHERE pk = '" + event + "' ORDER by param2 DESC;\"";
    var execution = cmd + " " + sqlQuery;
    DebugLogString("Axxon One Timestamp for event is: " + execution);
    var run = run_cmd_timeout(execution, 11000);
    DebugLogString("Axxon one timestamp for param3 for event is: " + run);
    return run.replace(/(\r\n|\n|\r)/gm, "");
};


function getTimestampFromEventGUID(guid) {
    var cmd = "sqlcmd -U \"" + sqlUser + "\" -P \"" + sqlPass + "\" -S \"" + instanceName + "\" -W -h -1 -s \"|\" -Q \"SET NOCOUNT ON; SELECT TOP 1 [date] FROM [axxon_psim].[dbo].[PROTOCOL] WHERE [pk] = '" + guid + "'\"";
    DebugLogstring("getTimestampFromEventGUID: cmd is " + cmd);
    var run = run_cmd_timeout(cmd, 9000);
    DebugLogString("CiiMS custom page script: getTimestampFromEventGUID: First check: found timestamp \"" + run + "\" for event " + guid);
    if (empty(run)) {
        var cmd2 = "sqlcmd -U \"" + sqlUser + "\" -P \"" + sqlPass + "\" -S \"" + instanceName + "\" -W -h -1 -s \"|\" -Q \"SET NOCOUNT ON; SELECT TOP 1 alert_timestamp FROM dataservice.[axxon_psim].[dbo].[operator_action] WHERE event_guid = '" + guid + "'\"";
        DebugLogstring("getTimestampFromEventGUID: second cmd is " + cmd2);
        var run2 = run_cmd_timeout(cmd2, 9000);
        DebugLogString("getTimestampFromEventGUID: Second check: found timestamp \"" + run2 + "\" for event " + guid);
        return run2.replace(/(\r\n|\n|\r)/gm, "")
    } else {
        return run.replace(/(\r\n|\n|\r)/gm, "");
    }
};

function empty(str) {
    if (typeof str == 'undefined' || !str || str.length === 0 || str === "" || !/[^\s]/.test(str) || /^\s*$/.test(str) || str.replace(/\s/g, "") === "") { return true; }
    else { return false; }
};
 /*
function doInsertCiiMStoBPCDatabase(event_uui, event_time, site, pop, zone, event_typ, transmitter, ack_tim, subcontract, respRef, disp_time, arr_time, cate, root, inv, reactions, r24_mes, soa) {
    var sqlQuery = "INSERT INTO ciims_messages VALUES (CURRENT_TIMESTAMP,'" + event_uui + "','" + event_time + "','" + site + "','" + pop + "','" + zone + "','" + event_typ + "','" + transmitter + "','" + ack_tim + "','Yes','" + subcontract + "','Yes','" + respRef + "','" + disp_time + "','" + arr_time + "','" + cate + "','ALARM','PSIM ALARM','" + root + "','" + investigatorsRequired + "','" + inv + "','" + reactions + "','" + r24_mes + "','" + soa + "');";

    var cmdTwo = "sqlcmd -U \"PSIM\" -P \"Intellect_default_DB_4\" -S \"10.80.50.132\\PSIM_VDB,1550\" -d custom_db -Q \"" + sqlQuery + "\"";
    var runTwo = run_cmd_timeout(cmdTwo, 14000);
    DebugLogString("CiiMS custom page script: doInsertCiiMStoBPCDatabase cmdTwo is: " + cmdTwo);
    DebugLogString("CiiMS custom page script: doInsertCiiMStoBPCDatabase execution result for runTwo is: " + runTwo);
};
*/