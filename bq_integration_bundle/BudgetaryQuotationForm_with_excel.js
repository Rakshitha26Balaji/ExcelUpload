import { useEffect, useState } from "react";
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
// import InputAdornment from "@mui/material/InputAdornment";
// import Tooltip from "@mui/material/Tooltip";
// import Chip from "@mui/material/Chip";
// import Stack from "@mui/material/Stack";
// import Dialog from "@mui/material/Dialog";
// import DialogTitle from "@mui/material/DialogTitle";
// import DialogContent from "@mui/material/DialogContent";
// import DialogActions from "@mui/material/DialogActions";

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

// import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import axios from "axios";
import * as XLSX from "xlsx";


const BudgetaryQuotationForm = () => {

  // ----------------- Excel upload states -----------------
  const [excelRows, setExcelRows] = useState([]); // parsed excel rows
  const [excelValidation, setExcelValidation] = useState([]); // per-row validation results
  const [loadingExcel, setLoadingExcel] = useState(false);
  const [excelResult, setExcelResult] = useState(null); // server response summary

  // ------------------- HELPERS -------------------
  const buildSaveUrl = (serverIp, endpoint) => {
    // Ensure serverIp is safe base url ending with '/'
    if (!serverIp) return endpoint;
    try {
      const trimmed = serverIp.trim();
      let base = trimmed;
      const urlObj = new URL(base, window.location.origin);
      const pathParts = urlObj.pathname.split("/").filter(Boolean);
      if (pathParts.length > 0) {
        const last = pathParts[pathParts.length - 1];
        if (/^[A-Za-z_]+$/.test(last) || last.toLowerCase().includes("get")) {
          pathParts.pop();
        }
      }
      const newPath = pathParts.length ? `/${pathParts.join("/")}/` : "/";
      const finalUrl = `${urlObj.protocol}//${urlObj.host}${newPath}${endpoint}`;
      return finalUrl;
    } catch (e) {
      const s = serverIp.endsWith("/") ? serverIp : serverIp + "/";
      return s + endpoint;
    }
  };

  // ------------------ EXCEL FUNCTIONS ------------------
  const validateExcelRow = (row) => {
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
    if (!row.referenceNo || String(row.referenceNo).trim() === "")
      errors.push("Reference Number required");
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
      const json = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      const normalized = json.map((r) => {
        const out = {};
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
          else out[k] = r[k];
        });
        return out;
      });

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

  const handleBQExcelInsert = async (options = { onlyValid: true }) => {
    if (excelRows.length === 0) {
      alert("No Excel rows loaded. Please upload an Excel file first.");
      return;
    }
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
    for (let i = 0; i < rowsToSend.length; i++) {
      const row = rowsToSend[i];
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
    if (perRowResults.every((r) => r.success)) {
      setExcelRows([]);
      setExcelValidation([]);
    }
  };

  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [value, setValue] = useState(0);
  const [orderData, setOrderData] = useState([]);
  const [ServerIp, SetServerIp] = useState("");

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
        SetServerIp(response.data.project[0].ServerIP[0].NodeServerIP + API);
        axios
          .get(response.data.project[0].ServerIP[0].NodeServerIP + API)
          .then((response) => {
            setOrderData(response.data);
          })
          .catch((error) => console.log(error.message));
      })
      .catch(function (error) {
        // console.log("config.json BudgetaryQuotationFormerror", error);
        SetServerIp("172.195.120.135");

        // console.log(error);
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
        parseFloat(data.estimateValueInCrWithoutGST).toFixed(2)
      ),
      submittedValueInCrWithoutGST: parseFloat(
        parseFloat(data.submittedValueInCrWithoutGST).toFixed(2)
      ),
      dateOfLetterSubmission: data.dateOfLetterSubmission,
      referenceNo: data.referenceNo,
      JSON_competitors: data.JSON_competitors,
      presentStatus: data.presentStatus,
      submittedAt: new Date().toISOString(),
      OperatorId: user.id || "291536",
      OperatorName: user.username || "Vivek Kumar Singh",
      OperatorRole: user.userRole || "Lead Owner",
      OperatorSBU: "Software SBU",
    };

    console.log("Frontend Form Data:", JSON.stringify(formattedData, null, 2));

    // HERE WE ARE CALLING THE API
    axios
      .post(ServerIp, formattedData)
      .then((response) => {
        console.log(response.data);
        setSubmittedData(formattedData);
        // TO SHOW THE USER
        setSubmitSuccess(true);
      })
      .catch((error) => console.log(error.message));
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
        submittedData.serialNumber
      }-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

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

      {/* ------------------------ CREATE FORM ------------------------ */}
      {value === 0 && (
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

          {/* ------------------- FORM START ------------------- */}
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* ---------------- SECTION: BQ DETAILS ---------------- */}
            <Card
              sx={{
                mb: 4,
                p: 3,
                borderRadius: 4,
                background: "rgba(250,250,255,0.8)",
                backdropFilter: "blur(10px)",
                transition: "0.3s",
                boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
                },
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 800, color: "#0d47a1", mb: 2 }}
              >
                📋 BQ Details
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                {/* bqTitle */}
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="bqTitle"
                    control={control}
                    rules={{ required: "BQ Title is required" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="BQ Title"
                        fullWidth
                        required
                        error={!!errors.bqTitle}
                        helperText={errors.bqTitle?.message}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 3,
                            "&:hover": { boxShadow: "0 0 10px #bbdefb" },
                            "&.Mui-focused": { boxShadow: "0 0 15px #90caf9" },
                          },
                        }}
                      />
                    )}
                  />
                </Grid>

                {/* customerName */}
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="customerName"
                    control={control}
                    rules={{ required: "Customer Name is required" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Customer Name"
                        fullWidth
                        required
                        error={!!errors.customerName}
                        helperText={errors.customerName?.message}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 3,
                            "&:hover": { boxShadow: "0 0 10px #bbdefb" },
                            "&.Mui-focused": { boxShadow: "0 0 15px #90caf9" },
                          },
                        }}
                      />
                    )}
                  />
                </Grid>

                {/* customerAddress */}
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="customerAddress"
                    control={control}
                    rules={{ required: "Customer Address is required" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Customer Address"
                        fullWidth
                        required
                        error={!!errors.customerAddress}
                        helperText={errors.customerAddress?.message}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 3,
                            "&:hover": { boxShadow: "0 0 10px #bbdefb" },
                            "&.Mui-focused": { boxShadow: "0 0 15px #90caf9" },
                          },
                        }}
                      />
                    )}
                  />
                </Grid>

                {/* leadOwner */}
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="leadOwner"
                    control={control}
                    rules={{ required: "Lead Owner is required" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Lead Owner"
                        fullWidth
                        required
                        error={!!errors.leadOwner}
                        helperText={errors.leadOwner?.message}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 3,
                            "&:hover": { boxShadow: "0 0 10px #bbdefb" },
                            "&.Mui-focused": { boxShadow: "0 0 15px #90caf9" },
                          },
                        }}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Card>

            {/* ---------------- SECTION: FINANCIAL ---------------- */}
            <Card
              sx={{
                mb: 4,
                p: 3,
                borderRadius: 4,
                background: "rgba(250,250,255,0.8)",
                backdropFilter: "blur(10px)",
                transition: "0.3s",
                boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
                },
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 800, color: "#0d47a1", mb: 2 }}
              >
                💰 Classification & Financial Info
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                {/* defenceAndNonDefence */}
                <Grid item xs={12} sm={4}>
                  <Controller
                    name="defenceAndNonDefence"
                    control={control}
                    rules={{ required: "Classification required" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        select
                        label="Defence / Non-Defence"
                        fullWidth
                        required
                        error={!!errors.defenceAndNonDefence}
                        helperText={errors.defenceAndNonDefence?.message}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 3,
                            minWidth: 220,
                          },
                        }}
                      >
                        {defenceAndNonDefenceOptions.map((opt) => (
                          <MenuItem key={opt} value={opt}>
                            {opt}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                </Grid>

                {/* estimateValueInCrWithoutGST */}
                <Grid item xs={12} sm={4}>
                  <Controller
                    name="estimateValueInCrWithoutGST"
                    control={control}
                    rules={{
                      required: "Value required",
                      pattern: {
                        value: /^[0-9]+(\.[0-9]{1,2})?$/,
                        message: "Invalid number",
                      },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Value Without GST"
                        fullWidth
                        type="number"
                        InputProps={{
                          startAdornment: (
                            <Typography sx={{ mr: 1 }}>₹</Typography>
                          ),
                        }}
                        required
                        error={!!errors.estimateValueInCrWithoutGST}
                        helperText={errors.estimateValueInCrWithoutGST?.message}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 3,
                          },
                        }}
                      />
                    )}
                  />
                </Grid>

                {/* submittedValueInCrWithoutGST */}
                <Grid item xs={12} sm={4}>
                  <Controller
                    name="submittedValueInCrWithoutGST"
                    control={control}
                    rules={{
                      required: "Value required",
                      pattern: {
                        value: /^[0-9]+(\.[0-9]{1,2})?$/,
                        message: "Invalid number",
                      },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Value With GST"
                        fullWidth
                        type="number"
                        InputProps={{
                          startAdornment: (
                            <Typography sx={{ mr: 1 }}>₹</Typography>
                          ),
                        }}
                        required
                        error={!!errors.submittedValueInCrWithoutGST}
                        helperText={
                          errors.submittedValueInCrWithoutGST?.message
                        }
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 3,
                          },
                        }}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Card>

            {/* ---------------- SECTION: ADDITIONAL ---------------- */}
            <Card
              sx={{
                mb: 4,
                p: 3,
                borderRadius: 4,
                background: "rgba(250,250,255,0.8)",
                backdropFilter: "blur(10px)",
                transition: "0.3s",
                boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
                },
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 800, color: "#0d47a1", mb: 2 }}
              >
                📝 Additional Information
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                {/* referenceNo */}
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="referenceNo"
                    control={control}
                    rules={{ required: "Reference Number required" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Reference Number"
                        fullWidth
                        required
                        error={!!errors.referenceNo}
                        helperText={errors.referenceNo?.message}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 3,
                          },
                        }}
                      />
                    )}
                  />
                </Grid>

                {/* dateOfLetterSubmission */}
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="dateOfLetterSubmission"
                    control={control}
                    rules={{ required: "Date required" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        type="date"
                        label="Letter Submission Date"
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                        required
                        error={!!errors.dateOfLetterSubmission}
                        helperText={errors.dateOfLetterSubmission?.message}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 3,
                          },
                        }}
                      />
                    )}
                  />
                </Grid>

                {/* presentStatus */}
                <Grid item xs={12} sm={4}>
                  <Controller
                    name="presentStatus"
                    control={control}
                    rules={{ required: "Status required" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        select
                        label="Present Status"
                        fullWidth
                        required
                        error={!!errors.presentStatus}
                        helperText={errors.presentStatus?.message}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 3,
                            minWidth: 320,
                          },
                        }}
                      >
                        {statusOptions.map((s) => (
                          <MenuItem key={s} value={s}>
                            {s}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                </Grid>

                {/* competitors */}
                <Grid item xs={12} sm={8}>
                  <Controller
                    name="JSON_competitors"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Competitors (Optional)"
                        placeholder="Company A, Company B..."
                        fullWidth
                        multiline
                        rows={1}
                        helperText="Separate competitors with commas"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 3,
                          },
                        }}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Card>

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
      )}

      {/* ------------------------ VIEW DATA ------------------------ */}
      {value === 1 && orderData && (
        <ViewBudgetaryQuotationData ViewData={orderData} />
      )}
    </Container>
  );
};

function ViewBudgetaryQuotationData(props) {
  console.log("props viewBudgetaryQuotationData", props.ViewData.data);

  // ---------------- STATES ----------------

  const [searchTerm, setSearchTerm] = useState("");
  const [defenceFilter, setDefenceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [sortBy, setSortBy] = useState("dateCreated");
  const [sortDirection, setSortDirection] = useState("desc");

  const [selectedRow, setSelectedRow] = useState(null);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);

  // ---------------- HANDLERS ----------------

  // Search
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Defence Filter
  const handleDefenceFilterChange = (e) => {
    setDefenceFilter(e.target.value);
  };

  // Status Filter
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  // Sort By
  const handleSortByChange = (e) => {
    setSortBy(e.target.value);
  };

  // Toggle ASC / DESC
  const toggleSortDirection = () => {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  // Reset All Filters
  const handleResetFilters = () => {
    setSearchTerm("");
    setDefenceFilter("all");
    setStatusFilter("all");
    setSortBy("dateCreated");
    setSortDirection("desc");
  };

  // Row Selection
  const handleRowSelect = (row) => {
    setSelectedRow(row);
  };

  // OPEN EDIT DIALOG
  const handleEditClick = (row) => {
    setEditingRow({ ...row });
    setEditDialogOpen(true);
  };

  // UPDATE FIELD WHILE EDITING
  const handleEditFieldChange = (field, value) => {
    setEditingRow((prev) => ({ ...prev, [field]: value }));
  };

  // CANCEL EDIT
  const handleEditCancel = () => {
    setEditDialogOpen(false);
    setEditingRow(null);
  };

  // SAVE EDITED VALUES
  const handleEditSave = () => {
    console.log("Saving updated row:", editingRow);

    // TODO: update in backend or props function

    setEditDialogOpen(false);
  };

  // DELETE ROW
  const handleDeleteClick = (id) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return;

    console.log("Deleting row with ID:", id);

    // TODO: delete logic here
  };

  return (
    <>
      {/* HEADER + CONTROLS */}
      <Box
        sx={{
          mb: 3,
          px: { xs: 1, sm: 0 },
        }}
      >
        <Box
          sx={{
            borderRadius: 4,
            p: { xs: 2, sm: 3 },
            boxShadow: 6,
            background:
              "linear-gradient(135deg, #e0f7ff 0%, #c8f0ff 40%, #a6e9ff 100%)",
            color: "#06283D",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  letterSpacing: 0.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                User Profile Created List
              </Typography>
              <Typography
                variant="body2"
                sx={{ opacity: 0.85, mt: 0.5, maxWidth: 520 }}
              >
                View, search, filter and manage all user profiles in a single,
                elegant dashboard.
              </Typography>
            </Box>

            {/* SEARCH BOX */}
            <TextField
              variant="outlined"
              size="small"
              placeholder="Search by title, customer, reference..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRounded />
                  </InputAdornment>
                ),
              }}
              sx={{
                minWidth: { xs: "100%", sm: 260, md: 320 },
                backgroundColor: "rgba(240,248,255,0.9)", // Light shade
                borderRadius: 3,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  color: "#0f172a",
                  "& fieldset": {
                    borderColor: "rgba(148,163,184,0.5)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(100,116,139,0.8)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#3b82f6",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "#475569",
                },
              }}
            />
          </Box>

          {/* FILTERS + SORT */}
          <Box
            sx={{
              mt: 2.5,
              display: "flex",
              flexWrap: "wrap",
              gap: 1.5,
            }}
          >
            {/* DEFENCE FILTER */}
            <TextField
              select
              size="small"
              label="Defence / Non Defence"
              value={defenceFilter}
              onChange={handleDefenceFilterChange}
              sx={{
                minWidth: 180,
                backgroundColor: "rgba(240,248,255,0.9)",
                borderRadius: 2.5,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2.5,
                  color: "#0f172a",
                  "& fieldset": {
                    borderColor: "rgba(148,163,184,0.5)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(100,116,139,0.8)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#3b82f6",
                  },
                },
                "& .MuiInputLabel-root": { color: "#475569" },
              }}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="Defence">Defence</MenuItem>
              <MenuItem value="Non Defence">Non Defence</MenuItem>
            </TextField>

            {/* STATUS FILTER */}
            <TextField
              select
              size="small"
              label="Present Status"
              value={statusFilter}
              onChange={handleStatusFilterChange}
              sx={{
                minWidth: 170,
                backgroundColor: "rgba(240,248,255,0.9)",
                borderRadius: 2.5,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2.5,
                  color: "#0f172a",
                  "& fieldset": {
                    borderColor: "rgba(148,163,184,0.5)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(100,116,139,0.8)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#3b82f6",
                  },
                },
                "& .MuiInputLabel-root": { color: "#475569" },
              }}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="Open">Open</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Closed">Closed</MenuItem>
            </TextField>

            {/* SORT BY FILTER */}
            <TextField
              select
              size="small"
              label="Sort by"
              value={sortBy}
              onChange={handleSortByChange}
              sx={{
                minWidth: 170,
                backgroundColor: "rgba(240,248,255,0.9)",
                borderRadius: 2.5,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2.5,
                  color: "#0f172a",
                  "& fieldset": {
                    borderColor: "rgba(148,163,184,0.5)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(100,116,139,0.8)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#3b82f6",
                  },
                },
                "& .MuiInputLabel-root": { color: "#475569" },
              }}
            >
              <MenuItem value="dateCreated">Created Date</MenuItem>
              <MenuItem value="dateOfLetterSubmission">
                Letter Submission Date
              </MenuItem>
              <MenuItem value="estimateValueInCrWithoutGST">
                Estimate Value
              </MenuItem>
              <MenuItem value="submittedValueInCrWithoutGST">
                Submitted Value
              </MenuItem>
            </TextField>

            {/* SORT ICON BUTTON */}
            <Tooltip
              title={`Sort ${
                sortDirection === "asc" ? "Descending" : "Ascending"
              }`}
            >
              <IconButton
                onClick={toggleSortDirection}
                sx={{
                  ml: 0.5,
                  borderRadius: 2.5,
                  border: "1px solid rgba(148,163,184,0.7)",
                  backgroundColor: "rgba(240,248,255,0.9)",
                  color: "#0f172a",
                  "&:hover": {
                    backgroundColor: "rgba(224,242,254,1)",
                  },
                }}
              >
                {sortDirection === "asc" ? <SouthRounded /> : <NorthRounded />}
              </IconButton>
            </Tooltip>

            {/* RESET BUTTON */}
            <Button
              variant="outlined"
              onClick={handleResetFilters}
              startIcon={<RestartAltRounded />}
              sx={{
                ml: { xs: 0, sm: "auto" },
                borderRadius: 999,
                border: "2px solid #0E4C92", // deep visible blue border
                color: "#0E4C92", // strong readable blue text
                textTransform: "none",
                px: 3,
                py: 0.8,
                fontWeight: 600,
                backgroundColor: "rgba(255,255,255,0.85)", // bright + visible
                backdropFilter: "blur(6px)",
                boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
                transition: "0.2s ease",
                "&:hover": {
                  backgroundColor: "#d0eaff", // light sky blue hover
                  borderColor: "#0A3C7D",
                  color: "#0A3C7D",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                },
              }}
            >
              Reset
            </Button>
          </Box>
        </Box>
      </Box>

      {/* TABLE */}
      <Box
        sx={{
          width: "100%",
          maxWidth: "1800px", // ⬅️ Increased table width
          mx: "auto",
          mt: 2,
        }}
      >
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 4,
            boxShadow: 8,
            overflowX: "auto",
            overflowY: "auto",
            maxHeight: "75vh",
            minWidth: "100%",
          }}
        >
          <Table stickyHeader aria-label="user profiles table" size="small">
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: 800,
                    fontSize: 13,
                    color: "#f9fafb",
                    background:
                      "linear-gradient(90deg,#0ea5e9 0%,#2563eb 50%,#4f46e5 100%)",
                    borderBottom: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  Bq Title
                </TableCell>
                <TableCell
                  align="left"
                  sx={{
                    fontWeight: 800,
                    fontSize: 13,
                    color: "#f9fafb",
                    background:
                      "linear-gradient(90deg,#0ea5e9 0%,#2563eb 50%,#4f46e5 100%)",
                    borderBottom: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  Customer Name
                </TableCell>
                <TableCell
                  align="left"
                  sx={{
                    fontWeight: 800,
                    fontSize: 13,
                    color: "#f9fafb",
                    background:
                      "linear-gradient(90deg,#0ea5e9 0%,#2563eb 50%,#4f46e5 100%)",
                    borderBottom: "none",
                    minWidth: 200,
                  }}
                >
                  Customer Address
                </TableCell>
                <TableCell
                  align="left"
                  sx={{
                    fontWeight: 800,
                    fontSize: 13,
                    color: "#f9fafb",
                    background:
                      "linear-gradient(90deg,#0ea5e9 0%,#2563eb 50%,#4f46e5 100%)",
                    borderBottom: "none",
                  }}
                >
                  Lead Owner
                </TableCell>
                <TableCell
                  align="left"
                  sx={{
                    fontWeight: 800,
                    fontSize: 13,
                    color: "#f9fafb",
                    background:
                      "linear-gradient(90deg,#0ea5e9 0%,#2563eb 50%,#4f46e5 100%)",
                    borderBottom: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  Defence / Non Defence
                </TableCell>
                <TableCell
                  align="left"
                  sx={{
                    fontWeight: 800,
                    fontSize: 13,
                    color: "#f9fafb",
                    background:
                      "linear-gradient(90deg,#0ea5e9 0%,#2563eb 50%,#4f46e5 100%)",
                    borderBottom: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  Estimate (CR, w/o GST)
                </TableCell>
                <TableCell
                  align="left"
                  sx={{
                    fontWeight: 800,
                    fontSize: 13,
                    color: "#f9fafb",
                    background:
                      "linear-gradient(90deg,#0ea5e9 0%,#2563eb 50%,#4f46e5 100%)",
                    borderBottom: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  Submitted (CR, w/o GST)
                </TableCell>
                <TableCell
                  align="left"
                  sx={{
                    fontWeight: 800,
                    fontSize: 13,
                    color: "#f9fafb",
                    background:
                      "linear-gradient(90deg,#0ea5e9 0%,#2563eb 50%,#4f46e5 100%)",
                    borderBottom: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  Letter Submission Date
                </TableCell>
                <TableCell
                  align="left"
                  sx={{
                    fontWeight: 800,
                    fontSize: 13,
                    color: "#f9fafb",
                    background:
                      "linear-gradient(90deg,#0ea5e9 0%,#2563eb 50%,#4f46e5 100%)",
                    borderBottom: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  Reference No
                </TableCell>
                <TableCell
                  align="left"
                  sx={{
                    fontWeight: 800,
                    fontSize: 13,
                    color: "#f9fafb",
                    background:
                      "linear-gradient(90deg,#0ea5e9 0%,#2563eb 50%,#4f46e5 100%)",
                    borderBottom: "none",
                  }}
                >
                  Competitors
                </TableCell>
                <TableCell
                  align="left"
                  sx={{
                    fontWeight: 800,
                    fontSize: 13,
                    color: "#f9fafb",
                    background:
                      "linear-gradient(90deg,#0ea5e9 0%,#2563eb 50%,#4f46e5 100%)",
                    borderBottom: "none",
                  }}
                >
                  Remarks
                </TableCell>
                <TableCell
                  align="left"
                  sx={{
                    fontWeight: 800,
                    fontSize: 13,
                    color: "#f9fafb",
                    background:
                      "linear-gradient(90deg,#0ea5e9 0%,#2563eb 50%,#4f46e5 100%)",
                    borderBottom: "none",
                  }}
                >
                  Present Status
                </TableCell>
                <TableCell
                  align="left"
                  sx={{
                    fontWeight: 800,
                    fontSize: 13,
                    color: "#f9fafb",
                    background:
                      "linear-gradient(90deg,#0ea5e9 0%,#2563eb 50%,#4f46e5 100%)",
                    borderBottom: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  Created Date
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: 800,
                    fontSize: 13,
                    color: "#f9fafb",
                    background:
                      "linear-gradient(90deg,#0ea5e9 0%,#2563eb 50%,#4f46e5 100%)",
                    borderBottom: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {props.ViewData.data &&
                props.ViewData.data.length > 0 &&
                props.ViewData.data
                  .filter((row) => {
                    const q = searchTerm.toLowerCase();
                    const matchesSearch =
                      !q ||
                      row.bqTitle?.toLowerCase().includes(q) ||
                      row.customerName?.toLowerCase().includes(q) ||
                      row.referenceNo?.toLowerCase().includes(q) ||
                      row.leadOwner?.toLowerCase().includes(q) ||
                      row.customerAddress?.toLowerCase().includes(q);

                    const matchesDefence =
                      defenceFilter === "all" ||
                      row.defenceAndNonDefence === defenceFilter;

                    const matchesStatus =
                      statusFilter === "all" ||
                      row.presentStatus?.toLowerCase() ===
                        statusFilter.toLowerCase();

                    return matchesSearch && matchesDefence && matchesStatus;
                  })
                  .sort((a, b) => {
                    let aVal;
                    let bVal;

                    switch (sortBy) {
                      case "dateOfLetterSubmission":
                        aVal = a.dateOfLetterSubmission || "";
                        bVal = b.dateOfLetterSubmission || "";
                        break;
                      case "estimateValueInCrWithoutGST":
                        aVal = parseFloat(a.estimateValueInCrWithoutGST) || 0;
                        bVal = parseFloat(b.estimateValueInCrWithoutGST) || 0;
                        break;
                      case "submittedValueInCrWithoutGST":
                        aVal = parseFloat(a.submittedValueInCrWithoutGST) || 0;
                        bVal = parseFloat(b.submittedValueInCrWithoutGST) || 0;
                        break;
                      case "dateCreated":
                      default:
                        aVal = a.dateCreated || "";
                        bVal = b.dateCreated || "";
                        break;
                    }

                    if (typeof aVal === "string") aVal = aVal.toLowerCase();
                    if (typeof bVal === "string") bVal = bVal.toLowerCase();

                    if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
                    if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
                    return 0;
                  })
                  .map((row) => (
                    <TableRow
                      key={row.id}
                      hover
                      selected={selectedRow?.id === row.id}
                      onClick={() => handleRowSelect(row)}
                      sx={{
                        cursor: "pointer",
                        transition: "all 0.18s ease-out",
                        "&:hover": {
                          backgroundColor: "rgba(59,130,246,0.06)",
                          boxShadow: 1,
                          transform: "translateY(-1px)",
                        },
                      }}
                    >
                      <TableCell
                        component="th"
                        scope="row"
                        sx={{
                          fontWeight: 600,
                          fontSize: 14,
                          maxWidth: 180,
                          whiteSpace: "nowrap",
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                        }}
                      >
                        {row.bqTitle}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontSize: 14,
                          maxWidth: 180,
                          whiteSpace: "nowrap",
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                        }}
                      >
                        {row.customerName}
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{
                          fontSize: 13,
                          maxWidth: 260,
                          whiteSpace: "nowrap",
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                        }}
                      >
                        {row.customerAddress}
                      </TableCell>
                      <TableCell align="left" sx={{ fontSize: 13 }}>
                        {row.leadOwner}
                      </TableCell>
                      <TableCell align="left" sx={{ fontSize: 13 }}>
                        <Chip
                          size="small"
                          label={row.defenceAndNonDefence || "-"}
                          sx={{
                            borderRadius: 999,
                            fontSize: 11,
                            fontWeight: 600,
                            backgroundColor:
                              row.defenceAndNonDefence === "Defence"
                                ? "rgba(22,163,74,0.12)"
                                : "rgba(59,130,246,0.12)",
                            color:
                              row.defenceAndNonDefence === "Defence"
                                ? "#15803d"
                                : "#1d4ed8",
                          }}
                        />
                      </TableCell>
                      <TableCell align="left" sx={{ fontSize: 13 }}>
                        {row.estimateValueInCrWithoutGST}
                      </TableCell>
                      <TableCell align="left" sx={{ fontSize: 13 }}>
                        {row.submittedValueInCrWithoutGST}
                      </TableCell>
                      <TableCell align="left" sx={{ fontSize: 13 }}>
                        {row.dateOfLetterSubmission}
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{
                          fontSize: 13,
                          maxWidth: 160,
                          whiteSpace: "nowrap",
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                        }}
                      >
                        {row.referenceNo}
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{
                          fontSize: 13,
                          maxWidth: 180,
                          whiteSpace: "nowrap",
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                        }}
                      >
                        {row.JSON_competitors}
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{
                          fontSize: 13,
                          maxWidth: 200,
                          whiteSpace: "nowrap",
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                        }}
                      >
                        {row.remarks}
                      </TableCell>
                      <TableCell align="left" sx={{ fontSize: 13 }}>
                        <Chip
                          size="small"
                          label={row.presentStatus || "-"}
                          sx={{
                            borderRadius: 999,
                            fontSize: 11,
                            fontWeight: 700,
                            backgroundColor:
                              row.presentStatus === "Closed"
                                ? "rgba(248,113,113,0.18)"
                                : row.presentStatus === "In Progress"
                                ? "rgba(234,179,8,0.18)"
                                : "rgba(52,211,153,0.18)",
                            color:
                              row.presentStatus === "Closed"
                                ? "#b91c1c"
                                : row.presentStatus === "In Progress"
                                ? "#92400e"
                                : "#15803d",
                          }}
                        />
                      </TableCell>
                      <TableCell align="left" sx={{ fontSize: 13 }}>
                        {row.dateCreated}
                      </TableCell>
                      <TableCell align="center">
                        <Stack
                          direction="row"
                          spacing={1}
                          justifyContent="center"
                          alignItems="center"
                        >
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditClick(row);
                              }}
                              sx={{
                                borderRadius: 2,
                                backgroundColor: "rgba(59,130,246,0.12)",
                                "&:hover": {
                                  backgroundColor: "rgba(59,130,246,0.25)",
                                },
                              }}
                            >
                              <EditRounded fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(row.id);
                              }}
                              sx={{
                                borderRadius: 2,
                                backgroundColor: "rgba(239,68,68,0.12)",
                                "&:hover": {
                                  backgroundColor: "rgba(239,68,68,0.25)",
                                },
                              }}
                            >
                              <DeleteRounded fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
              {(!props.ViewData.data || props.ViewData.data.length === 0) && (
                <TableRow>
                  <TableCell colSpan={15} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" sx={{ color: "#6b7280" }}>
                      No profiles found.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* EDIT DIALOG */}
      <Dialog
        open={editDialogOpen}
        onClose={handleEditCancel}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            overflow: "hidden",
            background:
              "linear-gradient(135deg,#020617 0%,#0f172a 40%,#1d4ed8 100%)",
            color: "#e5e7eb",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pr: 2,
          }}
        >
          Edit User Profile
          <IconButton
            onClick={handleEditCancel}
            sx={{
              color: "#9ca3af",
              "&:hover": { color: "#f9fafb", backgroundColor: "transparent" },
            }}
          >
            <CloseRounded />
          </IconButton>
        </DialogTitle>
        <DialogContent
          dividers
          sx={{
            borderColor: "rgba(148,163,184,0.4)",
            background: "rgba(15,23,42,0.85)",
          }}
        >
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Bq Title"
                value={editingRow?.bqTitle || ""}
                onChange={(e) =>
                  handleEditFieldChange("bqTitle", e.target.value)
                }
                fullWidth
                size="small"
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2.5,
                    color: "#e5e7eb",
                    backgroundColor: "rgba(15,23,42,0.85)",
                  },
                  "& .MuiInputLabel-root": { color: "#9ca3af" },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Customer Name"
                value={editingRow?.customerName || ""}
                onChange={(e) =>
                  handleEditFieldChange("customerName", e.target.value)
                }
                fullWidth
                size="small"
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2.5,
                    color: "#e5e7eb",
                    backgroundColor: "rgba(15,23,42,0.85)",
                  },
                  "& .MuiInputLabel-root": { color: "#9ca3af" },
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Customer Address"
                value={editingRow?.customerAddress || ""}
                onChange={(e) =>
                  handleEditFieldChange("customerAddress", e.target.value)
                }
                fullWidth
                size="small"
                multiline
                minRows={2}
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2.5,
                    color: "#e5e7eb",
                    backgroundColor: "rgba(15,23,42,0.85)",
                  },
                  "& .MuiInputLabel-root": { color: "#9ca3af" },
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Lead Owner"
                value={editingRow?.leadOwner || ""}
                onChange={(e) =>
                  handleEditFieldChange("leadOwner", e.target.value)
                }
                fullWidth
                size="small"
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2.5,
                    color: "#e5e7eb",
                    backgroundColor: "rgba(15,23,42,0.85)",
                  },
                  "& .MuiInputLabel-root": { color: "#9ca3af" },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                label="Defence / Non Defence"
                value={editingRow?.defenceAndNonDefence || ""}
                onChange={(e) =>
                  handleEditFieldChange("defenceAndNonDefence", e.target.value)
                }
                fullWidth
                size="small"
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2.5,
                    color: "#e5e7eb",
                    backgroundColor: "rgba(15,23,42,0.85)",
                  },
                  "& .MuiInputLabel-root": { color: "#9ca3af" },
                }}
              >
                <MenuItem value="Defence">Defence</MenuItem>
                <MenuItem value="Non Defence">Non Defence</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Estimate Value in CR (w/o GST)"
                value={editingRow?.estimateValueInCrWithoutGST || ""}
                onChange={(e) =>
                  handleEditFieldChange(
                    "estimateValueInCrWithoutGST",
                    e.target.value
                  )
                }
                fullWidth
                size="small"
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2.5,
                    color: "#e5e7eb",
                    backgroundColor: "rgba(15,23,42,0.85)",
                  },
                  "& .MuiInputLabel-root": { color: "#9ca3af" },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Submitted Value in CR (w/o GST)"
                value={editingRow?.submittedValueInCrWithoutGST || ""}
                onChange={(e) =>
                  handleEditFieldChange(
                    "submittedValueInCrWithoutGST",
                    e.target.value
                  )
                }
                fullWidth
                size="small"
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2.5,
                    color: "#e5e7eb",
                    backgroundColor: "rgba(15,23,42,0.85)",
                  },
                  "& .MuiInputLabel-root": { color: "#9ca3af" },
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                type="date"
                label="Letter Submission Date"
                value={editingRow?.dateOfLetterSubmission || ""}
                onChange={(e) =>
                  handleEditFieldChange(
                    "dateOfLetterSubmission",
                    e.target.value
                  )
                }
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2.5,
                    color: "#e5e7eb",
                    backgroundColor: "rgba(15,23,42,0.85)",
                  },
                  "& .MuiInputLabel-root": { color: "#9ca3af" },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Reference No"
                value={editingRow?.referenceNo || ""}
                onChange={(e) =>
                  handleEditFieldChange("referenceNo", e.target.value)
                }
                fullWidth
                size="small"
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2.5,
                    color: "#e5e7eb",
                    backgroundColor: "rgba(15,23,42,0.85)",
                  },
                  "& .MuiInputLabel-root": { color: "#9ca3af" },
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Competitors"
                value={editingRow?.JSON_competitors || ""}
                onChange={(e) =>
                  handleEditFieldChange("JSON_competitors", e.target.value)
                }
                fullWidth
                size="small"
                multiline
                minRows={2}
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2.5,
                    color: "#e5e7eb",
                    backgroundColor: "rgba(15,23,42,0.85)",
                  },
                  "& .MuiInputLabel-root": { color: "#9ca3af" },
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Remarks"
                value={editingRow?.remarks || ""}
                onChange={(e) =>
                  handleEditFieldChange("remarks", e.target.value)
                }
                fullWidth
                size="small"
                multiline
                minRows={2}
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2.5,
                    color: "#e5e7eb",
                    backgroundColor: "rgba(15,23,42,0.85)",
                  },
                  "& .MuiInputLabel-root": { color: "#9ca3af" },
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                label="Present Status"
                value={editingRow?.presentStatus || ""}
                onChange={(e) =>
                  handleEditFieldChange("presentStatus", e.target.value)
                }
                fullWidth
                size="small"
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2.5,
                    color: "#e5e7eb",
                    backgroundColor: "rgba(15,23,42,0.85)",
                  },
                  "& .MuiInputLabel-root": { color: "#9ca3af" },
                }}
              >
                <MenuItem value="Open">Open</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Closed">Closed</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions
          sx={{
            px: 3,
            py: 2,
            borderTop: "1px solid rgba(148,163,184,0.4)",
            background: "rgba(15,23,42,0.95)",
          }}
        >
          <Button
            onClick={handleEditCancel}
            sx={{
              borderRadius: 999,
              textTransform: "none",
              px: 2.5,
              color: "#e5e7eb",
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleEditSave}
            startIcon={<CheckRounded />}
            sx={{
              borderRadius: 999,
              textTransform: "none",
              px: 3,
              fontWeight: 700,
              background:
                "linear-gradient(135deg,#22c55e 0%,#16a34a 40%,#22c55e 100%)",
              boxShadow:
                "0 10px 25px rgba(22,163,74,0.45), 0 0 0 1px rgba(21,128,61,0.4)",
              "&:hover": {
                background:
                  "linear-gradient(135deg,#16a34a 0%,#15803d 40%,#16a34a 100%)",
              },
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default BudgetaryQuotationForm;
