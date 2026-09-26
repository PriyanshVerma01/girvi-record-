import "./ViewRecord.css";

function ViewRecord({
  record,
  onClose,
  onEdit,
}) {
  // ========================================
  // FORMAT DATE
  // ========================================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }
    );
  };

  // ========================================
  // FORMAT AMOUNT
  // ========================================

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  // ========================================
  // IF NO RECORD
  // ========================================

  if (!record) {
    return null;
  }

  // ========================================
  // VIEW RECORD
  // ========================================

  return (
    <div
      className="view-record-overlay"
      onClick={onClose}
    >
      <div
        className="view-record-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        {/* =====================================
            HEADER
        ====================================== */}

        <div className="view-record-header">
          <div className="view-record-title-section">
            <h2>Record Details</h2>

            <p>
              Complete girvi record information
            </p>
          </div>

          <button
            type="button"
            className="view-record-close-button"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* =====================================
            RECORD DETAILS
        ====================================== */}

        <div className="view-record-details-grid">
          {/* CUSTOMER NAME */}

          <div className="view-record-detail-card">
            <span className="view-record-label">
              Customer Name
            </span>

            <strong className="view-record-value">
              {record.name || "-"}
            </strong>
          </div>

          {/* MOBILE NUMBER */}

          <div className="view-record-detail-card">
            <span className="view-record-label">
              Mobile Number
            </span>

            <strong className="view-record-value">
              {record.mobileNumber || "-"}
            </strong>
          </div>

          {/* AMOUNT */}

          <div className="view-record-detail-card">
            <span className="view-record-label">
              Amount
            </span>

            <strong className="view-record-value amount-value">
              {formatAmount(record.amount)}
            </strong>
          </div>

          {/* ITEM */}

          <div className="view-record-detail-card">
            <span className="view-record-label">
              Item
            </span>

            <strong className="view-record-value">
              {record.item || "-"}
            </strong>
          </div>

          {/* REGISTRATION DATE */}

          <div className="view-record-detail-card">
            <span className="view-record-label">
              Registration Date
            </span>

            <strong className="view-record-value">
              {formatDate(
                record.registrationDate
              )}
            </strong>
          </div>

          {/* CLOSING DATE */}

          <div className="view-record-detail-card">
            <span className="view-record-label">
              Closing Date
            </span>

            <strong className="view-record-value">
              {formatDate(
                record.closingDate
              )}
            </strong>
          </div>

          {/* DURATION */}

          <div className="view-record-detail-card">
            <span className="view-record-label">
              Duration
            </span>

            <strong className="view-record-value">
              {record.duration?.formatted ||
                "-"}
            </strong>
          </div>

          {/* STATUS */}

          <div className="view-record-detail-card">
            <span className="view-record-label">
              Status
            </span>

            <div className="view-record-status-wrapper">
              <span
                className={`view-record-status ${
                  record.status === "OPEN"
                    ? "view-record-status-open"
                    : "view-record-status-closed"
                }`}
              >
                {record.status || "-"}
              </span>
            </div>
          </div>
        </div>

        {/* =====================================
            OTHER DETAILS
        ====================================== */}

        <div className="view-record-description">
          <span className="view-record-label">
            Other Details
          </span>

          <p>
            {record.otherDetails ||
              "No additional details."}
          </p>
        </div>

        {/* =====================================
            ACTION BUTTONS
        ====================================== */}

        <div className="view-record-actions">
          <button
            type="button"
            className="view-record-cancel-button"
            onClick={onClose}
          >
            Close
          </button>

          <button
            type="button"
            className="view-record-edit-button"
            onClick={() => onEdit(record)}
          >
            Edit Record
          </button>
        </div>
      </div>
    </div>
  );
}

export default ViewRecord;