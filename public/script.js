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
    const target = $("#account").val();
    const amount = $("#amount").val();
    const buffer = $("#flexSwitchCheck").prop("checked");
    if (!account) {
        alert("โปรดใส่บัญชีปลายทาง")
        return;
    }
    if (!amount) {
        alert("โปรดใส่จำนวนเงิน")
        return;
    }
    console.log(account, amount, buffer)

    window.location.href = `/success/${id}?target=${target}&amount=${amount}&buffer=${buffer}`;
}