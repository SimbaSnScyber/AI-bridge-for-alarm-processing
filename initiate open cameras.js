// This script should catch the select press by operators in Incident Manager,
// Correspodning tower/R24/cameras/events should be shown.

if (Event.SourceType == "INC_MANAGER" && Event.Action == "SELECT") {

    //var display_id = GetObjectParentId(Event.SourceType,Event.SourceId,"DISPLAY");
    //var display_name = GetObjectName("DISPLAY",display_id)
    //DebugLogString("Operator selected this event on "+display_name);

    var full_event = Base64Decode(Event.GetParam("serializeBase64"), 0);
    var json = JSON.parse(full_event);

    var slave = Event.GetParam("slave_id");
    var slaveSplit = slave.split(".");

    var siteId = json.rows[0].Region.Name

    DebugLogString("Operator click selection detected on " + slaveSplit[0] + ". Site id chosen is: " + siteId);
   // DoReactStr("MACRO", 1004, "RUN", "slave_id<" + slaveSplit[0] + ">,number<" + siteId_numeric + ">");
    DoReactStr("MACRO", 500, "RUN", "slave_id<" + slaveSplit[0] + ">, param0<" + siteId + ">");

};