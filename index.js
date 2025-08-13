import express from "express";
import QRCode from "qrcode";

const app = express();
const port = process.env.PORT || 3000;
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs"); 
var account = [{
  id: 1,
  amount: 1000000,
  bufferAmount: 0,
  buffer: [],
  cfr: false,
  username: "Admin"
}];
      const monthShortTH = {
        1: "ม.ค.",
        2: "ก.พ.",
        3: "มี.ค.",
        4: "เม.ย.",
        5: "พ.ค.",
        6: "มิ.ย.",
        7: "ก.ค.",
        8: "ส.ค.",
        9: "ก.ย.",
        10: "ต.ค.",
        11: "พ.ย.",
        12: "ธ.ค.",
      };
var whiteList = [];
var lastId = 2;
var buf = 1;
var usernameList = ["Admin"];
setInterval(() => {
  const now = new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" });
  for(var i=0; i<account.length; i++){
    const self = account[i];
    for(var j=0; j<self.buffer.length; j++){
      var b = Number(self.buffer[j].amount);
      if (now >= self.buffer[j].due){
        if (self.buffer[j].status == "pending"){
          if (self.buffer[j].next === "abort"){
              self.buffer[j].status = "abort";
            if (self.buffer[j].type === "in"){
              self.bufferAmount -= b;
            }
            else {
              self.amount += b;
            }
          }
          else{
            self.buffer[j].status = "success";
            if (self.buffer[j].type == "in"){
              self.bufferAmount -= b;
              self.amount += b;
            }
          }
        }
      }
    }
  }
}, 500);

app.get("/", (req, res) => {
  res.render("logging.ejs");
});
app.post("/mainpage", (req, res) => {
  const username = req.body.username;
  var index = usernameList.findIndex((item) => item === username)
  if (index === -1){
    const cfr = (lastId % 3 === 1);
    const now = new Date();
    now.setTime(now.getTime() + 10 * 1000);
    const newAccount = {
      id: lastId,
      amount: 1000000,
      bufferAmount: 0,
      buffer: [
        {
          type: "out",
          amount: 300,
          to: 0,
          time: new Date().toLocaleString("th-TH", {
            timeZone: "Asia/Bangkok",
          }),
          due: now.toLocaleString("th-TH", { timeZone: "Asia/Bangkok" }),
          status: "pending",
          next: "success",
        },
        {
          type: "in",
          amount: 500,
          from: 0,
          time: new Date().toLocaleString("th-TH", {
            timeZone: "Asia/Bangkok",
          }),
          due: now.toLocaleString("th-TH", { timeZone: "Asia/Bangkok" }),
          status: "pending",
          next: "success",
        },
        {
          type: "in",
          amount: 500,
          from: 0,
          time: new Date().toLocaleString("th-TH", {
            timeZone: "Asia/Bangkok",
          }),
          due: now.toLocaleString("th-TH", { timeZone: "Asia/Bangkok" }),
          status: "abort",
          next: "success",
        },
        {
          type: "out",
          amount: 300,
          to: 0,
          time: new Date().toLocaleString("th-TH", {
            timeZone: "Asia/Bangkok",
          }),
          due: now.toLocaleString("th-TH", { timeZone: "Asia/Bangkok" }),
          status: "success",
          next: "success",
        },
        {
          type: "out",
          amount: 300,
          to: 0,
          time: new Date().toLocaleString("th-TH", {
            timeZone: "Asia/Bangkok",
          }),
          due: now.toLocaleString("th-TH", { timeZone: "Asia/Bangkok" }),
          status: "pending",
          next: "success",
        },
        {
          type: "out",
          amount: 300,
          to: 0,
          time: new Date().toLocaleString("th-TH", {
            timeZone: "Asia/Bangkok",
          }),
          due: now.toLocaleString("th-TH", { timeZone: "Asia/Bangkok" }),
          status: "success",
          next: "success",
        },
      ],
      cfr: cfr,
      username: username,
    };
    if (lastId % 3 === 2){
      whiteList.push(lastId)
    }
    usernameList.push(username);
    account.push(newAccount);
    index = lastId - 1
  }
  res.render("index.ejs", {
    content: account[index],
    id: index + 1,
    username: username
  });

  lastId++;
})
app.get("/mainpage/:id", (req, res) => {
  const { id } = req.params;
  res.render("index.ejs", {
    content: account[id-1],
    id: id,
  });
});
app.get("/buffer/:id", (req, res) => {
  const { id } = req.params;
  res.render("buffer.ejs", {
    content: account[id-1],
    id: id
  });
});
app.get("/scan/:id", async (req, res) => {
  const { id } = req.params;
  if (account.length > 1) {
    var target = Math.floor(Math.random() * account.length) + 1;
    while (target == id) {
      target = Math.floor(Math.random() * account.length) + 1;
    }
    try {
      const qrCode = await QRCode.toDataURL(
        account[target - 1].id.toString(),
        {
          width: 600,
          margin: 2,
        }
      );
      res.render("scan.ejs", {
        content: account[id - 1],
        qrCodeImg: qrCode,
        target: account[target - 1].id,
        id: id,
      });
    } catch (err) {
      console.error(err);
    }
  } else {
    res.render("scan.ejs", {
      message: "ขออภัยตอนนี้มีผู้ใช้คนเดียว",
      id: id,
    });
    console.error("no selected target");
    return;
  }
});
app.get("/transfer/:id", (req, res) => {
  const { id } = req.params;
  const { target } = req.query;
  const { process } = req.query;
  var cfr = false;
  if (account[target - 1]){
    cfr = account[target - 1].cfr;
  }
  var targetName = "";
  if (!isNaN(target)) targetName = account[target - 1].username;
  res.render("transfer.ejs", {
    content: account[id - 1],
    cfr: cfr,
    target: target,
    targetName: targetName,
    id: id,
    whiteList: whiteList.includes(target),
    process: process,
    usernameList: usernameList,
  });
});
app.get("/success/:id", (req, res) => {
  const { id } = req.params;
  const { target } = req.query;
  const { buffer } = req.query;
  const  amount  = Number(req.query.amount);
  if (buffer === "false") {
    account[id - 1].amount -= amount;
    account[target - 1] .amount += amount
  }
  else{
    const now = new Date();
    now.setTime(now.getTime() + 10 * 1000);
    account[id - 1].amount -= amount;
    account[target - 1].bufferAmount += amount;
    var next = (buf % 5 === 0) ? "abort" : "success";
    account[id - 1].buffer.push({
      type: "out",
      amount: amount,
      to: target,
      time: new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" }),
      due: now.toLocaleString("th-TH", { timeZone: "Asia/Bangkok" }),
      status: "pending",
      next: next
    });
    buf++;
    account[target - 1].buffer.push({
      type: "in",
      amount: amount,
      from: id,
      time: new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" }),
      due: now.toLocaleString("th-TH", { timeZone: "Asia/Bangkok" }),
      status: "pending",
      next: next
    });
  }
  res.render("success.ejs", {
    content: account[id - 1],
    id: id,
  });
});
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
