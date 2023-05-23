var call_timeout = 30000; // msecs

if (Event.SourceType == "MACRO" && Event.SourceId == "256" && Event.Action == "RUN") {

    var timestmap = Event.GetParam("date")+" "+Event.GetParam("time");
    var Log_message = timestmap+" Cash crusaders: sending macro script:";

    var site = Event.GetParam("param0");

    if (!empty(site)) {

        var site_url = GetObjectParam("SIGNALTOWER", site, "dns");
        var site_macro_uuid = GetObjectParam("SIGNALTOWER", site, "macro_guid");

        if (!empty(site_url) && !empty(site_macro_uuid)) {

            doHTTPRequestCall(site_url,site_macro_uuid);

        } else {

            DebugLogString(Log_message+" ERROR: either url or uuid are missing! Site URL is: \""+site_url+"\"; uuid is: \""+site_macro_uuid+"\".");
        }
        
    } else {

        DebugLogString(Log_message+" ERROR: site ID is missing! Var site is: \""+site+"\".");
    }
};

function empty(str) {

    if (typeof str == 'undefined' || !str || str.length === 0 || str === "" || !/[^\s]/.test(str) || /^\s*$/.test(str) || str === "" || str === "NULL") { return true; }
    else { return false; }
};

function doHTTPRequestCall(url,guid) {

    var cmd = "curl --user root:root -L -m 30 -X GET --url \""+url+"/macro/execute/"+guid+"\"";
    DebugLogString(Log_message+" cmd for the call is: "+cmd);

    var run = run_cmd_timeout(cmd, call_timeout);
    DebugLogString(Log_message+" execution result is: "+run);
};