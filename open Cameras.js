if (Event.SourceType == "MACRO" && Event.Action == "RUN" && Event.SourceId == 500) {
  var id = Event.GetParam("param0");
  DebugLogString("Site is:"+id);
  var dns =  GetObjectParam("SIGNALTOWER", id, "dns"); 
  DebugLogString("DNS is"+dns);
  DoReactStr("SLAVE", Event.GetParam("slave_id"), "CREATE_PROCESS", "command_line<\"http://ccmallat55.dyndns.biz:81\">");
  
}

function empty(str) {
if (typeof str == 'undefined' || !str || str.length === 0 || str === "" || !/[^\s]/.test(str) || /^\s*$/.test(str) || str === "") { return true; }
else { return false; }
}