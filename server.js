const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(cors());

app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

// Database
const db = new sqlite3.Database(
    path.join(__dirname, "pixels.db"),
    (err) => {
        if (err) {
            console.error("Could not connect to database", err);
            process.exit(1);
        }

        console.log("Connected to database");

        db.run(`
            CREATE TABLE IF NOT EXISTS pixels (
                x INTEGER,
                y INTEGER,
                color TEXT,
                PRIMARY KEY (x, y)
            )
        `);
    }
);

// -----------------------------
// GET PIXELS
// -----------------------------

app.get("/pixels", (req, res) => {

    db.all(
        "SELECT x, y, color FROM pixels",
        (err, rows) => {

            if (err) {

                return res.status(500).json({
                    error: err.message
                });
            }

            res.json({
                pixels: rows
            });
        }
    );
});


// -----------------------------
// ADD PIXEL
// -----------------------------

app.post("/pixels", (req, res) => {

    const { x, y, color } = req.body;

    db.run(
        `INSERT OR REPLACE INTO pixels (x, y, color)
         VALUES (?, ?, ?)`,
        [x, y, color],

        function (err) {

            if (err) {
                return res.status(500).json({ error: err.message });
            }

            res.json({ success: true });
        }
    );
});



// RESET CANVAS

app.delete("/reset", (req, res) => {

    db.run("DELETE FROM pixels", (err) => {

        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        res.json({
            success: true
        });
    });
});

// -----------------------------
// START SERVER
// -----------------------------

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});


//