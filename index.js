const express = require("express");
const upload = require("multer")();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const hbs = require("hbs");
const fs = require("fs");
const path = require("path");
const sql = require("mysql");
const chalk = require("chalk");
const app = express();
const { mysqlConf, expressConf } = require("./config.js");
const db = sql.createConnection({
  host: mysqlConf.host,
  user: mysqlConf.user,
  password: mysqlConf.password,
  database: mysqlConf.database,
});
db.connect((err) => {
  if (err) return console.error(chalk.whiteBright.bgRedBright(`MySQL connection failed : ${err}`));
  console.log(chalk.black.bgGreen("MySQL successfully connected!"));
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

/*
 * INDEX ROUTE
 * Rendered when client visited root of the webpage
 */
app.get("/", (req, res) => {
  let adminAccess;
  const login = req.cookies.login;
  if (typeof login == "undefined") adminAccess = false;
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
  let komp_keahlian;
  const { kelas } = req.params;
  if (kelas.includes("tpm")) komp_keahlian = "Teknik Pemesinan";
  if (kelas.includes("titl")) komp_keahlian = "Teknik Instalasi Tenaga Listrik";
  if (kelas.includes("rpl")) komp_keahlian = "Rekayasa Perangkat Lunak";
  if (kelas.includes("las")) komp_keahlian = "Teknik Pengelasan";
  db.query(`SELECT * FROM siswa WHERE kelas='${kelas}'`, (err, result) => {
    if (err) res.json(err);
    if (!fs.existsSync(`./uploads/${kelas}/`)) return res.render("validasi", { result, kelas, showFoto: false });
    const foto = fs.readdirSync(`./uploads/${kelas}/`);
    res.render("validasi", { result, komp_keahlian, kelas, showFoto: true, foto });
  });
});

/*
 * Show student data in table
 * @PARAMS kelas:STRING:xrpl1
 */
app.get("/:kelas", (req, res) => {
  const { kelas } = req.params;
  db.query(`SELECT * FROM siswa WHERE kelas='${kelas}'`, (err, result) => {
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
  const { kelas, nisn } = req.params;
  db.query(`SELECT * FROM siswa WHERE kelas='${kelas}' AND nisn='${nisn}'`, (err, result) => {
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
  const { kelas, nisn } = req.params;
  db.query(`SELECT * FROM siswa WHERE kelas='${kelas}' AND nisn='${nisn}'`, (err, result) => {
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
  const { kelas, nisn } = req.params;
  db.query(`SELECT * FROM siswa WHERE nisn='${nisn}'`, (err, result) => {
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
 * LOGIN
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
  const { kelas } = req.params;
  const { namaLengkap, NIS, NISN, komp_keahlian, tempatLahir, tglLahir, blnLahir, thnLahir, alamat } = req.body;
  const ttl = `${tempatLahir}, ${tglLahir} ${blnLahir} ${thnLahir}`;
  db.query(`INSERT INTO siswa(kelas, nama, nis, nisn, komp_keahlian, ttl, alamat) VALUES('${kelas}', '${namaLengkap}', '${NIS}', '${NISN}', '${komp_keahlian}', '${ttl}', '${alamat}')`, (err, result, field) => {
    if (err) res.json(`Error : ${err}`);
    res.redirect(`/form/${kelas}?show=true&msg=Berhasil menambah data!`);
  });
});

app.post("/form/:kelas/del/:id", (req, res) => {
  const kelas = req.params;
  res.json(kelas);
});

app.post("/validate/:nisn", (req, res) => {
  const { nisn } = req.params;
  const { nama, NIS, NIS2, NISN, ttl, alamat, foto } = req.body;
  db.query(`UPDATE siswa SET nama='${nama}', nis='${NIS}', absen='${NIS2}', nisn='${NISN}', ttl='${ttl}', alamat='${alamat}', foto='${foto}' WHERE nisn='${NISN}'`, (err, result, field) => {
    res.send("Success!");
  });
});

app.post("/generate-kartu", upload.none(), (req, res) => {
  const { nisn } = req.body;
  res.json({ nisn });
});

app.listen(expressConf.port, expressConf.host, () => {
  // prettier-ignore
  console.log(chalk.black.bgGreen(`App is listening on ${expressConf.host}:${expressConf.port}`));
});
