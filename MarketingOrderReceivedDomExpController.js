import db from "../models/index.js";
const MarketingOrderReceivedDomExp = db.MarketingOrderReceivedDomExp;

import multer from "multer";
import path from "path";
import fs from "fs";

/* =========================================================
   FILE UPLOAD CONFIG
   ========================================================= */

// ABSOLUTE UPLOAD DIRECTORY
const UPLOAD_DIR = "C:/FileUploads";

// CREATE FOLDER IF NOT EXISTS
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// MULTER STORAGE
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  },
});

// MULTER INSTANCE
const upload = multer({
  storage,
  limits: { fileSize: 1000 * 1024 * 1024 }, // 1000 MB
});

/* =========================================================
   UPDATE ORDER RECEIVED
   ========================================================= */

export const UpdateOrderReceivedData = async (req, res) => {
  try {
    const { purchaseOrder } = req.params;

    const [updated] = await MarketingOrderReceivedDomExp.update(req.body, {
      where: { purchaseOrder },
    });

    if (updated === 0) {
      return res.status(404).json({ message: "Record not found" });
    }

    res.json({
      success: true,
      message: "Order updated successfully",
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: "Update failed" });
  }
};

/* =========================================================
   DELETE ORDER RECEIVED
   ========================================================= */

export const DeleteOrderReceivedData = async (req, res) => {
  try {
    const { purchaseOrder } = req.params;

    const deleted = await MarketingOrderReceivedDomExp.destroy({
      where: { purchaseOrder },
    });

    if (deleted === 0) {
      return res.status(404).json({ message: "Record not found" });
    }

    res.json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "Delete failed" });
  }
};

/* =========================================================
   BULK CREATE (EXCEL UPLOAD)
   ========================================================= */

export const CreateMarketingOrderReceivedDomExpBulk = async (req, res) => {
  try {
    const BulkData = req.body.excelData;

    const insertedRecords =
      await MarketingOrderReceivedDomExp.bulkCreate(BulkData, {
        validate: true,
      });

    res.status(200).json({
      success: true,
      data: insertedRecords,
      message: "All records inserted successfully",
      error: {},
    });
  } catch (error) {
    console.error("Bulk insert error:", error);

    if (error.name === "SequelizeUniqueConstraintError") {
      res.status(400).json({
        success: false,
        data: [],
        message: "Duplicate key value violates unique constraint",
        error,
      });
    } else {
      res.status(500).json({
        success: false,
        data: [],
        message: "An error occurred",
        error,
      });
    }
  }
};

/* =========================================================
   GET ALL ORDER RECEIVED DATA
   ========================================================= */

export const GetOrderReceivedData = (req, res) => {
  MarketingOrderReceivedDomExp.findAll({ raw: true })
    .then((data) => res.json({ data }))
    .catch((err) => {
      console.error(err);
      res.json({ data: [] });
    });
};

/* =========================================================
   CREATE ORDER RECEIVED DATA
   ========================================================= */

export const CreateGetOrderReceivedData = (req, res) => {
  const OrderReceivedReqData = {
    contractName: req.body.contractName,
    customerName: req.body.customerName,
    customerAddress: req.body.customerAddress,
    orderReceicedDate: req.body.orderReceivedDate,
    purchaseOrder: req.body.purchaseOrder,
    typeOfTender: req.body.typeOfTender,
    valueWithoutGST: req.body.valueWithoutGST,
    valueWithGST: req.body.valueWithGST,
    JSON_competitors: req.body.JSON_competitors,
    remarks: req.body.remarks,
    contractCopy: req.body.attachment,
    submittedAt: req.body.submittedAt,

    OperatorId: req.body.OperatorId,
    OperatorName: req.body.OperatorName,
    OperatorRole: req.body.OperatorRole,
    OperatorSBU: req.body.OperatorSBU,

    FileName: req.body.fileName,
    FilePath: req.body.filePath,
    HardDiskFileName: req.body.hardDiskFileName,
    Dom_or_Export: req.body.Dom_or_Export,
  };

  MarketingOrderReceivedDomExp.create(OrderReceivedReqData)
    .then((data) => res.send(data))
    .catch((err) => {
      console.error("Create error:", err);
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while creating OrderReceived data.",
      });
    });
};

/* =========================================================
   FILE UPLOAD API
   ========================================================= */

export const UploadPdfFile = (req, res) => {
  upload.array("files", 10)(req, res, function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const uploadedFiles = req.files.map((file) => ({
      originalName: file.originalname,
      savedName: file.filename,
      filePath: file.path, // C:\FileUploads\filename
      size: file.size,
    }));

    res.status(200).json(uploadedFiles);
  });
};
