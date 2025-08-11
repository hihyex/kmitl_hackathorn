var id = 0; 
var page = "mainPage";
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