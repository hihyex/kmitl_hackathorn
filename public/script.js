var page = "mainPage";
var id;
var targetId;
if (document.body.dataset.deviceId) {
    id = document.body.dataset.deviceId;
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
function transfer(process) {
    var target;
    if (document.body.dataset.deviceId2) {
        target = document.body.dataset.deviceId2;
    }
    window.location.href = `/transfer/${id}?target=${target}&process=${process}`;
}
async function successPage() {
 var data;
 var amount = $("#amount").val();
 const target = $("#myDropdown").val();
 const buffer = $("#flexSwitchCheck").prop("checked");
 amount = Number(amount)
 if (!target) {
   alert("โปรดใส่บัญชีปลายทาง");
   return;
 }
 if (isNaN(amount) || amount <= 0){
    alert("โปรดกรอกจำนวนเงิน")
    return;
 }
  try {
    var response = await fetch(`/amount/${id}`);
    if (!response.ok) throw new Error("network error");
    data = await response.json();
  } catch (error) {
    console.error(error);
  }
  if (Number(amount) > Number(data.amount)){
      alert("เงินของคุณไม่เพียงพอ")
      return;
  }
  window.location.href = `/success/${id}?target=${target}&amount=${amount}&buffer=${buffer}`;
}
function bufferState(whiteList, process, amount, cfr){
    if (cfr) return "open"
    if (whiteList){
        return "close"
    }
    if (process === "scan"){
        if (amount >= 50000){
            return "depend"
        }
        else {
            return "close"
        }
    }
    else{
        if (amount >= 50000){
            return "open"
        }
        else{
            return "depend"
        }
    }
}
function bufferDetail(index){
    window.location.href = `/buffer/${id}/${index}`;
}