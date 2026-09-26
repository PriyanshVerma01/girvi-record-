import GirviRecord from "../models/GirviRecord.js";
import calculateDuration from "../utils/calculateDuration.js";

// ========================================
// CREATE GIRVI RECORD
// ========================================

const createRecord = async (req, res) => {
  try {
    const {
      amount,
      name,
      mobileNumber,
      item,
      registrationDate,
      closingDate,
      otherDetails,
    } = req.body;

    // ========================================
    // REQUIRED FIELD VALIDATION
    // ========================================

    if (
      amount === undefined ||
      !name ||
      !mobileNumber ||
      !item ||
      !registrationDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Amount, name, mobile number, item and registration date are required.",
      });
    }

    // ========================================
    // MOBILE NUMBER VALIDATION
    // ========================================

    if (
      !/^[6-9][0-9]{9}$/.test(
        mobileNumber
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter a valid 10-digit mobile number.",
      });
    }

    // ========================================
    // REGISTRATION DATE VALIDATION
    // ========================================

    const registration =
      new Date(registrationDate);

    if (
      Number.isNaN(
        registration.getTime()
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid registration date.",
      });
    }

    // ========================================
    // CLOSING DATE VALIDATION
    // ========================================

    if (closingDate) {
      const closing =
        new Date(closingDate);

      if (
        Number.isNaN(
          closing.getTime()
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid closing date.",
        });
      }

      if (closing < registration) {
        return res.status(400).json({
          success: false,
          message:
            "Closing date cannot be before registration date.",
        });
      }
    }

    // ========================================
    // CREATE RECORD
    // ========================================

    const record =
      await GirviRecord.create({
        amount,
        name,
        mobileNumber,
        item,
        registrationDate,
        closingDate:
          closingDate || null,
        otherDetails:
          otherDetails || "",
        createdBy:
          req.admin._id,
      });

    // ========================================
    // CALCULATE DURATION
    // ========================================

    const duration =
      calculateDuration(
        record.registrationDate,
        record.closingDate
      );

    // ========================================
    // STATUS
    // ========================================

    const status =
      record.closingDate
        ? "CLOSED"
        : "OPEN";

    // ========================================
    // RESPONSE
    // ========================================

    return res.status(201).json({
      success: true,
      message:
        "Girvi record created successfully.",
      record: {
        ...record.toObject(),
        duration,
        status,
      },
    });
  } catch (error) {
    console.error(
      "Create record error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

// ========================================
// GET ALL GIRVI RECORDS
// SEARCH + FILTER
// ========================================

const getRecords = async (req, res) => {
  try {
    const { search, status } =
      req.query;

    const filter = {};

    // ========================================
    // CUSTOMER SEARCH
    // NAME + MOBILE + ITEM
    // ========================================

    if (search) {
      filter.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          mobileNumber: {
            $regex: search,
            $options: "i",
          },
        },
        {
          item: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    // ========================================
    // STATUS FILTER
    // ========================================

    if (status) {
      const normalizedStatus =
        status.toUpperCase();

      if (
        normalizedStatus ===
        "OPEN"
      ) {
        filter.closingDate = null;
      }

      if (
        normalizedStatus ===
        "CLOSED"
      ) {
        filter.closingDate = {
          $ne: null,
        };
      }
    }

    // ========================================
    // GET RECORDS
    // ========================================

    const records =
      await GirviRecord.find(
        filter
      ).sort({
        createdAt: -1,
      });

    // ========================================
    // ADD DURATION + STATUS
    // ========================================

    const recordsWithDetails =
      records.map((record) => {
        const duration =
          calculateDuration(
            record.registrationDate,
            record.closingDate
          );

        const recordStatus =
          record.closingDate
            ? "CLOSED"
            : "OPEN";

        return {
          ...record.toObject(),
          duration,
          status: recordStatus,
        };
      });

    // ========================================
    // RESPONSE
    // ========================================

    return res.status(200).json({
      success: true,
      count:
        recordsWithDetails.length,
      records:
        recordsWithDetails,
    });
  } catch (error) {
    console.error(
      "Get records error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

// ========================================
// GET SINGLE GIRVI RECORD
// ========================================

const getRecord = async (req, res) => {
  try {
    const record =
      await GirviRecord.findById(
        req.params.id
      );

    // ========================================
    // RECORD NOT FOUND
    // ========================================

    if (!record) {
      return res.status(404).json({
        success: false,
        message:
          "Record not found.",
      });
    }

    // ========================================
    // CALCULATE DURATION
    // ========================================

    const duration =
      calculateDuration(
        record.registrationDate,
        record.closingDate
      );

    // ========================================
    // STATUS
    // ========================================

    const status =
      record.closingDate
        ? "CLOSED"
        : "OPEN";

    // ========================================
    // RESPONSE
    // ========================================

    return res.status(200).json({
      success: true,
      record: {
        ...record.toObject(),
        duration,
        status,
      },
    });
  } catch (error) {
    console.error(
      "Get record error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

// ========================================
// UPDATE GIRVI RECORD
// ========================================

const updateRecord = async (req, res) => {
  try {
    const record =
      await GirviRecord.findById(
        req.params.id
      );

    // ========================================
    // RECORD NOT FOUND
    // ========================================

    if (!record) {
      return res.status(404).json({
        success: false,
        message:
          "Record not found.",
      });
    }

    const {
      amount,
      name,
      mobileNumber,
      item,
      registrationDate,
      closingDate,
      otherDetails,
    } = req.body;

    // ========================================
    // AMOUNT
    // ========================================

    if (amount !== undefined) {
      if (
        amount === "" ||
        Number.isNaN(Number(amount)) ||
        Number(amount) < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid amount.",
        });
      }

      record.amount = amount;
    }

    // ========================================
    // NAME
    // ========================================

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Customer name cannot be empty.",
        });
      }

      record.name = name.trim();
    }

    // ========================================
    // MOBILE NUMBER
    // ========================================

    if (
      mobileNumber !== undefined
    ) {
      if (
        !/^[6-9][0-9]{9}$/.test(
          mobileNumber
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Please enter a valid 10-digit mobile number.",
        });
      }

      record.mobileNumber =
        mobileNumber;
    }

    // ========================================
    // ITEM
    // ========================================

    if (item !== undefined) {
      if (!item.trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Item cannot be empty.",
        });
      }

      record.item = item.trim();
    }

    // ========================================
    // REGISTRATION DATE
    // ========================================

    if (
      registrationDate !==
      undefined
    ) {
      const newRegistrationDate =
        new Date(
          registrationDate
        );

      if (
        Number.isNaN(
          newRegistrationDate.getTime()
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid registration date.",
        });
      }

      record.registrationDate =
        registrationDate;
    }

    // ========================================
    // CLOSING DATE
    // ========================================

    if (
      closingDate !== undefined
    ) {
      record.closingDate =
        closingDate || null;
    }

    // ========================================
    // DATE VALIDATION AFTER UPDATE
    // ========================================

    if (record.closingDate) {
      const registration =
        new Date(
          record.registrationDate
        );

      const closing =
        new Date(
          record.closingDate
        );

      if (
        Number.isNaN(
          registration.getTime()
        ) ||
        Number.isNaN(
          closing.getTime()
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid registration or closing date.",
        });
      }

      if (closing < registration) {
        return res.status(400).json({
          success: false,
          message:
            "Closing date cannot be before registration date.",
        });
      }
    }

    // ========================================
    // OTHER DETAILS
    // ========================================

    if (
      otherDetails !==
      undefined
    ) {
      record.otherDetails =
        otherDetails;
    }

    // ========================================
    // SAVE
    // ========================================

    await record.save();

    // ========================================
    // CALCULATE NEW DURATION
    // ========================================

    const duration =
      calculateDuration(
        record.registrationDate,
        record.closingDate
      );

    // ========================================
    // STATUS
    // ========================================

    const status =
      record.closingDate
        ? "CLOSED"
        : "OPEN";

    // ========================================
    // RESPONSE
    // ========================================

    return res.status(200).json({
      success: true,
      message:
        "Girvi record updated successfully.",
      record: {
        ...record.toObject(),
        duration,
        status,
      },
    });
  } catch (error) {
    console.error(
      "Update record error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

// ========================================
// DELETE GIRVI RECORD
// ========================================

const deleteRecord = async (req, res) => {
  try {
    const record =
      await GirviRecord.findById(
        req.params.id
      );

    // ========================================
    // RECORD NOT FOUND
    // ========================================

    if (!record) {
      return res.status(404).json({
        success: false,
        message:
          "Record not found.",
      });
    }

    // ========================================
    // DELETE
    // ========================================

    await record.deleteOne();

    // ========================================
    // RESPONSE
    // ========================================

    return res.status(200).json({
      success: true,
      message:
        "Girvi record deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete record error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

// ========================================
// GET GIRVI STATISTICS
// ========================================

const getStatistics = async (
  req,
  res
) => {
  try {
    // ========================================
    // TOTAL RECORDS
    // ========================================

    const totalRecords =
      await GirviRecord.countDocuments();

    // ========================================
    // OPEN RECORDS
    // ========================================

    const openRecords =
      await GirviRecord.countDocuments({
        closingDate: null,
      });

    // ========================================
    // CLOSED RECORDS
    // ========================================

    const closedRecords =
      await GirviRecord.countDocuments({
        closingDate: {
          $ne: null,
        },
      });

    // ========================================
    // OPEN AMOUNT
    // ONLY OPEN GIRVI AMOUNT
    // ========================================

    const openAmountResult =
      await GirviRecord.aggregate([
        {
          $match: {
            closingDate: null,
          },
        },

        {
          $group: {
            _id: null,

            totalAmount: {
              $sum: "$amount",
            },
          },
        },
      ]);

    const openAmount =
      openAmountResult.length > 0
        ? openAmountResult[0]
            .totalAmount
        : 0;

    // ========================================
    // CLOSED AMOUNT
    // ========================================

    const closedAmountResult =
      await GirviRecord.aggregate([
        {
          $match: {
            closingDate: {
              $ne: null,
            },
          },
        },

        {
          $group: {
            _id: null,

            totalAmount: {
              $sum: "$amount",
            },
          },
        },
      ]);

    const closedAmount =
      closedAmountResult.length > 0
        ? closedAmountResult[0]
            .totalAmount
        : 0;

    // ========================================
    // TOTAL AMOUNT
    //
    // IMPORTANT:
    // Dashboard Total Amount should
    // contain ONLY OPEN GIRVI amount.
    // ========================================

    const totalAmount =
      openAmount;

    // ========================================
    // RESPONSE
    // ========================================

    return res.status(200).json({
      success: true,

      statistics: {
        totalRecords,

        openRecords,

        closedRecords,

        // ONLY OPEN AMOUNT
        totalAmount,

        // OPEN AMOUNT
        openAmount,

        // CLOSED AMOUNT
        closedAmount,
      },
    });
  } catch (error) {
    console.error(
      "Get statistics error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

// ========================================
// EXPORT
// ========================================

export {
  createRecord,
  getRecords,
  getRecord,
  updateRecord,
  deleteRecord,
  getStatistics,
};