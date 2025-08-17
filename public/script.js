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
    const target = $("#myDropdown").val();
    if (process === "scan" && !target){
        alert("โปรดใส่บัญชีปลายทาง");
        return;
    }
      window.location.href = `/transfer/${id}?target=${target}&process=${process}`;
}
async function successPage() {
 var data;
 var amount = $("#amount").val();
 const target = $("#myDropdown").val();
 const buffer = $("#flexSwitchCheck").prop("checked");
 const forced = ($("#hidden").text() === "forced");
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
  window.location.href = `/success/${id}?target=${target}&amount=${amount}&buffer=${buffer}&forced=${forced}`;
}
function bufferState(whiteList, process, amount, cfr){
    if (cfr && whiteList) return "depend"
    else if (cfr && !whiteList) return "open"
    else if (!cfr && whiteList) return  "close"
    else{
      if (process === "scan") {
        if (amount >= 50000) {
          return "depend";
        } else {
          return "close";
        }
      } else {
        if (amount >= 50000) {
          return "open";
        } else {
          return "depend";
        }
      }
    }
}
function bufferDetail(index){
    window.location.href = `/buffer/${id}/${index}`;
}
async function vertifyTransfer(index){
    if (confirm("กดตกลงเพื่อยืนยันว่าเงินจะเข้าบัญชีปลายทางทันที")){
          try {
            const response = await fetch(
              `/update/${id}/${index}`,
              {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  targetIndex: account[id - 1].buffer[index].bufferId,
                  targetId: account[id - 1].buffer[index].target
                })
              }
            );
            const data = await response.json();
            console.log("Updated (PATCH):", data);
          } catch (error) {
            console.error("Error:", error);
          }

    }
    window.location.href = `/buffer/${id}`;
}
function abortTransfer(index){
    if (confirm("คุณต้องการขอคืนใช่ไหม โปรดยื่นหลักฐานเพื่อใช้ประกอบการพิจารณา")){
        
    }
}