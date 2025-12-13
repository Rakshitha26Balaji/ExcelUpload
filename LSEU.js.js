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
  Tabs,
  Tab,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import * as XLSX from "xlsx";
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
import axios from "axios";

const STATUS_OPTIONS = [
  "Draft",
  "Submitted",
  "In Progress",
  "Under Review",
  "Won",
  "Lost",
  "On Hold",
];

const TENDER_TYPE_OPTIONS = [
  "Open",
  "Limited",
  "Single Bid",
  "Two Bid",
  "EOI",
  "Others",
];

const LeadSubmittedForm = () => {
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [value, setValue] = useState(0);
  const [orderData, setOrderData] = useState([]);
  const [ServerIp, SetServerIp] = useState("");

  const API = "/getLeadSubmitted";
  let user = JSON.parse(localStorage.getItem("user")) || {};

  // ---------------------- FETCH CONFIG + DATA ----------------------
  useEffect(() => {
    axios
      .get(`/config.json`)
      .then(function (response) {
        // WE SETTING THE API
        console.log(
          "we are looking for server IP : ",
          response.data.project[0].ServerIP[0].NodeServerIP
        );
        SetServerIp(response.data.project[0].ServerIP[0].NodeServerIP);
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

  // ---------------------- FORM HOOK ----------------------
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      tenderName: "",
      customerName: "",
      customerAddress: "",
      tenderDate: "",
      bidOwner: "",
      rfpReceivedOn: "",
      valueEMDInCrore: "",
      rfpDueDate: "",
      dmktgInPrincipalApprovalRxdOn: "",
      sellingPriceApprovalInitiatedOn: "",
      bidSubmittedOn: "",
      approvalSBUFinanceOn: "",
      approvalGMOn: "",
      sentToFinanceGMDmktgApprovalRxdOn: "",
      dmktgApprovalRxdOn: "",
      tenderReferenceNo: "",
      tenderType: "",
      website: "",
      presentStatus: "",
    },
  });

  // ---------------------- SUBMIT HANDLER ----------------------
  const onSubmit = (data) => {
    const formattedData = {
      tenderName: data.tenderName,
      customerName: data.customerName,
      customerAddress: data.customerAddress,
      tenderDate: data.tenderDate,
      bidOwner: data.bidOwner,
      rfpReceivedOn: data.rfpReceivedOn,
      valueEMDInCrore: data.valueEMDInCrore
        ? Number(parseFloat(data.valueEMDInCrore).toFixed(2))
        : 0,
      rfpDueDate: data.rfpDueDate,
      dmktgInPrincipalApprovalRxdOn: data.dmktgInPrincipalApprovalRxdOn,
      sellingPriceApprovalInitiatedOn: data.sellingPriceApprovalInitiatedOn,
      bidSubmittedOn: data.bidSubmittedOn,
      approvalSBUFinanceOn: data.approvalSBUFinanceOn,
      approvalGMOn: data.approvalGMOn,
      sentToFinanceGMDmktgApprovalRxdOn: data.sentToFinanceGMDmktgApprovalRxdOn,
      dmktgApprovalRxdOn: data.dmktgApprovalRxdOn,
      tenderReferenceNo: data.tenderReferenceNo,
      tenderType: data.tenderType,
      website: data.website,
      presentStatus: data.presentStatus,
      OperatorId: user.id || "291536",
      OperatorName: user.username || "Vivek Kumar Singh",
      OperatorRole: user.userRole || "Lead Owner",
      OperatorSBU: "Software SBU",
      submittedAt: new Date().toISOString(),
    };

    console.log("LeadSubmittedData:", JSON.stringify(formattedData, null, 2));

    axios
      .post(ServerIp + API, formattedData)
      .then((response) => {
        console.log(response.data);
        setSubmittedData(formattedData);
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
      link.download = `lead-submitted-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <Container
      maxWidth="xl"
      sx={{
         py: 2,
        mb: 4,
        minHeight: "85vh",
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
        <Tab label="Bulk Upload" />
      </Tabs>

      {/* ------------------------ CREATE FORM ------------------------ */}
      {value === 0 && (
        <Paper
          elevation={10}
          sx={{
            p: { xs: 2, md: 5 },
            borderRadius: 2,
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(14px)",
            // transition: "0.3s",
            boxShadow: "0 12px 32px rgba(0,0,0,0.10)",
            // "&:hover": { transform: "scale(1.01)" },
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
              Lead Submitted Form
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{ opacity: 0.7, mt: 1, fontWeight: 500 }}
            >
              Enter the tender and approval details to create a new Lead
              submission entry
            </Typography>
          </Box>

          {/* ------------------- FORM START ------------------- */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* ---------------- SECTION: TENDER DETAILS ---------------- */}
            <Card
              sx={{
                mb: 4,
                p: 3,
                borderRadius: 4,
                background: "rgba(250,250,255,0.8)",
                backdropFilter: "blur(10px)",
                // transition: "0.3s",
                boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
                // "&:hover": {
                //   transform: "translateY(-4px)",
                //   boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
                // },
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 800, color: "#0d47a1", mb: 2 }}
              >
                📋 Tender Details
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                {/* tenderName */}
                <Grid item xs={12} sm={6} md={4}>
                  <Controller
                    name="tenderName"
                    control={control}
                    rules={{ required: "Tender Name is required" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Tender Name"
                        fullWidth
                        required
                        error={!!errors.tenderName}
                        helperText={errors.tenderName?.message}
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
                <Grid item xs={12} sm={6} md={4}>
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
                <Grid item xs={12} sm={6} md={4}>
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

                {/* tenderDate */}
                <Grid item xs={12} sm={6} md={4}>
                  <Controller
                    name="tenderDate"
                    control={control}
                    rules={{ required: "Tender Date is required" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Tender Date"
                        type="date"
                        fullWidth
                        required
                        InputLabelProps={{ shrink: true }}
                        error={!!errors.tenderDate}
                        helperText={errors.tenderDate?.message}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 3,
                          },
                        }}
                      />
                    )}
                  />
                </Grid>

                {/* tenderReferenceNo */}
                <Grid item xs={12} sm={6} md={4}>
                  <Controller
                    name="tenderReferenceNo"
                    control={control}
                    rules={{ required: "Tender Reference No is required" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Tender Reference No"
                        fullWidth
                        required
                        error={!!errors.tenderReferenceNo}
                        helperText={errors.tenderReferenceNo?.message}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 3,
                          },
                        }}
                      />
                    )}
                  />
                </Grid>

                {/* tenderType */}
                <Grid item xs={12} sm={6} md={4}>
                  <Controller
                    name="tenderType"
                    control={control}
                    rules={{ required: "Tender Type is required" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        select
                        label="Tender Type"
                        fullWidth
                        required
                        error={!!errors.tenderType}
                        helperText={errors.tenderType?.message}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 3,
                            minWidth: 220,
                          },
                        }}
                      >
                        {TENDER_TYPE_OPTIONS.map((opt) => (
                          <MenuItem key={opt} value={opt}>
                            {opt}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                </Grid>

                {/* website */}
                <Grid item xs={12} sm={6} md={4}>
                  <Controller
                    name="website"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Website (Optional)"
                        fullWidth
                        placeholder="https://..."
                        helperText={
                          errors.website?.message ||
                          "URL of tender site, if any"
                        }
                        error={!!errors.website}
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

            {/* ---------------- SECTION: BID OWNER & EMD ---------------- */}
            <Card
              sx={{
                mb: 4,
                p: 3,
                borderRadius: 4,
                background: "rgba(250,250,255,0.8)",
                backdropFilter: "blur(10px)",
                // transition: "0.3s",
                boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
                // "&:hover": {
                //   transform: "translateY(-4px)",
                //   boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
                // },
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 800, color: "#0d47a1", mb: 2 }}
              >
                👤 Bid Owner & EMD Value
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                {/* bidOwner */}
                <Grid item xs={12} sm={6} md={4}>
                  <Controller
                    name="bidOwner"
                    control={control}
                    rules={{ required: "Bid Owner is required" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Bid Owner"
                        fullWidth
                        required
                        error={!!errors.bidOwner}
                        helperText={errors.bidOwner?.message}
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

                {/* valueEMDInCrore */}
                <Grid item xs={12} sm={6} md={4}>
                  <Controller
                    name="valueEMDInCrore"
                    control={control}
                    rules={{
                      required: "Value of EMD in Crore is required",
                      pattern: {
                        value: /^[0-9]+(\.[0-9]{1,2})?$/,
                        message: "Enter a valid amount (max 2 decimals)",
                      },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Value of EMD (Crore)"
                        fullWidth
                        type="number"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">₹</InputAdornment>
                          ),
                        }}
                        required
                        error={!!errors.valueEMDInCrore}
                        helperText={errors.valueEMDInCrore?.message}
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

            {/* ---------------- SECTION: RFP INFORMATION ---------------- */}
            <Card
              sx={{
                mb: 4,
                p: 3,
                borderRadius: 4,
                background: "rgba(250,250,255,0.8)",
                backdropFilter: "blur(10px)",
                // transition: "0.3s",
                boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
                // "&:hover": {
                //   transform: "translateY(-4px)",
                //   boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
                // },
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 800, color: "#0d47a1", mb: 2 }}
              >
                📄 RFP Timeline
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                {/* rfpReceivedOn */}
                <Grid item xs={12} sm={6} md={4}>
                  <Controller
                    name="rfpReceivedOn"
                    control={control}
                    rules={{ required: "RFP Received On is required" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="RFP Received On"
                        type="date"
                        fullWidth
                        required
                        InputLabelProps={{ shrink: true }}
                        error={!!errors.rfpReceivedOn}
                        helperText={errors.rfpReceivedOn?.message}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 3,
                          },
                        }}
                      />
                    )}
                  />
                </Grid>

                {/* rfpDueDate */}
                <Grid item xs={12} sm={6} md={4}>
                  <Controller
                    name="rfpDueDate"
                    control={control}
                    rules={{ required: "RFP Due Date is required" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="RFP Due Date"
                        type="date"
                        fullWidth
                        required
                        InputLabelProps={{ shrink: true }}
                        error={!!errors.rfpDueDate}
                        helperText={errors.rfpDueDate?.message}
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

            {/* ---------------- SECTION: APPROVAL WORKFLOW ---------------- */}
            <Card
              sx={{
                mb: 4,
                p: 3,
                borderRadius: 4,
                background: "rgba(250,250,255,0.8)",
                backdropFilter: "blur(10px)",
                // transition: "0.3s",
                boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
                // "&:hover": {
                //   transform: "translateY(-4px)",
                //   boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
                // },
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 800, color: "#0d47a1", mb: 2 }}
              >
                ✅ Approval Workflow
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                {/* dmktgInPrincipalApprovalRxdOn */}
                <Grid item xs={12} sm={6} md={4}>
                  <Controller
                    name="dmktgInPrincipalApprovalRxdOn"
                    control={control}
                    rules={{
                      required: "Dmktg In-Principal Approval date is required",
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Dmktg In-Principal Approval Rxd On"
                        type="date"
                        fullWidth
                        required
                        InputLabelProps={{ shrink: true }}
                        error={!!errors.dmktgInPrincipalApprovalRxdOn}
                        helperText={
                          errors.dmktgInPrincipalApprovalRxdOn?.message
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

                {/* sellingPriceApprovalInitiatedOn */}
                <Grid item xs={12} sm={6} md={4}>
                  <Controller
                    name="sellingPriceApprovalInitiatedOn"
                    control={control}
                    rules={{
                      required:
                        "Selling Price Approval Initiated date is required",
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Selling Price Approval Initiated On"
                        type="date"
                        fullWidth
                        required
                        InputLabelProps={{ shrink: true }}
                        error={!!errors.sellingPriceApprovalInitiatedOn}
                        helperText={
                          errors.sellingPriceApprovalInitiatedOn?.message
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

                {/* bidSubmittedOn */}
                <Grid item xs={12} sm={6} md={4}>
                  <Controller
                    name="bidSubmittedOn"
                    control={control}
                    rules={{ required: "Bid Submitted On is required" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Bid Submitted On"
                        type="date"
                        fullWidth
                        required
                        InputLabelProps={{ shrink: true }}
                        error={!!errors.bidSubmittedOn}
                        helperText={errors.bidSubmittedOn?.message}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 3,
                          },
                        }}
                      />
                    )}
                  />
                </Grid>

                {/* approvalSBUFinanceOn */}
                <Grid item xs={12} sm={6} md={4}>
                  <Controller
                    name="approvalSBUFinanceOn"
                    control={control}
                    rules={{
                      required: "Approval from SBU Finance date is required",
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Approval from SBU Finance On"
                        type="date"
                        fullWidth
                        required
                        InputLabelProps={{ shrink: true }}
                        error={!!errors.approvalSBUFinanceOn}
                        helperText={errors.approvalSBUFinanceOn?.message}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 3,
                          },
                        }}
                      />
                    )}
                  />
                </Grid>

                {/* approvalGMOn */}
                <Grid item xs={12} sm={6} md={4}>
                  <Controller
                    name="approvalGMOn"
                    control={control}
                    rules={{
                      required: "Approval from GM date is required",
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Approval from GM On"
                        type="date"
                        fullWidth
                        required
                        InputLabelProps={{ shrink: true }}
                        error={!!errors.approvalGMOn}
                        helperText={errors.approvalGMOn?.message}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 3,
                          },
                        }}
                      />
                    )}
                  />
                </Grid>

                {/* sentToFinanceGMDmktgApprovalRxdOn */}
                <Grid item xs={12} sm={6} md={4}>
                  <Controller
                    name="sentToFinanceGMDmktgApprovalRxdOn"
                    control={control}
                    rules={{
                      required:
                        "Sent to Finance GM on Dmktg Approval Rxd On is required",
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Sent to Finance GM on Dmktg Approval Rxd On"
                        type="date"
                        fullWidth
                        required
                        InputLabelProps={{ shrink: true }}
                        error={!!errors.sentToFinanceGMDmktgApprovalRxdOn}
                        helperText={
                          errors.sentToFinanceGMDmktgApprovalRxdOn?.message
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

                {/* dmktgApprovalRxdOn */}
                <Grid item xs={12} sm={6} md={4}>
                  <Controller
                    name="dmktgApprovalRxdOn"
                    control={control}
                    rules={{
                      required: "Dmktg Approval Rxd On is required",
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Dmktg Approval Rxd On"
                        type="date"
                        fullWidth
                        required
                        InputLabelProps={{ shrink: true }}
                        error={!!errors.dmktgApprovalRxdOn}
                        helperText={errors.dmktgApprovalRxdOn?.message}
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

            {/* ---------------- SECTION: STATUS & TRACKING ---------------- */}
            <Card
              sx={{
                mb: 4,
                p: 3,
                borderRadius: 4,
                background: "rgba(250,250,255,0.8)",
                backdropFilter: "blur(10px)",
                // transition: "0.3s",
                boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
                // "&:hover": {
                //   transform: "translateY(-4px)",
                //   boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
                // },
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 800, color: "#0d47a1", mb: 2 }}
              >
                📊 Status & Tracking
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                {/* presentStatus */}
                <Grid item xs={12} sm={6} md={4}>
                  <Controller
                    name="presentStatus"
                    control={control}
                    rules={{ required: "Present Status is required" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        select
                        label="Present Status"
                        fullWidth
                        required
                        error={!!errors.presentStatus}
                        helperText={
                          errors.presentStatus?.message ||
                          "Select current tracking status"
                        }
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 3,
                          },
                        }}
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <MenuItem key={status} value={status}>
                            {status}
                          </MenuItem>
                        ))}
                      </TextField>
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
                🚀 Submit Lead
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
              🎉 Lead submitted successfully!
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
        <ViewLeadSubmittedData ViewData={orderData} />
      )}

      {/* ------------------------ BULK UPLOAD ------------------------ */}
      {value === 2 && (
        <ExcelUploadAndValidate user={user} ServerIp={ServerIp} />
      )}
    </Container>
  );
};

// ---------------------------------------------------------------------------
// VIEW COMPONENT WITH SEARCH + FILTERS + SORT + EDIT / DELETE
// ---------------------------------------------------------------------------

function ViewLeadSubmittedData(props) {
  const data = props.ViewData?.data || [];
  const [searchTerm, setSearchTerm] = useState("");
  const [tenderTypeFilter, setTenderTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [sortBy, setSortBy] = useState("dateCreated");
  const [sortDirection, setSortDirection] = useState("desc");

  const [selectedRow, setSelectedRow] = useState(null);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);

  // READ-ONLY VIEW DIALOG STATE
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewRow, setViewRow] = useState(null);


  // ---------------- HANDLERS ----------------

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const handleTenderTypeFilterChange = (e) =>
    setTenderTypeFilter(e.target.value);

  const handleStatusFilterChange = (e) => setStatusFilter(e.target.value);

  const handleSortByChange = (e) => setSortBy(e.target.value);

  const toggleSortDirection = () =>
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));

  const handleResetFilters = () => {
    setSearchTerm("");
    setTenderTypeFilter("all");
    setStatusFilter("all");
    setSortBy("dateCreated");
    setSortDirection("desc");
  };

   // DOWNLOAD ALL DATA AS EXCEL
    const handleDownloadAllData = () => {
      if (!props.ViewData?.data || props.ViewData.data.length === 0) {
        alert("No data available to download");
        return;
      }
  
      // Convert JSON → worksheet
      const worksheet = XLSX.utils.json_to_sheet(props.ViewData.data);
  
      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "BudgetaryQuotations");
  
      // Download file
      XLSX.writeFile(
        workbook,
        `Budgetary_Quotation_Data_${new Date().toISOString().slice(0, 10)}.xlsx`
      );
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

  // DOUBLE CLICK → OPEN READ-ONLY VIEW
  const handleRowDoubleClick = (row) => {
    setViewRow(row);
    setViewDialogOpen(true);
  };


  // ===== TABLE STYLES =====
  const headerCellStyle = {
    fontWeight: 800,
    fontSize: 13,
    color: "#ecfeff",
    background:
      "linear-gradient(90deg, #0a47e0ff 0%, #1453b7ff 50%, #81a6daff 100%)",
    borderBottom: "none",
    whiteSpace: "nowrap",
  };

  const bodyCellStyle = {
    fontSize: 13,
    color: "#111827",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    overflow: "hidden",
  };

  const ellipsisCell = {
    ...bodyCellStyle,
    maxWidth: 180,
  };

  const actionHeaderStyle = {
    ...headerCellStyle,
    textAlign: "center",
  };


  
  // ---------------- FILTER + SORT LOGIC ----------------
  const filteredSortedData =
    data &&
    data
      .filter((row) => {
        const q = searchTerm.toLowerCase();
        const matchesSearch =
          !q ||
          row.tenderName?.toLowerCase().includes(q) ||
          row.customerName?.toLowerCase().includes(q) ||
          row.tenderReferenceNo?.toLowerCase().includes(q) ||
          row.bidOwner?.toLowerCase().includes(q) ||
          row.customerAddress?.toLowerCase().includes(q);

        const matchesTenderType =
          tenderTypeFilter === "all" ||
          row.tenderType?.toLowerCase() === tenderTypeFilter.toLowerCase();

        const matchesStatus =
          statusFilter === "all" ||
          row.presentStatus?.toLowerCase() === statusFilter.toLowerCase();

        return matchesSearch && matchesTenderType && matchesStatus;
      })
      .sort((a, b) => {
        let aVal;
        let bVal;

        switch (sortBy) {
          case "tenderDate":
            aVal = a.tenderDate || "";
            bVal = b.tenderDate || "";
            break;
          case "rfpDueDate":
            aVal = a.rfpDueDate || "";
            bVal = b.rfpDueDate || "";
            break;
          case "bidSubmittedOn":
            aVal = a.bidSubmittedOn || "";
            bVal = b.bidSubmittedOn || "";
            break;
          case "valueEMDInCrore":
            aVal = parseFloat(a.valueEMDInCrore) || 0;
            bVal = parseFloat(b.valueEMDInCrore) || 0;
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
      });

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
                Lead Submitted List
              </Typography>
              <Typography
                variant="body2"
                sx={{ opacity: 0.85, mt: 0.5, maxWidth: 520 }}
              >
                View, search, filter and manage all submitted tender leads in a
                single, elegant dashboard.
              </Typography>
            </Box>

            {/* SEARCH BOX */}
            <TextField
              variant="outlined"
              size="small"
              placeholder="Search by tender, customer, reference..."
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
                backgroundColor: "rgba(240,248,255,0.9)",
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
            {/* TENDER TYPE FILTER */}
            <TextField
              select
              size="small"
              label="Tender Type"
              value={tenderTypeFilter}
              onChange={handleTenderTypeFilterChange}
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
              {TENDER_TYPE_OPTIONS.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
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
              {STATUS_OPTIONS.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
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
              <MenuItem value="tenderDate">Tender Date</MenuItem>
              <MenuItem value="rfpDueDate">RFP Due Date</MenuItem>
              <MenuItem value="bidSubmittedOn">Bid Submitted On</MenuItem>
              <MenuItem value="valueEMDInCrore">EMD Value</MenuItem>
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

            <Button
              variant="contained"
              onClick={handleDownloadAllData}
              sx={{
                borderRadius: 999,
                background: "linear-gradient(135deg,#16a34a,#22c55e)",
                color: "#fff",
                textTransform: "none",
                px: 3,
                py: 0.9,
                fontWeight: 700,
                boxShadow: "0 6px 16px rgba(22,163,74,0.35)",
                "&:hover": {
                  background: "linear-gradient(135deg,#15803d,#16a34a)",
                },
              }}
            >
              Download All Data
            </Button>

            {/* RESET BUTTON */}
            <Button
              variant="outlined"
              onClick={handleResetFilters}
              startIcon={<RestartAltRounded />}
              sx={{
                ml: { xs: 0, sm: "auto" },
                borderRadius: 999,
                border: "2px solid #0E4C92",
                color: "#0E4C92",
                textTransform: "none",
                px: 3,
                py: 0.8,
                fontWeight: 600,
                backgroundColor: "rgba(255,255,255,0.85)",
                backdropFilter: "blur(6px)",
                boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
                transition: "0.2s ease",
                "&:hover": {
                  backgroundColor: "#d0eaff",
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
          maxWidth: "1800px",
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
            maxHeight: "50vh",
            minWidth: "100%",
          }}
        >
          <Table stickyHeader aria-label="lead submitted table" size="small">
             <TableHead>
            <TableRow>
              <TableCell sx={headerCellStyle}>Bq Title</TableCell>
              <TableCell sx={headerCellStyle}>Customer Name</TableCell>
              <TableCell sx={{ ...headerCellStyle, minWidth: 200 }}>
                Customer Address
              </TableCell>
              <TableCell sx={headerCellStyle}>Lead Owner</TableCell>
              <TableCell sx={headerCellStyle}>Defence / Non Defence</TableCell>
              <TableCell sx={headerCellStyle}>Estimate (CR, w/o GST)</TableCell>
              <TableCell sx={headerCellStyle}>
                Submitted (CR, w/o GST)
              </TableCell>
              <TableCell sx={headerCellStyle}>Letter Submission Date</TableCell>
              <TableCell sx={headerCellStyle}>Reference No</TableCell>
              <TableCell sx={headerCellStyle}>Competitors</TableCell>
              <TableCell sx={headerCellStyle}>Remarks</TableCell>
              <TableCell sx={headerCellStyle}>Present Status</TableCell>
              <TableCell sx={headerCellStyle}>Created Date</TableCell>
              <TableCell sx={actionHeaderStyle}>Actions</TableCell>
            </TableRow>
          </TableHead>

            <TableBody>
              {filteredSortedData && filteredSortedData.length > 0 ? (
                filteredSortedData.map((row) => (
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
                      {row.tenderName}
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
                      {row.bidOwner}
                    </TableCell>

                    <TableCell align="left" sx={{ fontSize: 13 }}>
                      {row.tenderDate}
                    </TableCell>

                    <TableCell align="left" sx={{ fontSize: 13 }}>
                      {row.rfpReceivedOn}
                    </TableCell>

                    <TableCell align="left" sx={{ fontSize: 13 }}>
                      {row.valueEMDInCrore}
                    </TableCell>

                    <TableCell align="left" sx={{ fontSize: 13 }}>
                      {row.rfpDueDate}
                    </TableCell>

                    <TableCell align="left" sx={{ fontSize: 13 }}>
                      {row.dmktgInPrincipalApprovalRxdOn}
                    </TableCell>

                    <TableCell align="left" sx={{ fontSize: 13 }}>
                      {row.sellingPriceApprovalInitiatedOn}
                    </TableCell>

                    <TableCell align="left" sx={{ fontSize: 13 }}>
                      {row.bidSubmittedOn}
                    </TableCell>

                    <TableCell align="left" sx={{ fontSize: 13 }}>
                      {row.approvalSBUFinanceOn}
                    </TableCell>

                    <TableCell align="left" sx={{ fontSize: 13 }}>
                      {row.approvalGMOn}
                    </TableCell>

                    <TableCell align="left" sx={{ fontSize: 13 }}>
                      {row.sentToFinanceGMDmktgApprovalRxdOn}
                    </TableCell>

                    <TableCell align="left" sx={{ fontSize: 13 }}>
                      {row.dmktgApprovalRxdOn}
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
                      {row.tenderReferenceNo}
                    </TableCell>

                    <TableCell align="left" sx={{ fontSize: 13 }}>
                      {row.tenderType}
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
                      {row.website}
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
                            row.presentStatus === "Lost"
                              ? "rgba(248,113,113,0.18)"
                              : row.presentStatus === "In Progress" ||
                                row.presentStatus === "Under Review"
                              ? "rgba(234,179,8,0.18)"
                              : row.presentStatus === "Won"
                              ? "rgba(52,211,153,0.18)"
                              : "rgba(148,163,184,0.25)",
                          color:
                            row.presentStatus === "Lost"
                              ? "#b91c1c"
                              : row.presentStatus === "In Progress" ||
                                row.presentStatus === "Under Review"
                              ? "#92400e"
                              : row.presentStatus === "Won"
                              ? "#15803d"
                              : "#111827",
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
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={21} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" sx={{ color: "#6b7280" }}>
                      No leads found.
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
          Edit Lead Submission
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
                label="Tender Name"
                value={editingRow?.tenderName || ""}
                onChange={(e) =>
                  handleEditFieldChange("tenderName", e.target.value)
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
                label="Bid Owner"
                value={editingRow?.bidOwner || ""}
                onChange={(e) =>
                  handleEditFieldChange("bidOwner", e.target.value)
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
                label="Tender Date"
                value={editingRow?.tenderDate || ""}
                onChange={(e) =>
                  handleEditFieldChange("tenderDate", e.target.value)
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
                type="date"
                label="RFP Received On"
                value={editingRow?.rfpReceivedOn || ""}
                onChange={(e) =>
                  handleEditFieldChange("rfpReceivedOn", e.target.value)
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
                type="date"
                label="RFP Due Date"
                value={editingRow?.rfpDueDate || ""}
                onChange={(e) =>
                  handleEditFieldChange("rfpDueDate", e.target.value)
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
                label="EMD Value (Cr)"
                value={editingRow?.valueEMDInCrore || ""}
                onChange={(e) =>
                  handleEditFieldChange("valueEMDInCrore", e.target.value)
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
                label="Tender Reference No"
                value={editingRow?.tenderReferenceNo || ""}
                onChange={(e) =>
                  handleEditFieldChange("tenderReferenceNo", e.target.value)
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
                label="Tender Type"
                value={editingRow?.tenderType || ""}
                onChange={(e) =>
                  handleEditFieldChange("tenderType", e.target.value)
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
                {TENDER_TYPE_OPTIONS.map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Website"
                value={editingRow?.website || ""}
                onChange={(e) =>
                  handleEditFieldChange("website", e.target.value)
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
                {STATUS_OPTIONS.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
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

       {/* READ-ONLY VIEW DIALOG */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          Budgetary Quotation – View Only
        </DialogTitle>

        <DialogContent dividers>
          {viewRow && (
            <Grid container spacing={2}>
              {Object.entries(viewRow).map(([key, value]) => (
                <Grid item xs={6} key={key}>
                  <TextField
                    label={key}
                    value={value ?? ""}
                    fullWidth
                    size="small"
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </DialogContent>

        <DialogActions>
          <Button variant="contained" onClick={() => setViewDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

// ---------------------------------------------------------------------------
// VIEW COMPONENT WITH SEARCH + FILTERS + SORT + EDIT / DELETE
// ---------------------------------------------------------------------------

function ExcelUploadAndValidate({ user, ServerIp }) {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [excelData, setExcelData] = useState([]);

  const DB_COLUMNS = [
    "tenderName",
    "customerName",
    "customerAddress",
    "tenderDate",
    "bidOwner",
    "rfpReceivedOn",
    "valueEMDInCrore",
    "rfpDueDate",
    "dmktgInPrincipalApprovalRxdOn",
    "sellingPriceApprovalInitiatedOn",
    "bidSubmittedOn",
    "approvalSBUFinanceOn",
    "approvalGMOn",
    "sentToFinanceGMDmktgApprovalRxdOn",
    "dmktgApprovalRxdOn",
    "tenderReferenceNo",
    "tenderType",
    "website",
    "presentStatus",
    // user info
    "OperatorId",
    "OperatorName",
    "OperatorRole",
    "OperatorSBU",
  ];

  const DB_COLUMNS_MATCH = [
    "tenderName",
    "customerName",
    "customerAddress",
    "tenderDate",
    "bidOwner",
    "rfpReceivedOn",
    "valueEMDInCrore",
    "rfpDueDate",
    "dmktgInPrincipalApprovalRxdOn",
    "sellingPriceApprovalInitiatedOn",
    "bidSubmittedOn",
    "approvalSBUFinanceOn",
    "approvalGMOn",
    "sentToFinanceGMDmktgApprovalRxdOn",
    "dmktgApprovalRxdOn",
    "tenderReferenceNo",
    "tenderType",
    "website",
    "presentStatus",
  ];

  // ----------------------------
  // HANDLE FILE UPLOAD
  // ----------------------------
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setError("");
    setSuccess("");

    //your columns to check space

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Convert Excel to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (jsonData.length === 0) {
        setError("Excel file is empty.");
        return;
      }

      const excelColumns = jsonData[0].map((col) => col.toString().trim());

      // Validate columns
      const missing = DB_COLUMNS_MATCH.filter(
        (col) => !excelColumns.includes(col)
      );
      const extra = excelColumns.filter(
        (col) => !DB_COLUMNS_MATCH.includes(col)
      );

      if (missing.length > 0 || extra.length > 0) {
        setError(
          `Column mismatch!
          Missing : ${missing.join(", ") || "None"}; 
          Extra : ${extra.join(", ") || "None"}`
        );
        return;
      }

      // Remove header & extract data rows

      console.log("jsonData from browse", jsonData);
      const rows = jsonData.slice(1).map((row) => {
        const rowObj = {};
        DB_COLUMNS.forEach((col, index) => {
          // if (col==="") {
          //   setError(`This field is blank`)
          //   return;
          // }
          if (col === "OperatorId") {
            rowObj[col] = user?.id || "291536";
            return;
          }

          if (col === "OperatorName") {
            rowObj[col] = user?.username;
            return;
          }

          if (col === "OperatorRole") {
            rowObj[col] = user?.userRole;
            return;
          }

          if (col === "OperatorSBU") {
            rowObj[col] = "Software SBU";
            return;
          } else {
            rowObj[col] = row[index] || "";
          }
        });
        return rowObj;
      });

      setExcelData(rows);
      setSuccess(`File validated successfully. Total rows: ${rows.length}`);
    };
    console.log(excelData);

    reader.readAsArrayBuffer(file);
  };

  // ----------------------------
  // SEND TO BACKEND
  // ----------------------------
  const handleUploadToServer = async () => {
    if (excelData.length === 0) {
      setError("No valid data found to upload.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    // setExcelData(...excelData, {
    //   OperatorId: user.id || "291536",
    //   OperatorName: user.username || "Vivek Kumar Singh",
    //   OperatorRole: user.userRole || "Lead Owner",
    //   OperatorSBU: "Software SBU",
    // })

    // VIEW FINALLY THE DATA IS GOING TO BACKEND
    console.log(
      "VIEW FINAL DATA IS GOING INTO BACKEND : ",
      excelData,
      "ServerIP : ",
      ServerIp
    );

    // HERE WE ARE CALLING THE API TO BULK UPLOAD
    axios
      .post(ServerIp + "/leadSubmittedBulkUpload", { excelData })
      .then((response) => {
        console.log("Server response : ", response);
        if (response) {
          setSuccess("Data successfully pushed into the database!");
        } else {
          setError(response?.data || "Failed to upload data.");
        }
      })
      .catch((error) => {
        console.log(error.message);
        setError("Server error: " + error.message);
      })
      .finally(() => {
        console.log(" finally is hitted");
      });

    setLoading(false);
  };

  return (
    <Box
      sx={{
        minHeight: "65vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #eef5ff 0%, #f8fbff 100%)",
        borderRadius: 4,
        p: 3,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          width: "100%",
          maxWidth: 720,
          p: 4,
          borderRadius: 4,
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 20px 45px rgba(0,0,0,0.12)",
        }}
      >
        {/* TITLE */}
        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            textAlign: "center",
            color: "#0d47a1",
            mb: 1,
          }}
        >
          Upload Budgetary Quotation Data
        </Typography>

        <Typography
          variant="body2"
          sx={{
            textAlign: "center",
            color: "#64748b",
            mb: 3,
          }}
        >
          Upload Excel file (.xlsx / .xls) to bulk insert records into the
          system
        </Typography>

        {/* UPLOAD BOX */}
        <Box
          sx={{
            border: "2px dashed #93c5fd",
            borderRadius: 4,
            p: { xs: 4, sm: 6 }, // ⬅️ MORE INNER SPACE
            minHeight: 280, // ⬅️ INCREASED HEIGHT

            textAlign: "center",
            background: "linear-gradient(180deg, #f8fbff 0%, #eef5ff 100%)",
            transition: "all 0.25s ease",
            "&:hover": {
              background: "linear-gradient(180deg, #eef5ff 0%, #e0f2fe 100%)",
              borderColor: "#3b82f6",
              boxShadow: "0 10px 30px rgba(59,130,246,0.15)",
            },
          }}
        >
          {/* ICON */}
          <Box
            sx={{
              fontSize: 58,
              color: "#3b82f6",
              mb: 1,
              transition: "transform 0.25s ease",
              "&:hover": {
                transform: "scale(1.1)",
              },
            }}
          >
            ☁️
          </Box>

          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 700, color: "#0f172a", mb: 0.5 }}
          >
            Drag & drop your file here
          </Typography>

          <Typography variant="body2" sx={{ color: "#64748b", mb: 2 }}>
            or click to browse (.xlsx or .xls)
          </Typography>

          {/* BROWSE FILE BUTTON */}
          <Button
            variant="contained"
            component="label"
            sx={{
              borderRadius: 999,
              px: 4,
              py: 1.2,
              fontWeight: 700,
              fontSize: 14,
              textTransform: "none",
              color: "#ffffff",

              background:
                "linear-gradient(135deg, #42a5f5 0%, #2563eb 50%, #1e40af 100%)",
              boxShadow: "0 8px 22px rgba(37,99,235,0.35)",

              transition: "all 0.25s ease",

              "&:hover": {
                background:
                  "linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #1d4ed8 100%)",
                boxShadow: "0 14px 32px rgba(37,99,235,0.45)",
                transform: "translateY(-2px) scale(1.03)",
              },

              "&:active": {
                transform: "scale(0.96)",
                boxShadow: "0 6px 14px rgba(37,99,235,0.35)",
              },
            }}
          >
            📁 Browse File
            <input
              type="file"
              accept=".xlsx,.xls"
              hidden
              onChange={handleFileUpload}
            />
          </Button>
        </Box>

        {/* STATUS MESSAGES */}
        {error && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mt: 3 }}>
            {success}
          </Alert>
        )}

        {/* PUSH BUTTON (UNCHANGED LOGIC) */}
        {excelData.length > 0 && (
          <Box
            sx={{
              mt: 4,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Button
              variant="contained"
              color="success"
              size="large"
              onClick={handleUploadToServer}
              disabled={loading}
              sx={{
                px: 5,
                py: 1.4,
                borderRadius: 999,
                fontWeight: 700,
                textTransform: "none",
                boxShadow: "0 8px 20px rgba(22,163,74,0.35)",
              }}
            >
              {loading ? (
                <CircularProgress size={26} sx={{ color: "#fff" }} />
              ) : (
                "Push Data to Database"
              )}
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default LeadSubmittedForm;
