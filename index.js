const express = require("express");
const upload = require("multer")();
const bodyParser = require("body-parser");
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

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/get-data-siswa/:nisn", upload.none(), (req, res) => {
  const { nisn } = req.params;
  db.query(`SELECT * FROM siswa WHERE nisn=${nisn}`, (err, result) => {
    if (err) res.json(err);
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
  const { namaLengkap, NIS, NIS2, NISN, jurusan, tempatLahir, tglLahir, blnLahir, thnLahir, alamat } = req.body;
  // prettier-ignore
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
  // prettier-ignore
  fs.renameSync(`./${data.tmpfoto.path.replace("\\", "/")}`, `./${data.tmpfoto.path.replace("\\", "/")}.jpeg`);
  const foto = data.tmpfoto.filename + ".jpeg";
  res.render("kartu", { data, foto });
});

app.get("/:jurusan", (req, res) => {
  const { jurusan } = req.params;
  db.query(`SELECT * FROM siswa WHERE kelas='${jurusan}'`, (err, result) => {
    if (err) res.json(err);
    res.render("data", { result });
  });
});

app.get("/form/:jurusan", (req, res) => {
  const { jurusan } = req.params;
  res.render("form", { jurusan });
});

// prettier-ignore
app.post("/form/:jurusan/add", upload.single("fileFoto"), (req, res) => {
  const { jurusan } = req.params;
  const fileFoto = req.file;
  const { namaLengkap, NIS, NIS2, NISN, komp_keahlian, tempatLahir, tglLahir, blnLahir, thnLahir, alamat } = req.body;
  const ttl = `${tempatLahir}, ${tglLahir} ${blnLahir} ${thnLahir}`;
  const fileBlob = fileFoto.buffer;
  const fileName = fileFoto.originalname;
  const foto = `/uploads/${jurusan}/${fileName}`
  if (!fs.existsSync(`./uploads/${jurusan}`)) fs.mkdirSync(`./uploads/${jurusan}`);
  fs.writeFileSync(`./uploads/${jurusan}/${fileName}`, fileBlob);
  db.query(`INSERT INTO siswa(kelas, nama, nis, absen, nisn, komp_keahlian, ttl, alamat, foto) VALUES('${jurusan}', '${namaLengkap}', '${NIS}', '${NIS2}', '${NISN}', '${komp_keahlian}', '${ttl}', '${alamat}', '${foto}')`, (err, result, field) => {
    if (err) res.json(`Error : ${err}`);
    res.json("Success!");
  });
});

// prettier-ignore
app.get("/:jurusan/get/:nisn", (req, res) => {
  const { jurusan, nisn } = req.params;
  db.query(`SELECT * FROM siswa WHERE kelas='${jurusan}' AND nisn='${nisn}'`, (err, result) => {
    if (err) res.json("Something went wrong!");
    if (!result.length) return res.status(404).json("Not Found!");
    res.json(result);
  });
});

app.post("/form/:jurusan/upd/:id", (req, res) => {
  const { jurusan } = req.params;
});

app.post("/form/:jurusan/del/:id", (req, res) => {
  const jurusan = req.params;
  res.json(jurusan);
});

app.listen("3000", console.log("localhost:3000"));
