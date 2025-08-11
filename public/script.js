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
function getCookie(name) {
  const cookies = document.cookie.split(";");
  for (let cookie of cookies) {
    let [key, value] = cookie.trim().split("=");
    if (key === name) return decodeURIComponent(value);
  }
  return null;
}
function mainPage() {
    const id = getCookie("device_id");
    window.location.href = `/mainpage/${id}`;
}

function bufferPage() {
    const id = getCookie("device_id");
    window.location.href = `/buffer/${id}`;
}
function scan() {
    const id = getCookie("device_id");
    window.location.href = `/scan/${id}`;
}
function transfer() {
    const id = getCookie("device_id");
    window.location.href = `/transfer/${id}`;
}