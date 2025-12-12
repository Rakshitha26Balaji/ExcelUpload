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
  LinearProgress,
  Grid,
  IconButton,
} from "@mui/material";
import DownloadIcon from '@mui/icons-material/Download';

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

export default function ExcelUploaderBulk() {
  const [excelData, setExcelData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rowValidation, setRowValidation] = useState([]); // [{rowIndex, valid, errors}]
  const [apiResult, setApiResult] = useState(null);
  const [fileName, setFileName] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0); // 0-100

  const BASE_URL = "http://localhost:5000"; // <-- uses /bulkUpload below
  const BULK_ENDPOINT = `${BASE_URL}/bulkUpload`;

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
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
      setApiResult(null);
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
    setUploadProgress(2);

    try {
      // Send metadata so server can log/file-name etc.
      const payload = {
        meta: {
          fileName,
          totalRows: excelData.length,
          uploadedRows: rowsToSend.length,
          uploadOnlyValid,
        },
        rows: rowsToSend,
      };

      // Note: JSON POSTs don't expose upload progress reliably in browsers.
      // We'll show a simple indeterminate spinner and then a linear progress that moves to 90% when request leaves client.
      setUploadProgress(10);

      const resp = await axios.post(BULK_ENDPOINT, payload, {
        timeout: 120000,
      });

      // If server responds with inserted/failed details, reflect that in UI
      setApiResult(resp.data);

      // animate progress to completion
      setUploadProgress(90);
      setTimeout(() => setUploadProgress(100), 250);

    } catch (err) {
      console.error(err);
      alert("Upload failed. Check console for details.");
      if (err.response && err.response.data) setApiResult(err.response.data);
    } finally {
      setLoading(false);
      setTimeout(() => setUploadProgress(0), 800);
    }
  };

  const invalidCount = rowValidation.filter((r) => !r.valid).length;

  // helper to download failed rows as CSV
  const downloadFailedRows = () => {
    if (!apiResult || !apiResult.failed_rows || apiResult.failed_rows.length === 0) {
      alert("No failed rows to download");
      return;
    }

    const rows = apiResult.failed_rows.map((f) => ({ ...f.row, _errors: (f.errors || []).join('; ') }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "failed");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([buf], { type: "application/octet-stream" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `failed_rows_${fileName || 'upload'}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Excel Bulk Upload — Preview & Validation
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
        {loading ? <CircularProgress size={18} /> : "Upload Valid Rows (bulk)"}
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

      {uploadProgress > 0 && (
        <Box sx={{ width: '100%', mt: 2 }}>
          <LinearProgress variant={uploadProgress < 100 ? 'determinate' : 'determinate'} value={uploadProgress} />
        </Box>
      )}

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
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid item>
              <Typography variant="subtitle1">API Result</Typography>
            </Grid>
            <Grid item>
              <Stack direction="row" spacing={1} alignItems="center">
                {apiResult.failed_rows && apiResult.failed_rows.length > 0 && (
                  <Button startIcon={<DownloadIcon />} onClick={downloadFailedRows}>Download Failed Rows</Button>
                )}
              </Stack>
            </Grid>
          </Grid>

          <pre style={{ whiteSpace: "pre-wrap", maxHeight: 260, overflow: "auto" }}>
            {JSON.stringify(apiResult, null, 2)}
          </pre>
        </Paper>
      )}
    </Box>
  );
}
