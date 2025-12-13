import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
//import "../css/Form.css";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Box,
  Divider,
  Alert,
  Snackbar,
  Card,
  CardContent,
  // Select,
  // InputLabel,
  // FormControl,
  // OutlinedInput,
  // Checkbox,
  // ListItemText,
  // IconButton,
  Tabs,
  Tab,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Table,
  CircularProgress,
  // InputLabel,
  // FormControl,
  // Select,
  // OutlinedInput,
  // ListItemText,
  // Checkbox,
} from "@mui/material";
//import DeleteIcon from "@mui/icons-material/Delete";
//import { useForm, Controller } from "react-hook-form";
import axios from "axios";
//import DataTableView from "../../dec2/common/DataTableView";
import * as XLSX from "xlsx";


const multilineProps = { multiline: true, rows: 2 };

const tenderTypeOptions = ["ST", "MT", "LT"];
const civilDefenceOptions = ["Civil", "Defence"];
const businessDomainOptions = [
  "IT",
  "Electronics",
  "Telecom",
  "Construction",
  "Other",
];
const documentTypeOptions = [
  "RFP",
  "RFI",
  "RFE",
  "EoI",
  "BQ",
  "ST",
  "NIT",
  "RFQ",
];


const resultStatusOptions = [
  "Won",
  "Lost",
  "Participated",
  "Participated-Won",
  "Participated-Pursuing",
  "Participated-Lost",
  "Not Participated",
];

const openClosedOptions = ["Open", "Closed"];

const presentStatusOptions = [
  "BQ Submitted",
  "Commercial Bid Submitted",
  "EOI was submitted",
  "Not participated",
  " ",
];

const ExportLeadForm = () => {
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [value, setValue] = useState(0);
  const [orderData, setOrderData] = useState([]);
  const [ServerIp, SetServerIp] = useState("");

  const API = "/getExportLead";

  let user = JSON.parse(localStorage.getItem("user"));
  console.log(" user object ", user);

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


  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      tenderName: "",
      tenderReferenceNo: "",
      customerName: "",
      customerAddress: "",
      tenderType: "",
      documentType: "",
      leadOwner: "",
      civilOrDefence: "",
      businessDomain: "",
      valueOfEMD: "",
      estimatedValueInCrWithoutGST: "",
      submittedValueInCrWithoutGST: "",
      tenderDated: "",
      lastDateOfSub: "",
      soleOrConsortium: "",
      prebidMeetingDateTime: "",
      competitorsInfo: "",
      wonLostParticipated: "",
      openClosed: "",
      orderWonValueInCrWithoutGST: "",
      presentStatus: "",
      reasonForLossingOpp: "",
      corrigendumsDateFile: "",
    },
  });

  const onSubmit = (data) => {
    console.log("Raw Form Data:", data);
    // Convert string numbers to actual numbers with 2 decimal precision
    const formattedData = {
      tenderName: data.tenderName,
      tenderReferenceNo: data.tenderReferenceNo,
      customerName: data.customerName,
      customerAddress: data.customerAddress,
      //classification: data.classification,
      tenderType: data.tenderType,
      documentType: data.documentType,
      leadOwner: data.leadOwner,
      civilOrDefence: data.civilOrDefence,
      businessDomain: data.businessDomain,
      valueOfEMD: data.valueOfEMD,
      estimatedValueInCrWithoutGST:
        data.estimatedValueInCrWithoutGST !== ""
          ? parseFloat(parseFloat(data.estimatedValueInCrWithoutGST).toFixed(5))
          : null,
      submittedValueInCrWithoutGST:
        data.submittedValueInCrWithoutGST !== ""
          ? parseFloat(parseFloat(data.submittedValueInCrWithoutGST).toFixed(5))
          : null,
      // estimatedValueInCrWithoutGST: parseFloat(
      //   parseFloat(data.estimatedValueInCrWithoutGST).toFixed(2)
      // ),
      // submittedValueInCrWithoutGST: parseFloat(
      //   parseFloat(data.submittedValueInCrWithoutGST).toFixed(2)
      // ),
      tenderDated: data.tenderDated,
      lastDateOfSub: data.lastDateOfSub,
      soleOrConsortium: data.soleOrConsortium,
      prebidMeetingDateTime: data.prebidMeetingDateTime,
      competitorsInfo: data.competitorsInfo,
      wonLostParticipated: data.wonLostParticipated,
      openClosed: data.openClosed,
      orderWonValueInCrWithoutGST: data.orderWonValueInCrWithoutGST,
      presentStatus: data.presentStatus,
      reasonForLossingOpp: data.reasonForLossingOpp,
      corrigendumsDateFile: data.corrigendumsDateFile,
      submittedAt: new Date().toISOString(),
      OperatorId: user.id || "291536",
      OperatorName: user.username || "Vivek Kumar Singh",
      OperatorRole: user.userRole || "Lead Owner",
      OperatorSBU: "Software SBU",
    };

    console.log("Frontend Form Data:", JSON.stringify(formattedData, null, 2));

    // console.log(
    //   "Budgetary Quotation Data:",
    //   JSON.stringify(formattedData, null, 2)
    // );
    axios
      .post(ServerIp, formattedData)
      .then((response) => {
        // console.log("formattedData after ")
        console.log("Server Response:", response.data);
        // setOrderData(response.data);
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
      link.download = `domestic-leads-${
        submittedData.serialNumber
      }-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <Container
      maxWidth="xl"
      // disableGutters
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

      {value === 0 && (
        <Container maxWidth="lg">
       <Paper
            elevation={10}
            sx={{
              p: { xs: 2, md: 5 },
              borderRadius: 5,
              background: "rgba(255,255,255,0.85)",
              backdropFilter: "blur(14px)",
              // transition: "0.3s",
              boxShadow: "0 12px 32px rgba(0,0,0,0.10)",
              // "&:hover": { transform: "scale(1.01)" },
            }}
          >
          <Box sx={{ textAlign: "center", mb: 5 }}>
            <Typography variant="h3"
                sx={{
                  fontWeight: 900,
                  background:
                    "linear-gradient(45deg, #0d47a1, #42a5f5, #1e88e5)",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}>
              Export Leads Form
            </Typography>
            <Typography variant="subtitle1"
                sx={{ opacity: 0.7, mt: 1, fontWeight: 500 }}>
              Fill all details below to submit the tender form
            </Typography>
          </Box>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* SECTION 1 */}
            <Card sx={{
                  mb: 4,
                  p: 3,
                  borderRadius: 4,
                  background: "rgba(250,250,255,0.8)",
                  backdropFilter: "blur(10px)",
                  transition: "0.3s",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
                  // "&:hover": {
                  //   transform: "translateY(-4px)",
                  //   boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
                  // },
                }}>
              
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 800, color: "#0d47a1", mb: 2 }}
                >
                  📌 Export Leads Form
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={3}>
                  {[
                    ["tenderName", "Tender Name"],
                    ["tenderReferenceNo", "Tender Reference No"],
                    ["customerName", "Customer Name"],
                    ["customerAddress", "Customer Address"],
                  ].map(([name, label]) => (
                    <Grid item xs={12} md={4} key={name}>
                      <Controller
                        name={name}
                        control={control}
                        rules={{ required: `${label} is required` }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label={label}
                            className="text-field-style"
                            {...multilineProps}
                            error={!!errors[name]}
                            helperText={errors[name]?.message}
                          />
                        )}
                      />
                    </Grid>
                  ))}

                  {/* Tender Type */}
                  <Grid item xs={12} md={4}>
                    <Controller
                      name="tenderType"
                      control={control}
                      rules={{ required: "Tender Type is required" }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          select
                          fullWidth
                          label="Tender Type"
                          className="text-field-style"
                          {...multilineProps}
                          error={!!errors.tenderType}
                          helperText={errors.tenderType?.message}
                        >
                          {tenderTypeOptions.map((item) => (
                            <MenuItem key={item} value={item}>
                              {item}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
                  </Grid>
                </Grid>
            </Card>

            {/* SECTION 2 */}
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
                  🏷️ Classification & Financial Details
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={3}>
                  {/* Document Type */}
                  <Grid item xs={12} md={4}>
                    <Controller
                      name="documentType"
                      control={control}
                      rules={{ required: "Document Type is required" }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          select
                          fullWidth
                          label="Document Type"
                          className="text-field-style"
                          {...multilineProps}
                          error={!!errors.documentType}
                          helperText={errors.documentType?.message}
                        >
                          {documentTypeOptions.map((item) => (
                            <MenuItem key={item} value={item}>
                              {item}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
                  </Grid>

                  {/* Lead Owner (Multi-select) */}
                  <Grid item xs={12} md={4}>
                    <Controller
                      name="leadOwner"
                      control={control}
                      rules={{ required: "Lead Owner is required" }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Lead Owner"
                          className="text-field-style"
                          {...multilineProps}
                          error={!!errors.soleConsortium}
                          helperText={errors.soleConsortium?.message}
                        />
                      )}
                    />
                  </Grid>

                  {/* Civil / Defence */}
                  <Grid item xs={12} md={4}>
                    <Controller
                      name="civilOrDefence"
                      control={control}
                      rules={{
                        required: "Civil / Defence selection is required",
                      }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          select
                          fullWidth
                          label="Civil / Defence"
                          className="text-field-style"
                          {...multilineProps}
                          error={!!errors.civilDefence}
                          helperText={errors.civilDefence?.message}
                        >
                          {civilDefenceOptions.map((item) => (
                            <MenuItem key={item} value={item}>
                              {item}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
                  </Grid>

                  {/* Business Domain */}
                  <Grid item xs={12} md={4}>
                    <Controller
                      name="businessDomain"
                      control={control}
                      rules={{ required: "Business Domain is required" }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          select
                          fullWidth
                          label="Business Domain"
                          className="text-field-style"
                          {...multilineProps}
                          error={!!errors.businessDomain}
                          helperText={errors.businessDomain?.message}
                        >
                          {businessDomainOptions.map((item) => (
                            <MenuItem key={item} value={item}>
                              {item}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
                  </Grid>
                </Grid>
            </Card>

            {/* SECTION 2 */}
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
                  📊 Values
                </Typography>
                <Divider sx={{ mb: 3 }} />

                {/* Competitors dynamic fields */}
                <Grid container spacing={3}>
                  {/* EMD Value */}
                  <Grid item xs={12} md={4}>
                    <Controller
                      name="valueOfEMD"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          //  type="number"
                          label="value of EMD"
                          className="text-field-style"
                          sx={{ width: "100%" }}
                          {...multilineProps}
                        />
                      )}
                    />
                  </Grid>

                  {/* Estimate Value in Cr without GST */}
                  <Grid item xs={12} md={4}>
                    <Controller
                      name="estimatedValueInCrWithoutGST"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          //  type="number"
                          label="Estimate Value in Cr without GST"
                          className="text-field-style"
                          sx={{ width: "100%" }}
                          {...multilineProps}
                        />
                      )}
                    />
                  </Grid>

                  {/* Submitted Value in Cr without GST */}
                  <Grid item xs={12} md={4}>
                    <Controller
                      name="submittedValueInCrWithoutGST"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          //  type="number"
                          label="Submitted Value in Cr without GST"
                          className="text-field-style"
                          sx={{ width: "100%" }}
                          {...multilineProps}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
            </Card>

            {/* SECTION 3 */}
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
                  🗓️ Submission Timeline
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={3}>
                  {[
                    ["tenderDated", "Tender Dated"],
                    ["lastDateOfSub", "Last Date of Submission"],
                  ].map(([name, label]) => (
                    <Grid item xs={12} md={4} key={name}>
                      <Controller
                        name={name}
                        control={control}
                        rules={{ required: `${label} is required` }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            type="date"
                            fullWidth
                            label={label}
                            InputLabelProps={{ shrink: true }}
                            className="text-field-style"
                            error={!!errors[name]}
                            helperText={errors[name]?.message}
                          />
                        )}
                      />
                    </Grid>
                  ))}

                  {/* Sole / Consortium */}
                  <Grid item xs={12} md={4}>
                    <Controller
                      name="soleOrConsortium"
                      control={control}
                      rules={{ required: "Sole / Consortium is required" }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Sole / Consortium"
                          className="text-field-style"
                          {...multilineProps}
                          error={!!errors.soleConsortium}
                          helperText={errors.soleConsortium?.message}
                        />
                      )}
                    />
                  </Grid>

                  {/* Pre-bid Date */}
                  <Grid item xs={12} md={4}>
                    <Controller
                      name="prebidMeetingDateTime"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          type="datetime-local"
                          fullWidth
                          label="Pre-Bid Meeting Date & Time"
                          InputLabelProps={{ shrink: true }}
                          className="text-field-style"
                        />
                      )}
                    />
                  </Grid>
                </Grid>
            </Card>

            {/* SECTION 4 */}
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
                  📊 Competitors & Results
                </Typography>
                <Divider sx={{ mb: 3 }} />

                {/* Competitors dynamic fields */}
                <Grid item xs={12} md={10}>
                  <Controller
                    name="competitorsInfo"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        //  type="number"
                        label="Competitors Info"
                        className="text-field-style"
                        sx={{ width: "100%" }}
                        {...multilineProps}
                      />
                    )}
                  />
                </Grid>

                {/* Result-related fields */}
                <Grid container spacing={3} sx={{ mt: 3 }}>
                  {/* Result Status */}
                  <Grid item xs={12} md={4}>
                    <Controller
                      name="wonLostParticipated"
                      control={control}
                      rules={{ required: "Result Status is required" }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          select
                          fullWidth
                          label="Won / Lost / Participated / Not Participated"
                          className="text-field-style"
                          {...multilineProps}
                          error={!!errors.resultStatus}
                          helperText={errors.resultStatus?.message}
                        >
                          {resultStatusOptions.map((item) => (
                            <MenuItem key={item} value={item}>
                              {item}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
                  </Grid>

                  {/* Open / Closed */}
                  <Grid item xs={12} md={4}>
                    <Controller
                      name="openClosed"
                      control={control}
                      rules={{ required: "Open / Closed is required" }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          select
                          fullWidth
                          label="Open / Closed"
                          className="text-field-style"
                          {...multilineProps}
                          error={!!errors.openClosed}
                          helperText={errors.openClosed?.message}
                        >
                          {openClosedOptions.map((item) => (
                            <MenuItem key={item} value={item}>
                              {item}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
                  </Grid>

                  {/* Order Won */}
                  <Grid item xs={12} md={4}>
                    <Controller
                      name="orderWonValueInCrWithoutGST"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          // type="number"
                          label="Order Won Value in Crore (without GST)"
                          className="text-field-style"
                          sx={{ width: "100%" }}
                          {...multilineProps}
                        />
                      )}
                    />
                  </Grid>

                  {/* Present Status */}
                  <Grid item xs={12} md={4}>
                    <Controller
                      name="presentStatus"
                      control={control}
                      rules={{ required: "Present Status is required" }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          select
                          fullWidth
                          label="Present Status"
                          className="text-field-style"
                          {...multilineProps}
                          error={!!errors.presentStatus}
                          helperText={errors.presentStatus?.message}
                        >
                          {presentStatusOptions.map((item) => (
                            <MenuItem key={item} value={item}>
                              {item}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
                  </Grid>
                </Grid>
            </Card>

            {/* SECTION 2 */}
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
                  📊 Reason & Info
                </Typography>
                <Divider sx={{ mb: 3 }} />

                {/* Competitors dynamic fields */}
                <Grid container spacing={3}>
                  {/* Reason  */}
                  <Grid item xs={12} md={4}>
                    <Controller
                      name="reasonForLossingOpp"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          //  type="number"
                          label="Reason for Lossing/Participated/Not Participating in this opportunity"
                          className="text-field-style"
                          sx={{ width: "100%" }}
                          {...multilineProps}
                        />
                      )}
                    />
                  </Grid>

                  {/* Estimate Value in Cr without GST */}
                  <Grid item xs={12} md={4}>
                    <Controller
                      name="corrigendumsDateFile"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          //  type="number"
                          label="Corrigendum Info"
                          className="text-field-style"
                          sx={{ width: "100%" }}
                          {...multilineProps}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
            </Card>

            {/* BUTTONS */}
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
                Submit
              </Button>
              &nbsp;&nbsp;&nbsp;
              <Button
                type="button"
                variant="outlined"
                size="large"
                className="btn-reset"
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

          {/* Snackbar */}
          <Snackbar
              open={submitSuccess}
              autoHideDuration={6000}
              onClose={handleCloseSnackbar}
              anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
            <Alert severity="success" sx={{ fontSize: "1rem" }} onClose={handleCloseSnackbar}>
              Tender submitted successfully!
            </Alert>
          </Snackbar>

          {/* JSON OUTPUT */}
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
                
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  backgroundColor: "#1e1e1e",
                  color: "#d4d4d4",
                  maxHeight: 500,
                  overflow: "auto",
                  borderRadius: 2,
                }}
              >
                <pre>{JSON.stringify(submittedData, null, 2)}</pre>
              </Paper>
            </Box>
          )}
        </Paper>
        </Container>
      )}

      {value === 1 && orderData !== undefined && (
        <ViewExportLeadData ViewData={orderData}/>
      )}

      {/* ------------------------ BULK UPLOAD ------------------------ */}
      {value === 2 && (
        <ExcelUploadAndValidate user={user} ServerIp={ServerIp} />
      )}
    </Container>
  );
};


// ------------------------------------------------------------------------
// VIEW COMPONENT WITH SEARCH + FILTERS + SORT + EDIT / DELETE
// ------------------------------------------------------------------------

function ViewExportLeadData(props) {
  console.log("props of view Export Lead : ", props.ViewData);

  return (
    <>
      {/* {console.log("rows", rows)} */}
      <Typography
        style={{
          textOverflow: "ellipsis",
          overflow: "hidden",
          whiteSpace: "nowrap",
          fontWeight: "bold",
          color: "#000",
          fontSize: "1.4rem",
          textSizeAdjust: "auto",
          textAlign: "center",
          backgroundColor: "lavender",
        }}
      >
        User Profile Created List
      </Typography>
      <TableContainer component={Paper}>
        <Table aria-label="customized table">
          <TableHead>
            <TableRow>
              <TableCell style={{ fontWeight: "bolder", fontSize: "15px" }}>
                Tender Name
              </TableCell>
              <TableCell style={{ fontWeight: "bolder", fontSize: "15px" }}>
                Tender Reference No
              </TableCell>
              <TableCell
                style={{ fontWeight: "bolder", fontSize: "15px" }}
                align="left"
              >
                Customer Name
              </TableCell>
              <TableCell
                style={{ fontWeight: "bolder", fontSize: "15px" }}
                align="left"
              >
                Customer Address
              </TableCell>
              <TableCell
                style={{ fontWeight: "bolder", fontSize: "15px" }}
                align="left"
              >
                Tender Type
              </TableCell>
              <TableCell
                style={{ fontWeight: "bolder", fontSize: "15px" }}
                align="left"
              >
                Document Type
              </TableCell>

              <TableCell
                style={{ fontWeight: "bolder", fontSize: "15px" }}
                align="left"
              >
                Lead Owner
              </TableCell>
              <TableCell
                style={{ fontWeight: "bolder", fontSize: "15px" }}
                align="left"
              >
                Civil/Defence
              </TableCell>
              <TableCell
                style={{ fontWeight: "bolder", fontSize: "15px" }}
                align="left"
              >
                Business Domain
              </TableCell>
              <TableCell
                style={{ fontWeight: "bolder", fontSize: "15px" }}
                align="left"
              >
                Value of EMD
              </TableCell>
              <TableCell
                style={{ fontWeight: "bolder", fontSize: "15px" }}
                align="left"
              >
                Estimate Value In CR Without GST
              </TableCell>
              <TableCell
                style={{ fontWeight: "bolder", fontSize: "15px" }}
                align="left"
              >
                Submitted Value In CR Without GST
              </TableCell>
              <TableCell
                style={{ fontWeight: "bolder", fontSize: "15px" }}
                align="left"
              >
                Tender Dated
              </TableCell>
              <TableCell
                style={{ fontWeight: "bolder", fontSize: "15px" }}
                align="left"
              >
                Last Date of Submission
              </TableCell>

              <TableCell
                style={{ fontWeight: "bolder", fontSize: "15px" }}
                align="left"
              >
                Sole or Consortium
              </TableCell>
              <TableCell
                style={{ fontWeight: "bolder", fontSize: "15px" }}
                align="left"
              >
                Pre-bid meeting Date & Time
              </TableCell>
              <TableCell
                style={{ fontWeight: "bolder", fontSize: "15px" }}
                align="left"
              >
                Competitors Info
              </TableCell>
              <TableCell
                style={{ fontWeight: "bolder", fontSize: "15px" }}
                align="left"
              >
                Won/Lost/Participated/Not Participated
              </TableCell>
              <TableCell
                style={{ fontWeight: "bolder", fontSize: "15px" }}
                align="left"
              >
                Open/Closed
              </TableCell>
              <TableCell
                style={{ fontWeight: "bolder", fontSize: "15px" }}
                align="left"
              >
                Order Won value in Cr without GST
              </TableCell>
              <TableCell
                style={{ fontWeight: "bolder", fontSize: "15px" }}
                align="left"
              >
                Present Status
              </TableCell>

              <TableCell
                style={{ fontWeight: "bolder", fontSize: "15px" }}
                align="left"
              >
                Reasons for losing/Participated/Not Participating in this
                opportunity
              </TableCell>
              <TableCell
                style={{ fontWeight: "bolder", fontSize: "15px" }}
                align="left"
              >
                Corrigendum Info
              </TableCell>

              {/* <TableCell style={{ fontWeight: "bolder",fontSize:'15px' }} align="left">Created date</TableCell> */}
            </TableRow>
          </TableHead>
          <TableBody>
            {props.ViewData.data?.map((row, index) => (
              <TableRow key={row.id}>
                {/* tenderName: "",
                tenderReferenceNo: "",
                customerName: "",
                customerAddress: "",
                tenderType: "",
                documentType: "",
                leadOwner: "",
                civilOrDefence: "",
                businessDomain: "",
                valueOfEMD: "",
                estimatedValueInCrWithoutGST: "",
                submittedValueInCrWithoutGST: "",
                tenderDated: "",
                lastDateOfSub: "",
                soleOrConsortium: "",
                prebidMeetingDateTime: "",
                competitorsInfo: "",
                wonLostParticipated: "",
                openClosed: "",
                orderWonValueInCrWithoutGST: "",
                presentStatus: "",
                reasonForLossingOpp: "",
                corrigendumsDateFile: "", */}
                <TableCell component="th" scope="row">
                  {row.tenderName}
                </TableCell>
                <TableCell component="th" scope="row">
                  {row.tenderReferenceNo}
                </TableCell>
                <TableCell style={{ fontSize: "14px" }} align="left">
                  {row.customerName}
                </TableCell>
                <TableCell style={{ fontSize: "14px" }} align="left">
                  {row.customerAddress}
                </TableCell>
                <TableCell style={{ fontSize: "14px" }} align="left">
                  {row.tenderType}
                </TableCell>
                <TableCell style={{ fontSize: "14px" }} align="left">
                  {row.documentType}
                </TableCell>
                <TableCell style={{ fontSize: "14px" }} align="left">
                  {row.leadOwner}
                </TableCell>
                <TableCell style={{ fontSize: "14px" }} align="left">
                  {row.civilOrDefence}
                </TableCell>
                <TableCell style={{ fontSize: "14px" }} align="left">
                  {row.businessDomain}
                </TableCell>
                <TableCell style={{ fontSize: "14px" }} align="left">
                  {row.valueOfEMD}
                </TableCell>
                <TableCell style={{ fontSize: "14px" }} align="left">
                  {row.estimatedValueInCrWithoutGST}
                </TableCell>
                <TableCell style={{ fontSize: "14px" }} align="left">
                  {row.submittedValueInCrWithoutGST}
                </TableCell>
                <TableCell style={{ fontSize: "14px" }} align="left">
                  {row.tenderDated}
                </TableCell>
                <TableCell style={{ fontSize: "14px" }} align="left">
                  {row.lastDateOfSub}
                </TableCell>
                <TableCell style={{ fontSize: "14px" }} align="left">
                  {row.soleOrConsortium}
                </TableCell>
                <TableCell style={{ fontSize: "14px" }} align="left">
                  {row.prebidMeetingDateTime}
                </TableCell>
                <TableCell style={{ fontSize: "14px" }} align="left">
                  {row.competitorsInfo}
                </TableCell>
                <TableCell style={{ fontSize: "14px" }} align="left">
                  {row.wonLostParticipated}
                </TableCell>
                <TableCell style={{ fontSize: "14px" }} align="left">
                  {row.openClosed}
                </TableCell>
                <TableCell style={{ fontSize: "14px" }} align="left">
                  {row.orderWonValueInCrWithoutGST}
                </TableCell>
                <TableCell style={{ fontSize: "14px" }} align="left">
                  {row.presentStatus}
                </TableCell>
                <TableCell style={{ fontSize: "14px" }} align="left">
                  {row.reasonForLossingOpp}
                </TableCell>
                <TableCell style={{ fontSize: "14px" }} align="left">
                  {row.corrigendumsDateFile}
                </TableCell>
                <TableCell align="left">{row.dateCreated}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
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
    "tenderReferenceNo",
    "customerName",
    "customerAddress",
    "tenderType",
    "documentType",
    "leadOwner",
    "civilOrDefence",
    "businessDomain",
    "valueOfEMD",
    "estimatedValueInCrWithoutGST",
    "submittedValueInCrWithoutGST",
    "tenderDated",
    "lastDateOfSub",
    "soleOrConsortium",
    "prebidMeetingDateTime",
    "competitorsInfo",
    "wonLostParticipated",
    "openClosed",
    "orderWonValueInCrWithoutGST",
    "presentStatus",
    "reasonForLossingOpp",
    "corrigendumsDateFile",
    // user info
    "OperatorId",
    "OperatorName",
    "OperatorRole",
    "OperatorSBU",
  ];

  const DB_COLUMNS_MATCH = [
    "tenderName",
    "tenderReferenceNo",
    "customerName",
    "customerAddress",
    "tenderType",
    "documentType",
    "leadOwner",
    "civilOrDefence",
    "businessDomain",
    "valueOfEMD",
    "estimatedValueInCrWithoutGST",
    "submittedValueInCrWithoutGST",
    "tenderDated",
    "lastDateOfSub",
    "soleOrConsortium",
    "prebidMeetingDateTime",
    "competitorsInfo",
    "wonLostParticipated",
    "openClosed",
    "orderWonValueInCrWithoutGST",
    "presentStatus",
    "reasonForLossingOpp",
    "corrigendumsDateFile",
  ];

  // ----------------------------
  // HANDLE FILE UPLOAD
  // ----------------------------
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setError("");
    setSuccess("");

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
      .post(ServerIp + "/exportLeadsBulkUpload", { excelData })
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
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "50vh",
        // border: 1,
      }}
    >
      <Paper elevation={3} sx={{ p: 6, maxWidth: 600 }}>
        <Typography variant="h5" gutterBottom>
          Upload Excel
        </Typography>

        <Button variant="contained" component="label" sx={{ mt: 2 }}>
          Select Excel File
          <input
            type="file"
            accept=".xlsx,.xls"
            hidden
            onChange={handleFileUpload}
          />
        </Button>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {success}
          </Alert>
        )}

        {/* Upload Button */}
        {excelData.length > 0 && (
          <Button
            variant="contained"
            color="success"
            sx={{ mt: 3 }}
            onClick={handleUploadToServer}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Push to Database"}
          </Button>
        )}
      </Paper>
    </Box>
  );
}

export default ExportLeadForm;
