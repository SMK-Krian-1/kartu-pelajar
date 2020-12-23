const express = require("express");
const upload = require("multer")();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const hbs = require("hbs");
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const app = express();
const { expressConf } = require("./config.js");
const exists = fs.existsSync("./data_kartu.db");
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./data_kartu.db");

db.serialize(() => {
  if (!exists) {
    db.run(
      "CREATE TABLE siswa(nama TEXT, nis TEXT, absen TEXT, nisn TEXT, kelas TEXT, komp_keahlian TEXT, ttl TEXT, alamat TEXT, foto TEXT)"
    );
    console.log("Database created!", "Connected to Database!");
  } else {
    console.log("Connected to Database!");
  }
});

// set rendering engine & directory for client
app.set("views", path.join(__dirname, "src/views"));
app.set("view engine", "hbs");

// granting access to folders
app.use("/assets", express.static("assets"));
app.use("/uploads", express.static("uploads"));

// parsing form data from client-side
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// parsing cookies from client-side
app.use(cookieParser());

app.get("/db", (req, res) => {
  db.all("SELECT * FROM siswa", (e, r) => {
    res.json(r);
  });
});

/*
 * INDEX ROUTE
 * Rendered when client visited root of the webpage
 */
app.get("/", (req, res) => {
  let adminAccess;
  const login = req.cookies.login;
  const currentToken = fs.readFileSync("./TOKEN.txt", "utf-8");
  const token = req.cookies.token;
  if (typeof login == "undefined") adminAccess = false;
  if (typeof token == "undefined" || token !== currentToken)
    return res.redirect("/login");
  else adminAccess = true;
  const availableClass = fs.readFileSync("./class.json");
  res.render("index", {
    availableClass: JSON.parse(availableClass),
    adminAccess,
  });
});

/*
 * Show data form for student
 * @PARAMS kelas:STRING:xrpl1
 */
app.get("/form/:kelas", (req, res) => {
  const currentToken = fs.readFileSync("./TOKEN.txt", "utf-8");
  const token = req.cookies.token;
  if (typeof token == "undefined" || token !== currentToken)
    return res.redirect("/login");
  let komp_keahlian;
  const { kelas } = req.params;
  if (kelas.includes("tpm")) komp_keahlian = "Teknik Pemesinan";
  if (kelas.includes("titl")) komp_keahlian = "Teknik Instalasi Tenaga Listrik";
  if (kelas.includes("rpl")) komp_keahlian = "Rekayasa Perangkat Lunak";
  if (kelas.includes("las")) komp_keahlian = "Teknik Pengelasan";
  res.render("form", { kelas, komp_keahlian });
});

/*
 * VALIDATE/CLASS
 * Will get class parameter and pass class data to client as table
 * @PARAMS kelas:STRING:xrpl1
 */
app.get("/validate/:kelas", (req, res) => {
  const currentToken = fs.readFileSync("./TOKEN.txt", "utf-8");
  const token = req.cookies.token;
  if (typeof token == "undefined" || token !== currentToken) return res.redirect("/login");
  let komp_keahlian;
  const { kelas } = req.params;
  if (kelas.includes("tpm")) komp_keahlian = "Teknik Pemesinan";
  if (kelas.includes("titl")) komp_keahlian = "Teknik Instalasi Tenaga Listrik";
  if (kelas.includes("rpl")) komp_keahlian = "Rekayasa Perangkat Lunak";
  if (kelas.includes("las")) komp_keahlian = "Teknik Pengelasan";
  db.all(`SELECT * FROM siswa WHERE kelas='${kelas}'`, (err, result) => {
    if (err) res.json(err);
    if (!fs.existsSync(`./uploads/${kelas}/`))
      return res.render("validasi", { result, kelas, komp_keahlian, showFoto: false });
    const foto = fs.readdirSync(`./uploads/${kelas}/`);
    res.render("validasi", {
      result,
      komp_keahlian,
      kelas,
      showFoto: true,
      foto,
    });
  });
});

/*
 * TOKEN FORM
 * Will be pushed if client has no cookies
 */
app.get("/login", (req, res) => {
  const currentToken = fs.readFileSync("./TOKEN.txt", "utf-8");
  const token = req.cookies.token;
  if (token === currentToken) return res.redirect("/");
  res.render("login");
});

/*
 * SUBMITING TOKEN
 * Will be pushed when client logging in
 */
app.post("/loginAdmin", upload.none(), (req, res, next) => {
  const currentToken = fs.readFileSync("./TOKEN.txt", "utf-8");
  if (req.body.token !== currentToken) return res.json({ granted: false });
  res.cookie("token", currentToken, { maxAge: 300000 }).json({ granted: true });
});

/*
 * Show student data in table
 * @PARAMS kelas:STRING:xrpl1
 */
app.get("/:kelas", (req, res) => {
  const currentToken = fs.readFileSync("./TOKEN.txt", "utf-8");
  const token = req.cookies.token;
  if (typeof token == "undefined" || token !== currentToken)
    return res.redirect("/login");
  const { kelas } = req.params;
  db.all(`SELECT * FROM siswa WHERE kelas='${kelas}'`, (err, result) => {
    if (err) res.json(err);
    res.render("data", { result, kelas });
  });
});

/*
 * Print out single user
 * @PARAMS kelas:STRING:xrpl1
 * @PARAMS nisn:NUMBER:0123456789
 */
// prettier-ignore
app.get("/:kelas/get/:nisn", (req, res) => {
  const currentToken = fs.readFileSync("./TOKEN.txt", "utf-8");
  const token = req.cookies.token;
  if (typeof token == "undefined" || token !== currentToken)
    return res.redirect("/login");
  const { kelas, nisn } = req.params;
  db.all(`SELECT * FROM siswa WHERE kelas='${kelas}' AND nisn='${nisn}'`, (err, result) => {
    if (err) res.json("Something went wrong!");
    if (!result.length) return res.status(404).json("Not Found!");
    res.json(result);
  });
});

/*
 * Print out single user
 * @PARAMS kelas:STRING:xrpl1
 * @PARAMS nisn:NUMBER:0123456789
 */
// prettier-ignore
app.post("/:kelas/get/:nisn", (req, res) => {
  const currentToken = fs.readFileSync("./TOKEN.txt", "utf-8");
  const token = req.cookies.token;
  if (typeof token == "undefined" || token !== currentToken)
    return res.redirect("/login");
  const { kelas, nisn } = req.params;
  db.all(`SELECT * FROM siswa WHERE kelas='${kelas}' AND nisn='${nisn}'`, (err, result) => {
    if (err) res.json("Something went wrong!");
    if (!result.length) return res.status(404).json("Not Found!");
    res.json(result);
  });
});

/*
 * Print out student ID card
 * @PARAMS nisn:NUMBER:0123456789
 */
app.get("/get-data-siswa/:kelas/:nisn", upload.none(), (req, res) => {
  const currentToken = fs.readFileSync("./TOKEN.txt", "utf-8");
  const token = req.cookies.token;
  if (typeof token == "undefined" || token !== currentToken)
    return res.redirect("/login");
  const { kelas, nisn } = req.params;
  db.all(`SELECT * FROM siswa WHERE nisn='${nisn}'`, (err, result) => {
    if (err) res.json(err);
    // prettier-ignore
    const { nama, nis, absen, nisn, komp_keahlian, ttl, alamat, foto } = result[0];
    if (!foto.length) return res.send("FOTO BELUM DI ISI!");
    // prettier-ignore
    const programKeahlian = komp_keahlian == "Rekayasa Perangkat Lunak" ? "Teknik Informatika dan Komputer" : "Teknologi dan Rekayasa";
    // prettier-ignore
    const data = { nama, nis, absen, nisn, komp_keahlian, programKeahlian, ttl, alamat, foto };
    res.render("hasil", { data, kelas });
  });
});

/*
 * CETAK LOGIN
 * Validate username & password then grants specific functionality
 */
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username !== "shd" || password !== "shd") granted = false;
  else granted = true;
  res.cookie("login", true, { maxAge: 300000 }).json({ granted });
});

/*
 * Add new student data to database
 * @PARAMS kelas:STRING:xrpl1
 */
// prettier-ignore
app.post("/form/:kelas/add", upload.none(), (req, res) => {
  const currentToken = fs.readFileSync("./TOKEN.txt", "utf-8");
  const token = req.cookies.token;
  if (typeof token == "undefined" || token !== currentToken)
    return res.redirect("/login");
  const { kelas } = req.params;
  const { namaLengkap, NIS, NISN, komp_keahlian, tempatLahir, tglLahir, blnLahir, thnLahir, alamat } = req.body;
  const ttl = `${tempatLahir}, ${tglLahir} ${blnLahir} ${thnLahir}`;
  db.all(`INSERT INTO siswa(kelas, nama, nis, nisn, komp_keahlian, ttl, alamat) VALUES('${kelas}', '${namaLengkap}', '${NIS}', '${NISN}', '${komp_keahlian}', '${ttl}', '${alamat}')`, (err, result, field) => {
    if (err) res.json(`Error : ${err}`);
    res.redirect(`/form/${kelas}?show=true&msg=Berhasil menambah data!`);
  });
});

// TODOS
app.post("/form/:kelas/del/:id", (req, res) => {
  const kelas = req.params;
  res.json(kelas);
});

app.post("/validate/:nisn", (req, res) => {
  const { nisn } = req.params;
  const { nama, NIS, NIS2, NISN, ttl, alamat, foto } = req.body;
  db.all(
    `UPDATE siswa SET nama='${nama}', nis='${NIS}', absen='${NIS2}', nisn='${NISN}', ttl='${ttl}', alamat='${alamat}', foto='${foto}' WHERE nisn='${NISN}'`,
    (err, result, field) => {
      res.send("Success!");
    }
  );
});

app.post("/generate-kartu", upload.none(), (req, res) => {
  const { nisn } = req.body;
  res.json({ nisn });
});

app.listen(expressConf.port, expressConf.host, () => {
  // prettier-ignore
  console.log(chalk.black.bgGreen(`App is listening on ${expressConf.host}:${expressConf.port}`));
});
