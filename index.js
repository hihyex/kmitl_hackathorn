import express from "express";

const app = express();
const port = 3000;
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
var account = [
  {
    username: "0000",
    amount: 1000000,
  },
];
var lastPerson = 0;
app.get("/", (req, res) => {
  const newAccount = {
    username: lastPerson,
    amount: 1000000,
  };
  res.render("index.ejs", {
    content: account[lastPerson],
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
