import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import session from "express-session";
import pool from './src/config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3008;

// Setup session
app.use(
  session({
    secret: "rahasia-super-aman",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 5,
    },
  })
);

// Middleware
app.use(express.urlencoded({ extended: true }));1
app.use(express.static("image"));
app.use(express.static('public'));

app.use(express.urlencoded({ extended: true }));


// static folder untuk hasil upload
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));
app.use("/asset", express.static(path.join(__dirname, "src", "asset")));

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

app.get("/login", (req, res) => { 
  res.render("login");
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.post("/add-project", upload.single("image"), addProject);

//Route untuk halaman login ke form
 app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE username = $1 AND password = $2",
      [username, password]
    );

    if (result.rows.length > 0) {
      // Simpan session user
      req.session.user = {
        id: result.rows[0].id,
        username: result.rows[0].username
      };

      console.log("User login:", req.session.user);
      res.redirect("/form"); // setelah login sukses
    } else {
      res.render("login", { error: "Username atau password salah" });
    }

  } catch (err) {
    console.error("Error login:", err);
    res.status(500).send("Terjadi kesalahan server");
  }
});


// Contoh route untuk test koneksi database
app.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM project');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Database query error');
  }
});

//ROUTE untuk POST untuk menyimpan data Register
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2)',
      [username, password]
    );
    res.redirect('/login'); // Arahkan ke login setelah register sukses
  } catch (err) {
    console.error(err);
    res.status(500).send('Register gagal');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});


app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
