const express = require("express");
const multer = require("multer");
const bodyParser = require("body-parser");
const hbs = require("hbs");
const fs = require("fs");
const path = require("path");
const upload = multer({ dest: "uploads/" });
const app = express();

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

app.post("/:jurusan/add", (req, res) => {
  const jurusan = req.params;
  res.json(jurusan)
});

app.post("/:jurusan/get/:id", (req, res) => {
  const jurusan = req.params;
  res.json(jurusan)
});

app.post("/:jurusan/upd/:id", (req, res) => {
  const jurusan = req.params;
  res.json(jurusan)
});

app.post("/:jurusan/del/:id", (req, res) => {
  const jurusan = req.params;
  res.json(jurusan)
});

app.listen("3000", console.log("localhost:3000"));
