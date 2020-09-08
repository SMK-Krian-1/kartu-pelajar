const express = require("express");
const upload = require("multer")();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const hbs = require("hbs");
const fs = require("fs");
const path = require("path");
const sql = require("mysql");
const app = express();
const db = sql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "data_kartu",
});
db.connect((err) => {
  if (err) return console.error(`MySQL connection failed : ${err}`);
  console.log(`MySQL successfully connected!`);
});

app.set("views", path.join(__dirname, "src/views"));
app.set("view engine", "hbs");
app.use("/assets", express.static("assets"));
app.use("/uploads", express.static("uploads"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

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

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username !== "shd" && password !== "shd") granted = false;
  else granted = true;
  res.cookie("login", true).json({ granted });
});

app.get("/get-data-siswa/:nisn", upload.none(), (req, res) => {
  const { nisn } = req.params;
  db.query(`SELECT * FROM siswa WHERE nisn=${nisn}`, (err, result) => {
    if (err) res.json(err);
    // prettier-ignore
    const { nama, nis, absen, nisn, komp_keahlian, ttl, alamat, foto } = result[0];
    // prettier-ignore
    const programKeahlian = komp_keahlian == "Rekayasa Perangkat Lunak" ? "Teknik Informatika dan Komputer" : "Teknologi dan Rekayasa";
    // prettier-ignore
    const data = { nama, nis, absen, nisn, komp_keahlian, programKeahlian, ttl, alamat, foto };
    res.render("hasil", { data });
  });
});

app.post("/generate-kartu", upload.none(), (req, res) => {
  const { nisn } = req.body;
  res.json({ nisn });
});

app.post("/post-data", upload.single("fileFoto"), (req, res) => {
  // prettier-ignore
  const { namaLengkap, NIS, NIS2, NISN, kelas, tempatLahir, tglLahir, blnLahir, thnLahir, alamat } = req.body;
  // prettier-ignore
  const programKeahlian = kelas == "Rekayasa Perangkat Lunak" ? "Teknik Informatika dan Komputer" : "Teknologi dan Rekayasa";
  const data = {
    nama: namaLengkap.toUpperCase(),
    nomorInduk: `${NIS}/${NIS2} - ${NISN}`,
    programKeahlian,
    kompetensiKeahlian: kelas,
    ttl: `${tempatLahir}, ${tglLahir} ${blnLahir} ${thnLahir}`,
    tmpfoto: req.file,
    alamat,
  };
  console.log(data);
  // prettier-ignore
  fs.renameSync(`./${data.tmpfoto.path.replace("\\", "/")}`, `./${data.tmpfoto.path.replace("\\", "/")}.jpeg`);
  const foto = data.tmpfoto.filename + ".jpeg";
  res.render("kartu", { data, foto });
});

app.get("/:kelas", (req, res) => {
  const { kelas } = req.params;
  db.query(`SELECT * FROM siswa WHERE kelas='${kelas}'`, (err, result) => {
    if (err) res.json(err);
    res.render("data", { result, kelas });
  });
});

app.get("/form/:kelas", (req, res) => {
  let komp_keahlian;
  const { kelas } = req.params;
  if (kelas.includes("tpm")) komp_keahlian = "Teknik Pemesinan";
  if (kelas.includes("titl")) komp_keahlian = "Teknik Instalasi Tenaga Listrik";
  if (kelas.includes("rpl")) komp_keahlian = "Rekayasa Perangkat Lunak";
  if (kelas.includes("las")) komp_keahlian = "Teknik Pengelasan";
  res.render("form", { kelas, komp_keahlian });
});

// prettier-ignore
app.post("/form/:kelas/add", upload.single("fileFoto"), (req, res) => {
  const { kelas } = req.params;
  const fileFoto = req.file;
  const { namaLengkap, NIS, NIS2, NISN, komp_keahlian, tempatLahir, tglLahir, blnLahir, thnLahir, alamat } = req.body;
  const ttl = `${tempatLahir}, ${tglLahir} ${blnLahir} ${thnLahir}`;
  const fileBlob = fileFoto.buffer;
  const fileName = fileFoto.originalname;
  const foto = `/uploads/${kelas}/${fileName}`
  if (!fs.existsSync(`./uploads/${kelas}`)) fs.mkdirSync(`./uploads/${kelas}`);
  fs.writeFileSync(`./uploads/${kelas}/${fileName}`, fileBlob);
  db.query(`INSERT INTO siswa(kelas, nama, nis, absen, nisn, komp_keahlian, ttl, alamat, foto) VALUES('${kelas}', '${namaLengkap}', '${NIS}', '${NIS2}', '${NISN}', '${komp_keahlian}', '${ttl}', '${alamat}', '${foto}')`, (err, result, field) => {
    if (err) res.json(`Error : ${err}`);
    res.json("Success!");
  });
});

// prettier-ignore
app.get("/:kelas/get/:nisn", (req, res) => {
  const { kelas, nisn } = req.params;
  db.query(`SELECT * FROM siswa WHERE kelas='${kelas}' AND nisn='${nisn}'`, (err, result) => {
    if (err) res.json("Something went wrong!");
    if (!result.length) return res.status(404).json("Not Found!");
    res.json(result);
  });
});

app.post("/form/:kelas/upd/:id", (req, res) => {
  const { kelas } = req.params;
});

app.post("/form/:kelas/del/:id", (req, res) => {
  const kelas = req.params;
  res.json(kelas);
});

app.listen("3000", console.log("localhost:3000"));
