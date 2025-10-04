import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3008;

// Middleware
app.use(express.urlencoded({ extended: true }));

app.use(express.static("image"));
app.use(express.static('public'));

// static folder untuk hasil upload
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));

app.use("/asset", express.static(path.join(__dirname, "src", "asset")));

let projects = [];

// Konfigurasi penyimpanan gambar memakai multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // simpan dengan timestamp
  },
});

const upload = multer({ storage: storage });

// Fungsi addProject
const addProject = (req, res) => {
  try {
    const { name, startDate, endDate, description } = req.body;
    let technologies = req.body.technologies || "";

    if (Array.isArray(technologies)) {
      technologies = technologies.join(", ");
    }

    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const project = {
      id: Date.now(),
      project_name: name,
      start_date: startDate,
      end_date: endDate,
      description,
      technologies,
      image,
    };

    // Simpan ke array
    projects.push(project);
    console.log("Project tersimpan:", project);

    // render ulang form dengan data terbaru
    res.redirect("/form");
  } catch (error) {
    console.error("Gagal simpan project:", error.message);
    res.status(500).send("Terjadi kesalahan saat menambahkan project");
  }
};

// Set view engine
app.set("view engine", "hbs");
app.set("views", "src/views");

// Routing
app.get("/", (req, res) => {
  res.render("index", { projects });
});

app.get("/form", (req, res) => {
  res.render("form", { projects });
});

app.post("/add-project", upload.single("image"), addProject);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
