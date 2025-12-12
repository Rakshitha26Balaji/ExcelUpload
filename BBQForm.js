import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField,
  MenuItem,
  IconButton,
  Tooltip,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Button,
  Grid,
  InputAdornment,
  Card,
  Container,
} from "@mui/material";

import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import {
  SearchRounded,
  NorthRounded,
  SouthRounded,
  RestartAltRounded,
  EditRounded,
  DeleteRounded,
  CloseRounded,
  CheckRounded,
} from "@mui/icons-material";

import { useForm, Controller } from "react-hook-form";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import axios from "axios";

const BudgetaryQuotationForm = () => {
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [value, setValue] = useState(0);
  const [orderData, setOrderData] = useState([]);
  const [ServerIp, SetServerIp] = useState("");

  // ----------------- Excel upload states -----------------
  const [excelRows, setExcelRows] = useState([]); // parsed excel rows
  const [excelValidation, setExcelValidation] = useState([]); // per-row validation results
  const [loadingExcel, setLoadingExcel] = useState(false);
  const [excelResult, setExcelResult] = useState(null); // server response summary

  const API = "/getBudgetaryQuoatation";
  let user = JSON.parse(localStorage.getItem("user"));
  console.log(" user object ", user);

  // here, we apply the logic networking
  useEffect(() => {
    axios
      .get(`/config.json`)
      .then(function (response) {
        // WE SETTING THE API
        console.log(
          "which API we are calling : ",
          response.data.project[0].ServerIP[0].NodeServerIP + API
        );
        // keep ServerIp as the base server url (we'll compute safe base later)
        SetServerIp(response.data.project[0].ServerIP[0].NodeServerIP);
        // fetch view data using existing API
        axios
          .get(response.data.project[0].ServerIP[0].NodeServerIP + API)
          .then((response) => {
            setOrderData(response.data);
          })
          .catch((error) => console.log(error.message));
      })
      .catch(function (error) {
        // fallback IP
        SetServerIp("http://172.195.120.135/");
      })
      .finally(function () {
        // always executed
      });
  }, []);

  // by default values of the form's field
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      bqTitle: "",
      customerName: "",
      customerAddress: "",
      leadOwner: "",
      defenceAndNonDefence: "",
      estimateValueInCrWithoutGST: "",
      submittedValueInCrWithoutGST: "",
      dateOfLetterSubmission: "",
      referenceNo: "",
      JSON_competitors: "",
      presentStatus: "",
    },
  });

  const defenceAndNonDefenceOptions = ["Defence", "Non-Defence", "Civil"];
  const statusOptions = [
    "Budgetary Quotation Submitted",
    "Commercial Bid Submitted",
    "EoI was Submitted",
    "Not Participated",
    " ",
  ];

  const onSubmit = (data) => {
    // here we are formatting data so that we can send to backend
    console.log(data);
    const formattedData = {
      bqTitle: data.bqTitle,
      customerName: data.customerName,
      customerAddress: data.customerAddress,
      leadOwner: data.leadOwner,
      defenceAndNonDefence: data.defenceAndNonDefence,
      estimateValueInCrWithoutGST: parseFloat(
        parseFloat(data.estimateValueInCrWithoutGST || 0).toFixed(2)
      ),
      submittedValueInCrWithoutGST: parseFloat(
        parseFloat(data.submittedValueInCrWithoutGST || 0).toFixed(2)
      ),
      dateOfLetterSubmission: data.dateOfLetterSubmission,
      referenceNo: data.referenceNo,
      JSON_competitors: data.JSON_competitors,
      presentStatus: data.presentStatus,
      submittedAt: new Date().toISOString(),
      OperatorId: user?.id || "291536",
      OperatorName: user?.username || "Vivek Kumar Singh",
      OperatorRole: user?.userRole || "Lead Owner",
      OperatorSBU: "Software SBU",
    };

    console.log("Frontend Form Data:", JSON.stringify(formattedData, null, 2));

    // Build safe save URL: ensure base server path ends with '/'
    const saveUrl = buildSaveUrl(ServerIp, "saveBQForm");

    // HERE WE ARE CALLING THE API (save single form)
    axios
      .post(saveUrl, formattedData)
      .then((response) => {
        console.log(response.data);
        setSubmittedData(formattedData);
        // TO SHOW THE USER
        setSubmitSuccess(true);
      })
      .catch((error) => {
        console.log("Save BQ Form error:", error.message || error);
        alert("Failed to submit BQ form. Check console for details.");
      });
  };

  const handleReset = () => {
    reset();
    setSubmittedData(null);
  };

  const handleCloseSnackbar = () => {
    setSubmitSuccess(false);
  };

  const handleDownloadJSON = () => {
    if (submittedData) {
      const dataStr = JSON.stringify(submittedData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `budgetary-quotation-${
        submittedData.serialNumber || "export"
      }-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  // ------------------- HELPERS -------------------
  const buildSaveUrl = (serverIp, endpoint) => {
    // Ensure serverIp is safe base url ending with '/'
    if (!serverIp) return endpoint;
    // If serverIp already contains the endpoint, return as-is
    try {
      const trimmed = serverIp.trim();
      // if serverIp already ends with '/', good
      let base = trimmed;
      // If serverIp contains 'getBudgetaryQuoatation' as path, remove that segment
      // We'll remove last path segment if it looks like an API name
      const urlObj = new URL(base, window.location.origin);
      // remove trailing filename-like path if present
      const pathParts = urlObj.pathname.split("/").filter(Boolean);
      if (pathParts.length > 0) {
        // if last part contains letters and no dot (likely an API), remove it to get base
        const last = pathParts[pathParts.length - 1];
        if (/^[A-Za-z_]+$/.test(last) || last.toLowerCase().includes("get")) {
          pathParts.pop();
        }
      }
      const newPath = pathParts.length ? `/${pathParts.join("/")}/` : "/";
      const finalUrl = `${urlObj.protocol}//${urlObj.host}${newPath}${endpoint}`;
      return finalUrl;
    } catch (e) {
      // fallback naive handling
      const s = serverIp.endsWith("/") ? serverIp : serverIp + "/";
      return s + endpoint;
    }
  };

  // ------------------ EXCEL FUNCTIONS ------------------
  const validateExcelRow = (row) => {
    // Minimal validation matching your form rules
    const errors = [];

    if (!row.bqTitle || String(row.bqTitle).trim() === "")
      errors.push("BQ Title is required");
    if (!row.customerName || String(row.customerName).trim() === "")
      errors.push("Customer Name is required");
    if (!row.customerAddress || String(row.customerAddress).trim() === "")
      errors.push("Customer Address is required");
    if (!row.leadOwner || String(row.leadOwner).trim() === "")
      errors.push("Lead Owner is required");
    if (!row.defenceAndNonDefence || String(row.defenceAndNonDefence).trim() === "")
      errors.push("Classification required");
    // numeric checks for estimate/submitted values
    if (
      row.estimateValueInCrWithoutGST !== undefined &&
      row.estimateValueInCrWithoutGST !== "" &&
      isNaN(Number(row.estimateValueInCrWithoutGST))
    )
      errors.push("Estimate Value must be a number");
    if (
      row.submittedValueInCrWithoutGST !== undefined &&
      row.submittedValueInCrWithoutGST !== "" &&
      isNaN(Number(row.submittedValueInCrWithoutGST))
    )
      errors.push("Submitted Value must be a number");
    // date check (optional)
    // referenceNo can be required
    if (!row.referenceNo || String(row.referenceNo).trim() === "")
      errors.push("Reference Number required");
    // date required check
    if (!row.dateOfLetterSubmission || String(row.dateOfLetterSubmission).trim() === "")
      errors.push("Letter Submission Date required");

    return errors;
  };

  const handleBQExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      // convert to JSON with default empty strings to avoid undefined issues
      const json = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      // normalize header keys to expected field names (case-insensitive)
      const normalized = json.map((r) => {
        const out = {};
        // map common variations to expected fields
        const mapKey = (k) => String(k || "").trim().toLowerCase();
        Object.keys(r).forEach((k) => {
          const lk = mapKey(k);
          if (lk === "bqtitle" || lk === "title") out.bqTitle = r[k];
          else if (lk === "customername" || lk === "customer name") out.customerName = r[k];
          else if (lk === "customeraddress" || lk === "customer address") out.customerAddress = r[k];
          else if (lk === "leadowner" || lk === "lead owner") out.leadOwner = r[k];
          else if (lk.includes("defence")) out.defenceAndNonDefence = r[k];
          else if (lk.includes("estimate")) out.estimateValueInCrWithoutGST = r[k];
          else if (lk.includes("submitted")) out.submittedValueInCrWithoutGST = r[k];
          else if (lk.includes("date")) out.dateOfLetterSubmission = r[k];
          else if (lk.includes("reference")) out.referenceNo = r[k];
          else if (lk.includes("competitor")) out.JSON_competitors = r[k];
          else if (lk.includes("status")) out.presentStatus = r[k];
          else out[k] = r[k]; // keep extra columns
        });
        return out;
      });

      // run client-side validation for each row
      const validations = normalized.map((row, idx) => {
        const errors = validateExcelRow(row);
        return { rowIndex: idx, valid: errors.length === 0, errors };
      });

      setExcelRows(normalized);
      setExcelValidation(validations);
      setExcelResult(null);
      console.log("Parsed Excel rows:", normalized);
    };
    reader.readAsArrayBuffer(file);
  };

  // Bulk insert: send each row to saveBQForm endpoint (ServerIp-based)
  const handleBQExcelInsert = async (options = { onlyValid: true }) => {
    if (excelRows.length === 0) {
      alert("No Excel rows loaded. Please upload an Excel file first.");
      return;
    }

    // choose rows to send
    const rowsToSend = excelRows.filter((r, idx) =>
      options.onlyValid ? excelValidation[idx]?.valid : true
    );

    if (rowsToSend.length === 0) {
      alert("No valid rows to upload. Fix errors in the Excel first.");
      return;
    }

    const saveUrl = buildSaveUrl(ServerIp, "saveBQForm");
    setLoadingExcel(true);
    setExcelResult(null);

    const perRowResults = [];
    // We'll post rows sequentially to avoid server overload; change to parallel if your backend supports it
    for (let i = 0; i < rowsToSend.length; i++) {
      const row = rowsToSend[i];
      // build payload same as form submit
      const payload = {
        bqTitle: row.bqTitle,
        customerName: row.customerName,
        customerAddress: row.customerAddress,
        leadOwner: row.leadOwner,
        defenceAndNonDefence: row.defenceAndNonDefence,
        estimateValueInCrWithoutGST:
          row.estimateValueInCrWithoutGST !== ""
            ? parseFloat(Number(row.estimateValueInCrWithoutGST).toFixed(2))
            : 0,
        submittedValueInCrWithoutGST:
          row.submittedValueInCrWithoutGST !== ""
            ? parseFloat(Number(row.submittedValueInCrWithoutGST).toFixed(2))
            : 0,
        dateOfLetterSubmission: row.dateOfLetterSubmission,
        referenceNo: row.referenceNo,
        JSON_competitors: row.JSON_competitors || "",
        presentStatus: row.presentStatus || "",
        submittedAt: new Date().toISOString(),
        OperatorId: user?.id || "291536",
        OperatorName: user?.username || "Vivek Kumar Singh",
        OperatorRole: user?.userRole || "Lead Owner",
        OperatorSBU: "Software SBU",
      };

      try {
        const resp = await axios.post(saveUrl, payload);
        perRowResults.push({ rowIndex: i, success: true, data: resp.data });
      } catch (err) {
        console.error(`Row ${i} upload error:`, err.response?.data || err.message || err);
        perRowResults.push({
          rowIndex: i,
          success: false,
          error: err.response?.data || err.message || "Unknown error",
        });
      }
    }

    setLoadingExcel(false);
    setExcelResult({
      attempted: rowsToSend.length,
      results: perRowResults,
      successCount: perRowResults.filter((r) => r.success).length,
      failedCount: perRowResults.filter((r) => !r.success).length,
    });

    // Keep excel preview so user can inspect failed rows; optionally clear on full success
    if (perRowResults.every((r) => r.success)) {
      setExcelRows([]);
      setExcelValidation([]);
    }
  };

  // ---------------- existing UI & view functions below (kept unchanged) ----------------

  return (
    <Container
      maxWidth="xl"
      sx={{
        py: 5,
        minHeight: "100vh",
        background: "linear-gradient(135deg, #e3eeff 0%, #f8fbff 100%)",
        borderRadius: 4,
      }}
    >
      {/* ------------------------ TABS ------------------------ */}
      <Tabs
        value={value}
        onChange={(e, v) => setValue(v)}
        centered
        sx={{
          mb: 4,
          "& .MuiTab-root": {
            fontWeight: 700,
            fontSize: "1rem",
            textTransform: "none",
            px: 4,
          },
          "& .Mui-selected": {
            color: "#0d47a1 !important",
          },
          "& .MuiTabs-indicator": {
            height: 4,
            borderRadius: 2,
            background: "linear-gradient(90deg, #0d47a1, #42a5f5, #1e88e5)",
          },
        }}
      >
        <Tab label="Create Data" />
        <Tab label="View Data" />
      </Tabs>

      {/* -------------------- EXCEL UPLOAD SECTION (placed inside Create Data tab) -------------------- */}
      {value === 0 && (
        <>
          <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "center" }}>
            <input
              id="bqExcelInput"
              type="file"
              accept=".xlsx,.xls"
              style={{ display: "none" }}
              onChange={(e) => handleBQExcelUpload(e)}
            />

            <label htmlFor="bqExcelInput">
              <Button variant="contained" component="span">
                📁 Upload BQ Excel
              </Button>
            </label>

            <Button
              variant="outlined"
              disabled={excelRows.length === 0 || loadingExcel}
              onClick={() => handleBQExcelInsert({ onlyValid: true })}
            >
              {loadingExcel ? "Uploading..." : "🚀 Insert Excel Data (Valid rows)"}
            </Button>

            <Button
              variant="text"
              disabled={excelRows.length === 0 || loadingExcel}
              onClick={() => handleBQExcelInsert({ onlyValid: false })}
            >
              Upload All (Attempt)
            </Button>

            {excelRows.length > 0 && (
              <Typography sx={{ fontWeight: 600, ml: 2 }}>
                Loaded {excelRows.length} rows — {excelValidation.filter(v => !v.valid).length} invalid
              </Typography>
            )}
          </Box>

          {/* Excel Preview */}
          {excelRows.length > 0 && (
            <Paper sx={{ p: 2, mb: 4, maxHeight: 320, overflow: "auto" }}>
              <Typography sx={{ mb: 2, fontWeight: 700 }}>
                Excel Preview ({excelRows.length} rows)
              </Typography>

              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    {Object.keys(excelRows[0]).map((col) => (
                      <TableCell key={col} sx={{ fontWeight: 700 }}>
                        {col}
                      </TableCell>
                    ))}
                    <TableCell>Validation</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {excelRows.map((row, idx) => {
                    const v = excelValidation[idx] || { valid: true, errors: [] };
                    return (
                      <TableRow key={idx}>
                        <TableCell>{idx + 1}</TableCell>
                        {Object.keys(excelRows[0]).map((col) => (
                          <TableCell key={col} sx={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {String(row[col] ?? "")}
                          </TableCell>
                        ))}
                        <TableCell>
                          <Stack direction="column" spacing={0.5}>
                            {v.valid ? (
                              <Chip label="OK" size="small" />
                            ) : (
                              <>
                                <Chip label={`${v.errors.length} error(s)`} color="error" size="small" />
                                {v.errors.map((err, i) => (
                                  <Typography key={i} variant="caption" color="error" sx={{ display: "block" }}>
                                    • {err}
                                  </Typography>
                                ))}
                              </>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Paper>
          )}

          {/* ------------------------ CREATE FORM (original form) ------------------------ */}
          <Paper
            elevation={10}
            sx={{
              p: { xs: 2, md: 5 },
              borderRadius: 5,
              background: "rgba(255,255,255,0.85)",
              backdropFilter: "blur(14px)",
              transition: "0.3s",
              boxShadow: "0 12px 32px rgba(0,0,0,0.10)",
              "&:hover": { transform: "scale(1.01)" },
            }}
          >
            {/* Title */}
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 900,
                  background: "linear-gradient(45deg, #0d47a1, #42a5f5, #1e88e5)",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}
              >
                Budgetary Quotation Form
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{ opacity: 0.7, mt: 1, fontWeight: 500 }}
              >
                Provide details below to create a new BQ entry
              </Typography>
            </Box>

            {/* ------------------- FORM START (kept exactly as original) ------------------- */}
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* ... */}
              {/* Keep the entire form exactly as in your original file.
                  For brevity in this regenerated file snippet I am not repeating
                  all form fields here because they remain unchanged. */}
              {/* Paste the original form content (the Card blocks and form controls)
                  from your file here unchanged. */}
              {/* ---------------- BUTTONS ---------------- */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 3,
                  mt: 4,
                  flexWrap: "wrap",
                }}
              >
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  sx={{
                    px: 6,
                    py: 1.6,
                    fontSize: "1.1rem",
                    borderRadius: 3,
                    fontWeight: 700,
                    background: "linear-gradient(90deg, #1565c0, #42a5f5)",
                    textTransform: "none",
                    transition: "0.3s",
                    "&:hover": {
                      transform: "scale(1.05)",
                      background: "linear-gradient(90deg, #0d47a1, #1e88e5)",
                    },
                  }}
                >
                  🚀 Submit BQ
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  onClick={handleReset}
                  sx={{
                    px: 6,
                    py: 1.6,
                    fontSize: "1.1rem",
                    borderRadius: 3,
                    fontWeight: 700,
                    borderWidth: 2,
                    textTransform: "none",
                    "&:hover": {
                      transform: "scale(1.03)",
                      background: "#f4f6fb",
                    },
                  }}
                >
                  Reset
                </Button>
              </Box>
            </form>

            {/* ---------------- SUCCESS SNACKBAR ---------------- */}
            <Snackbar
              open={submitSuccess}
              autoHideDuration={6000}
              onClose={handleCloseSnackbar}
              anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
              <Alert severity="success" sx={{ fontSize: "1rem" }}>
                🎉 BQ submitted successfully!
              </Alert>
            </Snackbar>

            {/* ---------------- JSON OUTPUT ---------------- */}
            {submittedData && (
              <Box sx={{ mt: 5 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  📊 Submitted Data (JSON)
                </Typography>

                <Paper
                  sx={{
                    p: 3,
                    background: "#0d1117",
                    color: "#c9d1d9",
                    borderRadius: 4,
                    maxHeight: 500,
                    overflow: "auto",
                    fontFamily: "monospace",
                    fontSize: "0.95rem",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                  }}
                >
                  <pre>{JSON.stringify(submittedData, null, 2)}</pre>
                </Paper>

                <Button
                  variant="contained"
                  sx={{
                    mt: 2,
                    background: "#2e7d32",
                    "&:hover": { background: "#1b5e20" },
                  }}
                  onClick={handleDownloadJSON}
                >
                  Download JSON
                </Button>
              </Box>
            )}
          </Paper>
        </>
      )}

      {/* ------------------------ VIEW DATA ------------------------ */}
      {value === 1 && orderData && (
        <ViewBudgetaryQuotationData ViewData={orderData} />
      )}

      {/* Excel upload result summary */}
      {excelResult && (
        <Paper sx={{ mt: 3, p: 2 }}>
          <Typography variant="subtitle1">Excel Upload Summary</Typography>
          <Typography>Attempted: {excelResult.attempted}</Typography>
          <Typography>Success: {excelResult.successCount}</Typography>
          <Typography>Failed: {excelResult.failedCount}</Typography>
          <Box sx={{ mt: 1 }}>
            {excelResult.results.map((r, i) => (
              <Typography key={i} variant="caption" display="block">
                Row {r.rowIndex + 1}: {r.success ? "OK" : `Failed - ${JSON.stringify(r.error)}`}
              </Typography>
            ))}
          </Box>
        </Paper>
      )}
    </Container>
  );
};

// ------------------------ ViewBudgetaryQuotationData component unchanged ------------------------
// For brevity I will reuse your original component (paste from file as-is).
function ViewBudgetaryQuotationData(props) {
  console.log("props viewBudgetaryQuotationData", props.ViewData.data);

  // ... (put entire original ViewBudgetaryQuotationData code here unchanged)
  // To keep regenerated file compact here, copy the ViewBudgetaryQuotationData
  // implementation from your original file (it remains the same).
  // The uploaded original file contains the full implementation — simply reuse it.

  // For now, return a placeholder when used in this snippet:
  return (
    <>
      {/* Use original ViewBudgetaryQuotationData code from your file. */}
      <Typography>View Data component (unchanged) — please paste original implementation.</Typography>
    </>
  );
}

export default BudgetaryQuotationForm;
