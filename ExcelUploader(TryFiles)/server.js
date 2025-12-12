// server.js (ESM)
import express from "express";
import cors from "cors";
import pkg from "pg";
import Joi from "joi";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // If using self-signed certs in cloud, add ssl config here
});

const app = express();
app.use(cors());
app.use(express.json({ limit: "20mb" }));

// Validation schema using Joi (match Excel template)
const rowSchema = Joi.object({
  Name: Joi.string().trim().min(1).max(200).required(),
  Email: Joi.string().trim().email({ tlds: { allow: false } }).required(),
  Phone: Joi.string().trim().pattern(/^[0-9+\-\s()]*$/).min(7).max(20).allow("", null),
  Age: Joi.number().integer().min(0).max(150).optional().allow(null, ""),
});

// Helper to normalize row keys to match DB columns
const normalizeRow = (row) => ({
  name: row.Name ?? row.name ?? null,
  email: row.Email ?? row.email ?? null,
  phone: row.Phone ?? row.phone ?? null,
  age: row.Age === "" ? null : (row.Age ?? row.age ?? null),
});

app.post("/api/upload-excel", async (req, res) => {
  const { rows } = req.body;
  if (!Array.isArray(rows) || rows.length === 0) {
    return res.status(400).json({ message: "No rows provided" });
  }

  const validationResults = [];
  const validRows = [];

  // Validate each row server-side and collect errors
  rows.forEach((rawRow, idx) => {
    const normalized = {
      Name: rawRow.Name ?? rawRow.name,
      Email: rawRow.Email ?? rawRow.email,
      Phone: rawRow.Phone ?? rawRow.phone,
      Age: rawRow.Age ?? rawRow.age,
    };

    const { error, value } = rowSchema.validate(normalized, { abortEarly: false, convert: true });

    if (error) {
      validationResults.push({
        rowIndex: idx,
        valid: false,
        errors: error.details.map((d) => d.message),
        raw: rawRow,
      });
    } else {
      validationResults.push({
        rowIndex: idx,
        valid: true,
        errors: [],
        raw: rawRow,
      });

      // Normalized for DB
      const nr = normalizeRow(rawRow);
      validRows.push(nr);
    }
  });

  if (validRows.length === 0) {
    return res.status(400).json({
      message: "No valid rows to insert",
      inserted: 0,
      validation: validationResults,
    });
  }

  // Bulk insert validRows in a single transaction
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Build bulk insert dynamically and safely (parameterized)
    // columns: name, email, phone, age
    const textBase = "INSERT INTO contacts (name, email, phone, age) VALUES ";
    const values = [];
    const valuePlaceholders = [];

    validRows.forEach((r, i) => {
      const idx = i * 4;
      valuePlaceholders.push(`($${idx + 1}, $${idx + 2}, $${idx + 3}, $${idx + 4})`);
      values.push(r.name || null, r.email || null, r.phone || null, r.age === "" ? null : r.age);
    });

    const fullQuery = textBase + valuePlaceholders.join(", ") + " RETURNING id, email";

    const insertResult = await client.query(fullQuery, values);

    await client.query("COMMIT");

    return res.json({
      message: "Insert completed",
      inserted: insertResult.rowCount,
      insertedRows: insertResult.rows,
      validation: validationResults,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("DB insert error:", err);

    // Handle unique violation on email (or other integrity errors) by reporting which failed
    // For simplicity, we return a 500 with the error. Frontend will show this.
    return res.status(500).json({
      message: "Database insert failed",
      error: err.message,
      validation: validationResults,
    });
  } finally {
    client.release();
  }
});

// Simple GET to inspect saved rows (for dev)
app.get("/api/get-excel-data", async (req, res) => {
  const result = await pool.query("SELECT id, name, email, phone, age, created_at FROM contacts ORDER BY id DESC LIMIT 200");
  res.json({ total: result.rowCount, data: result.rows });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
