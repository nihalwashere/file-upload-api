const express = require("express");
const { nanoid } = require("nanoid");
const FilesModel = require("../models/Files");
const { UserRoles } = require("../constants/UserRoles");
const { validateToken } = require("../utils/common");
const { uploadFile, deleteFile } = require("../utils/aws");
const { CLOUDFRONT_DISTRIBUTION_ID } = require("../utils/config");
const { INTERNAL_SERVER_ERROR_MESSAGE } = require("../utils/constants");
const logger = require("../utils/logger");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const token = await validateToken(req.headers);

    if (token.error) {
      return res
        .status(token.status)
        .json({ success: false, message: token.message });
    }

    const {
      user: { _id: userId, role },
    } = token;

    const filter = {};

    if (role === UserRoles.MEMBER) {
      filter.user = userId;
    }

    const files = await FilesModel.find(filter).populate("user");

    return res.status(200).json({ success: true, data: files });
  } catch (error) {
    logger.error("GET /files -> error : ", error);
    return res
      .status(500)
      .json({ success: false, message: INTERNAL_SERVER_ERROR_MESSAGE });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const token = await validateToken(req.headers);

    if (token.error) {
      return res
        .status(token.status)
        .json({ success: false, message: token.message });
    }

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Id is required.",
      });
    }

    const file = await FilesModel.findOne({ _id: id }).populate("user");

    return res.status(200).json({ success: true, data: file });
  } catch (error) {
    logger.error("GET /files/:id -> error : ", error);
    return res
      .status(500)
      .json({ success: false, message: INTERNAL_SERVER_ERROR_MESSAGE });
  }
});

router.post("/", async (req, res) => {
  try {
    const token = await validateToken(req.headers);

    if (token.error) {
      return res
        .status(token.status)
        .json({ success: false, message: token.message });
    }

    const { userId } = token;

    const { fileName, fileBase64, fileContentType, fileDescription } = req.body;

    const payload = {
      fileName,
      fileContentType,
      fileDescription,
      user: userId,
    };

    if (fileBase64) {
      const uploadedFile = await uploadFile({
        key: nanoid(),
        body: Buffer.from(
          fileBase64.replace(/^data:image\/\w+;base64,/, ""),
          "base64"
        ),
        contentType: fileContentType,
      });

      logger.debug("uploadedFile : ", uploadedFile);

      if (uploadedFile && uploadedFile.Key) {
        payload.fileKey = uploadedFile.Key;

        const cloudfrontUrl = `https://${CLOUDFRONT_DISTRIBUTION_ID}.cloudfront.net/${uploadedFile.Key}`;

        payload.fileUrl = cloudfrontUrl;
      }
    }

    await new FilesModel(payload).save();

    return res.status(200).json({
      success: true,
      message: "File uploaded successfully.",
    });
  } catch (error) {
    logger.error("POST /files -> error : ", error);
    return res
      .status(500)
      .json({ success: false, message: INTERNAL_SERVER_ERROR_MESSAGE });
  }
});

router.put("/", async (req, res) => {
  try {
    const token = await validateToken(req.headers);

    if (token.error) {
      return res
        .status(token.status)
        .json({ success: false, message: token.message });
    }

    const {
      fileName = null,
      fileBase64 = null,
      fileContentType = null,
      fileDescription,
      id,
    } = req.body;

    const file = await FilesModel.findById(id);

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "File does not exist.",
      });
    }

    const payload = {
      fileDescription,
    };

    if (fileBase64) {
      const uploadedFile = await uploadFile({
        key: file.fileKey,
        body: Buffer.from(
          fileBase64.replace(/^data:image\/\w+;base64,/, ""),
          "base64"
        ),
        contentType: fileContentType,
      });

      logger.debug("uploadedFile : ", uploadedFile);

      if (uploadedFile && uploadedFile.Key) {
        const cloudfrontUrl = `https://${CLOUDFRONT_DISTRIBUTION_ID}.cloudfront.net/${uploadedFile.Key}`;

        payload.fileUrl = cloudfrontUrl;
        payload.fileKey = uploadedFile.Key;
        payload.fileName = fileName;
        payload.fileContentType = fileContentType;
      }
    }

    await FilesModel.findOneAndUpdate({ _id: id }, payload);

    return res.status(200).json({
      success: true,
      message: "File updated successfully.",
    });
  } catch (error) {
    logger.error("PUT /files -> error : ", error);
    return res
      .status(500)
      .json({ success: false, message: INTERNAL_SERVER_ERROR_MESSAGE });
  }
});

router.delete("/", async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Id is required.",
      });
    }

    const file = await FilesModel.findById(id);

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "File does not exist.",
      });
    }

    const response = await deleteFile(file.fileKey);

    await FilesModel.findOneAndRemove({ fileKey: file.fileKey });

    return res.status(200).json({
      success: true,
      message: "File deleted successfully.",
    });
  } catch (error) {
    logger.error("DELETE /files -> error : ", error);
    return res
      .status(500)
      .json({ success: false, message: INTERNAL_SERVER_ERROR_MESSAGE });
  }
});

module.exports = router;
