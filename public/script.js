var page = "mainPage";
var id;
var targetId;
if (document.body.dataset.deviceId) {
    id = document.body.dataset.deviceId;
}
function toggleFooter(page) {
    if (page === "mainPage"){
        console.log("main")
        $("#main-page-button").addClass("active");
        $("#buffer-page-button").removeClass("active");
    }
    else if (page === "bufferPage") {
        console.log("buffer")
        $("#main-page-button").removeClass("active");
        $("#buffer-page-button").addClass("active");
    }
}
function mainPage() {
    window.location.href = `/mainpage/${id}`;
}

function bufferPage() {
    window.location.href = `/buffer/${id}`;
}
function scan() {
    window.location.href = `/scan/${id}`;
}
function transfer() {
    var target;
    if (document.body.dataset.deviceId2) {
        target = document.body.dataset.deviceId2;
    }
    window.location.href = `/transfer/${id}?target=${target}`;
}
function successPage() {
    window.location.href = `sucess/${id}`
}