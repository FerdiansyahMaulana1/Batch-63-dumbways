import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import pool from './src/config/db.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3008;

// Middleware
app.use(express.urlencoded({ extended: true }));1

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

export const addProject = async (req, res) => {
  try {

    const { name, startDate, endDate, description } = req.body;
    let technologies = req.body.technologies;
    if (!technologies) {
      technologies = "";
    } else if (Array.isArray(technologies)) {
      technologies = technologies.join(", ");
    }

    const image = req.file ? `/uploads/${req.file.filename}` : null;
    console.log('technologies', technologies)
    const queryData = {
      username: name,
      start_date: startDate,
      end_date: endDate,
      description: description,
      technologies: technologies,
      image: image
    }
    console.log('queryData', queryData)
    await pool.query(
      `INSERT INTO project (project_name, start_date, end_date, description, technologies, image)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [queryData.username, queryData.start_date, queryData.end_date, queryData.description, queryData.technologies, queryData.image]
    );

    res.redirect("/form");
  } catch (error) {
    console.log("Request body:", req.body);
    console.log("Request file:", req.file);
    console.error("Gagal insert ke DB:", error.message);
    res.status(500).send("Terjadi kesalahan saat menambahkan project");
  }
};
// Fungsi addProject
// const addProject = (req, res) => {
//   try {
//     const { name, startDate, endDate, description } = req.body;
//     let technologies = req.body.technologies || "";

//     if (Array.isArray(technologies)) {
//       technologies = technologies.join(", ");
//     }

//     const image = req.file ? `/uploads/${req.file.filename}` : null;

//     const project = {
//       id: Date.now(),
//       project_name: name,
//       start_date: startDate,
//       end_date: endDate,
//       description,
//       technologies,
//       image,
//     };

//     // Simpan ke array
//     projects.push(project);
//     console.log("Project tersimpan:", project);

//     // render ulang form dengan data terbaru
//     res.redirect("/form");
//   } catch (error) {
//     console.error("Gagal simpan project:", error.message);
//     res.status(500).send("Terjadi kesalahan saat menambahkan project");
//   }
// };

// Set view engine
app.set("view engine", "hbs");
app.set("views", "src/views");

// Routing
app.get("/form", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM project ORDER BY id DESC");
    res.render("form", { projects: result.rows });
  } catch (err) {
    console.error("Error executing query", err);
    res.status(500).send("Database error");
  }
});


app.get("/", (req, res) => {
  res.render("index");
});

app.post("/add-project", upload.single("image"), addProject);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
