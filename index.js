const express = require("express");
const multer = require("multer");
const bodyParser = require("body-parser");
const hbs = require("hbs");
const fs = require("fs");
const path = require("path");
const sql = require("mysql");
const upload = multer({ dest: "uploads/" });
const app = express();
const db = sql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "data_kartu"
});
db.connect(err => {
  if (err) return console.error(`MySQL connection failed : ${err}`);
  console.log(`MySQL successfully connected!`);
});

app.set("views", path.join(__dirname, "src/views"));
app.set("view engine", "hbs");
app.use("/assets", express.static("assets"));
app.use("/uploads", express.static("uploads"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/post-data", upload.single("fileFoto"), (req, res) => {
  // prettier-ignore
  const { namaLengkap, NIS, NIS2, NISN, jurusan, tempatLahir, tglLahir, blnLahir, thnLahir, alamat } = req.body;
  const programKeahlian = jurusan == "Rekayasa Perangkat Lunak" ? "Teknik Informatika dan Komputer" : "Teknologi dan Rekayasa";
  const data = {
    nama: namaLengkap.toUpperCase(),
    nomorInduk: `${NIS}/${NIS2} - ${NISN}`,
    programKeahlian,
    kompetensiKeahlian: jurusan,
    ttl: `${tempatLahir}, ${tglLahir} ${blnLahir} ${thnLahir}`,
    tmpfoto: req.file,
    alamat,
  };
  fs.renameSync(`./${data.tmpfoto.path.replace("\\", "/")}`, `./${data.tmpfoto.path.replace("\\", "/")}.jpeg`);
  const foto = data.tmpfoto.filename + ".jpeg";
  res.render("kartu", { data, foto });
});

app.get("/:jurusan", (req, res) => {
  res.json("hai");
});

app.get("/form/:jurusan", (req, res) => {
  const { jurusan } = req.params;
  res.render("form", { jurusan });
});

app.post("/form/:jurusan/add", (req, res) => {
  const { jurusan } = req.params;
  const { namaLengkap, NIS, NIS2, NISN, komp_keahlian, tempatLahir, tglLahir, blnLahir, thnLahir, alamat } = req.body;
  console.log(req.body)
  const ttl = `${tempatLahir}, ${tglLahir} ${blnLahir} ${thnLahir}`;
  db.query(`INSERT INTO siswa(kelas, nama, nis, absen, nisn, komp_keahlian, ttl, alamat) VALUES('${jurusan}', '${namaLengkap}', '${NIS}', '${NIS2}', '${NISN}', '${komp_keahlian}', '${ttl}', '${alamat}')`, (err, result, field) => {
    if (err) throw err;
    console.log(result);
    console.log(`new field : ${field}`);
  });
});

app.post("/:jurusan/get/:id", (req, res) => {
  const { jurusan } = req.params;
  
});

app.post("form/:jurusan/upd/:id", (req, res) => {
  const { jurusan } = req.params;
  
});

app.post("form/:jurusan/del/:id", (req, res) => {
  const jurusan = req.params;
  res.json(jurusan)
});

app.listen("3000", console.log("localhost:3000"));
