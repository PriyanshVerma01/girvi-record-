import * as XLSX from "xlsx";

function RecordTable({
  records,
  loading,
  onAddRecord,
  onViewRecord,
  onEditRecord,
  onDeleteRecord,
}) {
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

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  // =========================
  // PREPARE EXPORT DATA
  // =========================

  const getExportData = () => {
    return records.map((record, index) => ({
      "S.No.": index + 1,
      "Customer Name": record.name || "-",
      "Mobile Number":
        record.mobileNumber || "-",
      "Item": record.item || "-",
      "Amount": record.amount || 0,
      "Registration Date":
        formatDate(record.registrationDate),
      "Closing Date":
        formatDate(record.closingDate),
      "Duration":
        record.duration?.formatted || "-",
      "Status": record.status || "-",
      "Other Details":
        record.otherDetails || "-",
    }));
  };

  // =========================
  // EXPORT EXCEL
  // =========================

  const handleExportExcel = () => {
    if (records.length === 0) {
      alert(
        "There are no records to export."
      );
      return;
    }

    const exportData =
      getExportData();

    const worksheet =
      XLSX.utils.json_to_sheet(
        exportData
      );

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Girvi Records"
    );

    XLSX.writeFile(
      workbook,
      "girvi-records.xlsx"
    );
  };

  // =========================
  // EXPORT CSV
  // =========================

  const handleExportCSV = () => {
    if (records.length === 0) {
      alert(
        "There are no records to export."
      );
      return;
    }

    const exportData =
      getExportData();

    const worksheet =
      XLSX.utils.json_to_sheet(
        exportData
      );

    const csv =
      XLSX.utils.sheet_to_csv(
        worksheet
      );

    const blob = new Blob(
      ["\uFEFF" + csv],
      {
        type:
          "text/csv;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download =
      "girvi-records.csv";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  return (
    <section className="table-card">
      {/* TABLE HEADER */}

      <div className="table-header">
        <div>
          <h2>Customer Records</h2>

          <p>
            All girvi records
          </p>
        </div>

        <div className="table-header-actions">
          {/* EXPORT CSV */}

          <button
            type="button"
            className="export-button csv-export-button"
            onClick={
              handleExportCSV
            }
            disabled={
              records.length === 0
            }
          >
            ↓ Export CSV
          </button>

          {/* EXPORT EXCEL */}

          <button
            type="button"
            className="export-button excel-export-button"
            onClick={
              handleExportExcel
            }
            disabled={
              records.length === 0
            }
          >
            ↓ Export Excel
          </button>

          {/* ADD RECORD */}

          <button
            type="button"
            className="add-button"
            onClick={onAddRecord}
          >
            + Add Record
          </button>
        </div>
      </div>

      {/* LOADING */}

      {loading ? (
        <div className="empty-state">
          <div className="empty-icon">
            ⏳
          </div>

          <h3>
            Loading records...
          </h3>

          <p>
            Please wait while records
            are being loaded.
          </p>
        </div>
      ) : records.length === 0 ? (
        /* NO RECORDS */

        <div className="empty-state">
          <div className="empty-icon">
            📂
          </div>

          <h3>
            No records found
          </h3>

          <p>
            Try another search or add
            a new record.
          </p>
        </div>
      ) : (
        /* RECORD TABLE */

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Mobile</th>
                <th>Item</th>
                <th>Amount</th>
                <th>Registration</th>
                <th>Closing</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {records.map(
                (record) => (
                  <tr
                    key={
                      record._id
                    }
                  >
                    {/* CUSTOMER */}

                    <td>
                      <strong>
                        {record.name ||
                          "-"}
                      </strong>
                    </td>

                    {/* MOBILE */}

                    <td>
                      {record.mobileNumber ||
                        "-"}
                    </td>

                    {/* ITEM */}

                    <td>
                      {record.item ||
                        "-"}
                    </td>

                    {/* AMOUNT */}

                    <td>
                      {formatAmount(
                        record.amount
                      )}
                    </td>

                    {/* REGISTRATION */}

                    <td>
                      {formatDate(
                        record.registrationDate
                      )}
                    </td>

                    {/* CLOSING */}

                    <td>
                      {formatDate(
                        record.closingDate
                      )}
                    </td>

                    {/* DURATION */}

                    <td>
                      {record.duration
                        ?.formatted ||
                        "-"}
                    </td>

                    {/* STATUS */}

                    <td>
                      <span
                        className={
                          record.status ===
                          "OPEN"
                            ? "status-open"
                            : "status-closed"
                        }
                      >
                        {record.status ||
                          "-"}
                      </span>
                    </td>

                    {/* ACTIONS */}

                    <td>
                      <div className="action-buttons">
                        <button
                          type="button"
                          className="action-button view-action"
                          onClick={() =>
                            onViewRecord(
                              record
                            )
                          }
                        >
                          View
                        </button>

                        <button
                          type="button"
                          className="action-button edit-action"
                          onClick={() =>
                            onEditRecord(
                              record
                            )
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="action-button delete-action"
                          onClick={() =>
                            onDeleteRecord(
                              record
                            )
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default RecordTable;