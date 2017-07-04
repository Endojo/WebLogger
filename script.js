function pad(number, size) {
    var str = number + "";

    while (str.length < size)
        str = "0" + str;

    return str;
}

function formatTime(date) {
    return "" +
        pad(date.getHours(), 2) + ":" +
        pad(date.getMinutes(), 2) + ":" +
        pad(date.getSeconds(), 2);
}

var message_array = [];
var type_array = [];
var selected_types_array = [];
var last_printed_index = 0;

function update() {
    var log_table = document.getElementById("log_tbody");

    var length = message_array.length;
    for (i = last_printed_index; i < length; i++) {

        var type = message_array[i].type;
        if (selected_types_array.indexOf(type) == -1)
            continue;

        var new_row = log_table.insertRow();

        new_row.insertCell().innerHTML = formatTime(message_array[i].date);
        new_row.insertCell().innerHTML = message_array[i].type;
        new_row.insertCell().innerHTML = message_array[i].str;
    }

    last_printed_index = length;
}

function redraw() {
    var old_tbody = document.getElementById("log_tbody");
    var new_tbody = document.createElement("tbody");

    new_tbody.setAttribute("id", "log_tbody")
    old_tbody.parentNode.replaceChild(new_tbody, old_tbody)

    last_printed_index = 0;

    update();
}

function toggleType(lvl) {
    var i = selected_types_array.indexOf(lvl);

    if (i == -1) {
        selected_types_array.push(lvl);
        document.getElementById("type_" + lvl).classList.add("active");
    }
    else {
        selected_types_array.splice(i, 1);
        document.getElementById("type_" + lvl).classList.remove("active");
    }

    redraw();
}

function addMessage(lvl, msg, ms_since_epoch) {
    var time;
    if (typeof ms_since_epoch == "number")
        time = new Date(ms_since_epoch);
    else
        time = new Date();

    var message = {
        str: msg,
        type: lvl,
        date: time
    };

    message_array.push(message);

    if (type_array.indexOf(lvl) == -1) {
        type_array.push(lvl);
        selected_types_array.push(lvl);

        var new_type = document.createElement("a");
        new_type.setAttribute("href", "#");
        new_type.setAttribute("onclick", "toggleType('" + lvl + "')");
        new_type.setAttribute("id", "type_" + lvl);
        new_type.classList.add("active");
        new_type.innerText = lvl;

        var type_dropdown = document.getElementById("type_dropdown");
        type_dropdown.appendChild(new_type);
    }

    update();
}

function clearLog() {
    message_array.length = 0;
    type_array.length = 0;
    selected_types_array.length = 0;

    var old_div = document.getElementById("type_dropdown");
    var new_div = document.createElement("div");

    new_div.setAttribute("id", "type_dropdown");
    new_div.setAttribute("class", "dropdown-content");
    old_div.parentNode.replaceChild(new_div, old_div);

    redraw();
}


var connection = null;

function disconnect() {
    connection.close();
    connection = null;

    document.getElementById("menu_toggleConnect").classList.remove("active");
    document.getElementById("menu_toggleConnect").innerText = "Connect";
}

function connect() {
    //get the ip adress
    var ip_input = document.getElementById("ip");

    try {
        connection = new WebSocket("ws://" + ip_input.innerText);
    }
    catch (err) {
        //not a valid url
        ip_input.innerText = "localhost:3000";
        return;
    }

    // Log errors
    connection.onerror = function (error) {
        addMessage("WebLogger", "WebSocket error");
        disconnect();
        ip_input.innerText = "localhost:3000";
    };

    connection.onclose = function (event) {
        addMessage("WebLogger", "WebSocket connection closed");
    }

    connection.onopen = function (event) {
        addMessage("WebLogger", "WebSocket connection opened");
    }

    // Log messages from the server
    connection.onmessage = function (e) {
        var first = e.data.indexOf("|");
        var second = e.data.indexOf("|", first + 1);

        var time = e.data.substring(0, first);
        var lvl = e.data.substring(first + 1, second);
        var msg = e.data.substring(second + 1);

        addMessage(lvl, msg, parseInt(time));
    };

    document.getElementById("menu_toggleConnect").classList.add("active");
    document.getElementById("menu_toggleConnect").innerText = "Disconnect";
}


function toggleConnect() {
    if (connection == null)
        connect();
    else
        disconnect();
}

function ipInput(event)
{
    if (event.which == 13) {
        event.preventDefault();
        if (connection != null)
            disconnect();
        connect();
    }
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function logRandom() {
    var lvl = ["Test", "Warnung", "Info", "Fehler"];
    var msg = ["Irgendeine Nachricht", "Dieser Text hat keine Bedeutung", "Huhu!", "PEEEENIS!"];

    for (var i = 0; i < 10; i++) {

        addMessage(lvl[getRandomInt(0, 3)], msg[getRandomInt(0, 3)]);
    }
}