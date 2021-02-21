function updatePresence(tab) {
    if (tab) {
        var url = new URL(tab.url);
        if (url.hostname != "iot.chinhphucvn.com") {
            var data = {
                action: "clear"
            };
        } else {
            var pathArray = url.pathname.split('/')
            var details = pathArray[1]; // Most IOT stuff have first path like /Compete or /Revise so we can get it to determine state
            var codename = ""
            if (details.toLowerCase() == "compete") {
                details = "Competing"
                if (typeof pathArray[2] != "undefined") {
					state = pathArray[2]  //The state here is the room number
				}
				else { state = "Waiting for a match" }
				if (state != "Waiting for a match") {
					codename = state.replace(/[^a-z]/gi, '').toLowerCase()
				}
				else {codename = ""}
			} else if (details.toLowerCase() == "revise") {
                details = "Revising"
                if (typeof pathArray[3] != "undefined") {
					state = "Room " + pathArray[3]  //The state here is the room number
				}
				else { state = "Looking for a room"}
                codename = "revise"
            } else {
                details = "Idle"
                state = ""
                codename = ""
            }
            var data = {
                action: "set",
                url: tab.url,
                details: details,
            };
			if (state != ""){data.state = state;}
			if (codename != ""){data.smallimage = codename;}
        }

        var settings = {
            "async": true,
            "crossDomain": true,
            "url": "http://127.0.0.1:3000/",
            "method": "POST",
            "headers": {
                "content-type": "application/json"
            },
            "processData": false,
            "data": JSON.stringify(data)
        }

        $.ajax(settings);
    } else {
        var data = {
            action: "clear"
        };
    }
}

var lastCheckedTabId;
var wasFocused = false;
setInterval(() => { // on an interval…
    chrome.windows.getAll({
        populate: true
    }, function(windows) {
        windows.forEach(function(window) {
            window.tabs.forEach(function(tab) {
                if (tab.highlighted) {
                    if (tab.id != lastCheckedTabId || !wasFocused) { // if this is different than the tab we got last time, or the browser was not focused last time
                        updatePresence(tab); // user has switched tabs; update our presence!
                        lastCheckedTabId = tab.id; // remember the tab we found
                    }
                    wasFocused = true; // remember that a window was focused last check
                } else { // it's not focused; user is not looking at chrome
                    if (wasFocused) { // if it was focused on the last check
                        updatePresence(null); // user has stopped looking at chrome; clear the presence.
                    }
                    wasFocused = false; // remember that no window was focused last check
                }
            });
        });
    });
}, 1000); // check every second