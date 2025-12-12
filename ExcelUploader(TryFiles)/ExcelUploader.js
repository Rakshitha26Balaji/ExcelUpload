import React, { useState } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import {
  Button,
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Chip,
  Stack,
} from "@mui/material";

// Simple client-side validators (mirror server-side)
const validateRowClient = (row) => {
  const errors = [];

  const name = (row.Name ?? row.name ?? "").toString().trim();
  const email = (row.Email ?? row.email ?? "").toString().trim();
  const phone = (row.Phone ?? row.phone ?? "").toString().trim();
  const ageRaw = row.Age ?? row.age ?? "";
  const age = ageRaw === "" || ageRaw == null ? null : Number(ageRaw);

  if (!name) errors.push("Name is required");
  if (!email) errors.push("Email is required");
  else {
    // simple email regex (client-side)
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email)) errors.push("Invalid email format");
  }

  if (phone) {
    const phoneRe = /^[0-9+\-\s()]*$/;
    if (!phoneRe.test(phone)) errors.push("Phone contains invalid characters");
    if (phone.replace(/\D/g, "").length < 7) errors.push("Phone looks too short");
  }

  if (age != null && !Number.isInteger(age)) errors.push("Age must be an integer");
  if (age != null && (age < 0 || age > 150)) errors.push("Age must be between 0 and 150");

  return errors;
};

export default function ExcelUploader() {
  const [excelData, setExcelData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rowValidation, setRowValidation] = useState([]); // [{rowIndex, valid, errors}]
  const [apiResult, setApiResult] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      setExcelData(jsonData);
      setColumns(Object.keys(jsonData[0] || {}));

      // run client-side validation
      const validations = jsonData.map((r, idx) => {
        const errors = validateRowClient(r);
        return { rowIndex: idx, valid: errors.length === 0, errors };
      });
      setRowValidation(validations);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleUploadToDB = async (uploadOnlyValid = true) => {
    if (excelData.length === 0) {
      alert("No file loaded");
      return;
    }

    const validations = rowValidation.length ? rowValidation : excelData.map((r, idx) => {
      const errors = validateRowClient(r);
      return { rowIndex: idx, valid: errors.length === 0, errors };
    });

    const rowsToSend = uploadOnlyValid
      ? excelData.filter((_, idx) => validations[idx] && validations[idx].valid)
      : excelData;

    if (rowsToSend.length === 0) {
      alert("No valid rows to upload. Fix errors first.");
      return;
    }

    setLoading(true);
    setApiResult(null);

    try {
      const resp = await axios.post("http://localhost:5000/api/upload-excel", { rows: rowsToSend }, { timeout: 120000 });
      setApiResult(resp.data);
      // If server returns per-row validation for original set, merge it (server expects original rows; but we sent filtered rows)
      alert(`Uploaded ${resp.data.inserted || 0} rows successfully`);
    } catch (err) {
      console.error(err);
      alert("Upload failed. Check console for details.");
      if (err.response && err.response.data) setApiResult(err.response.data);
    } finally {
      setLoading(false);
    }
  };

  const invalidCount = rowValidation.filter((r) => !r.valid).length;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Excel Upload — Preview & Validation
      </Typography>

      <input id="excelInput" type="file" accept=".xlsx,.xls" style={{ display: "none" }} onChange={handleFileUpload} />
      <label htmlFor="excelInput">
        <Button variant="contained" component="span">Choose Excel File</Button>
      </label>

      <Button
        variant="outlined"
        sx={{ ml: 2 }}
        onClick={() => handleUploadToDB(true)}
        disabled={loading}
      >
        {loading ? <CircularProgress size={18} /> : "Upload Valid Rows"}
      </Button>

      <Button
        variant="text"
        sx={{ ml: 1 }}
        onClick={() => handleUploadToDB(false)}
        disabled={loading}
      >
        {loading ? "Uploading..." : "Upload All Rows (attempt)"}
      </Button>

      <Typography sx={{ mt: 1 }}>
        {excelData.length > 0 ? `${excelData.length} rows loaded — ${invalidCount} invalid` : "No file loaded"}
      </Typography>

      {excelData.length > 0 && (
        <Paper sx={{ mt: 3, p: 2 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Preview</Typography>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>#</TableCell>
                  {columns.map((c, i) => <TableCell key={i} sx={{ fontWeight: "bold" }}>{c}</TableCell>)}
                  <TableCell sx={{ fontWeight: "bold" }}>Validation</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {excelData.map((row, rIdx) => {
                  const v = rowValidation[rIdx] || { valid: true, errors: [] };
                  return (
                    <TableRow key={rIdx} hover>
                      <TableCell>{rIdx + 1}</TableCell>
                      {columns.map((col, ci) => <TableCell key={ci}>{String(row[col] ?? "")}</TableCell>)}
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          {v.valid ? <Chip label="OK" size="small" /> : <Chip label={`${v.errors.length} error(s)`} color="error" size="small" />}
                          {!v.valid && (
                            <div>
                              {v.errors.map((err, i) => (
                                <Typography variant="caption" display="block" key={i} sx={{ color: "error.main" }}>
                                  • {err}
                                </Typography>
                              ))}
                            </div>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {apiResult && (
        <Paper sx={{ mt: 2, p: 2 }}>
          <Typography variant="subtitle1">API Result</Typography>
          <pre style={{ whiteSpace: "pre-wrap", maxHeight: 260, overflow: "auto" }}>
            {JSON.stringify(apiResult, null, 2)}
          </pre>
        </Paper>
      )}
    </Box>
  );
}
