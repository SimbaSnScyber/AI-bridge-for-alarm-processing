if (Event.SourceType == "MACRO" && Event.SourceId == 999 && Event.Action == "RUN") {
    var id = Event.GetParam("param0");
    var slave = Event.GetParam("computer");

    DebugLogString("Site is:"+id + " on computer " +slave);
   // var full_event = Event.GetParam("full_event");

    switch (slave) {
        case "DESKTOP-VSGE0M5":
            opcieId = [1];
            not_found = false;
            break;
        case "OPERATOR-1":
            opcieId = [1];
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

    if (!empty(slave) && !not_found) {
      
            var address = GetObjectParam("SIGNALTOWER", id, "address");
            var armed_resp = GetObjectParam("SIGNALTOWER", id, "armed_response");
            var fire_dept = GetObjectParam("SIGNALTOWER", id, "fire_dept");

            var operator_name = GetObjectParam("SIGNALTOWER", id, "operator_name");
            var operator_contact = GetObjectParam("SIGNALTOWER", id, "operator_contact");           
            var twoic_name = GetObjectParam("SIGNALTOWER", id, "twoic_name");
            var twoic_contact = GetObjectParam("SIGNALTOWER", id, "twoic_contact");
            DebugLogString("Site contact info is" + twoic_contact + twoic_name);
            var fdo_name = GetObjectParam("SIGNALTOWER", id, "fdo_name");
            var fdo_contact = GetObjectParam("SIGNALTOWER", id, "fdo_contact");
            var ops_name = GetObjectParam("SIGNALTOWER", id, "ops_name");
            var ops_contact = GetObjectParam("SIGNALTOWER", id, "ops_contact");


            for (k = 0; k < opcieId.length; k++) {				// sending the captured data to the CiiMS page by calling OPCIE|FUNC with function inside the page to display the data
                DoReactStr("OPCIE", opcieId[k], "FUNC", "func_name<setAllInfo>,id<" + id + ">,address<" + address + ">,armed_resp<" + armed_resp + ">,fire_dept<" + fire_dept + ">,operator_name<" + operator_name + ">,operator_contact<" + operator_contact + ">,twoic_name<" + twoic_name + ">,twoic_contact<" + twoic_contact + ">,fdo_name<" + fdo_name + ">,fdo_contact<" + fdo_contact + ">,ops_name<" + ops_name + ">,ops_contact<" + ops_contact + ">");
                DebugLogString("Site contact info OPCIE is" + opcieId[k]);
                DebugLogString("Site contact info is(\"OPCIE\"," + opcieId[k] + ",\"FUNC\",\"func_name<setAllInfo>,id<" + id + ">,address<" + address + ">,armed_resp<" + armed_resp + ">,fire_dept<" + fire_dept + ">,operator_name<" + operator_name + ">,operator_contact<" + operator_contact + ">,twoic_name<" + twoic_name + ">,twoic_contact<" + twoic_contact + ">,fdo_name<" + fdo_name + ">,fdo_contact<" + fdo_contact + ">,ops_name<" + ops_name + ">,ops_contact<" + ops_contact + ">)");
            }
        }

    }

    
function empty(str) {
    if (typeof str == 'undefined' || !str || str.length === 0 || str === "" || !/[^\s]/.test(str) || /^\s*$/.test(str) || str.replace(/\s/g, "") === "") { return true; }
    else { return false; }
};



function messageAction(msg, slave) {
    var cmd = "mshta \"javascript:var sh=new ActiveXObject( 'WScript.Shell' ); sh.Popup( '" + msg + "', 10, 'Warning', 64 );close()\"";
    DoReactStr("SLAVE", slave, "CREATE_PROCESS", "command_line<" + cmd + ">");
};

