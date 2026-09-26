import { useEffect, useState } from "react";

function EditRecord({
  record,
  onClose,
  onRecordUpdated,
}) {
  const [formData, setFormData] = useState({
    amount: "",
    name: "",
    mobileNumber: "",
    item: "",
    registrationDate: "",
    closingDate: "",
    otherDetails: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!record) {
      return;
    }

    setFormData({
      amount: record.amount ?? "",
      name: record.name ?? "",
      mobileNumber:
        record.mobileNumber ?? "",
      item: record.item ?? "",

      registrationDate: record.registrationDate
        ? new Date(record.registrationDate)
            .toISOString()
            .split("T")[0]
        : "",

      closingDate: record.closingDate
        ? new Date(record.closingDate)
            .toISOString()
            .split("T")[0]
        : "",

      otherDetails:
        record.otherDetails ?? "",
    });

    setError("");
    setSuccess("");
  }, [record]);

  const handleChange = (event) => {
    const { name, value } =
      event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleMobileChange = (
    event
  ) => {
    const value =
      event.target.value.replace(
        /\D/g,
        ""
      );

    setFormData((previous) => ({
      ...previous,
      mobileNumber: value,
    }));
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    if (!formData.name.trim()) {
      setError(
        "Customer name is required."
      );
      setLoading(false);
      return;
    }

    if (
      !/^[6-9][0-9]{9}$/.test(
        formData.mobileNumber
      )
    ) {
      setError(
        "Please enter a valid 10-digit mobile number."
      );
      setLoading(false);
      return;
    }

    if (
      !formData.amount ||
      Number(formData.amount) <= 0
    ) {
      setError(
        "Please enter a valid amount."
      );
      setLoading(false);
      return;
    }

    if (!formData.item.trim()) {
      setError(
        "Item is required."
      );
      setLoading(false);
      return;
    }

    if (!formData.registrationDate) {
      setError(
        "Registration date is required."
      );
      setLoading(false);
      return;
    }

    if (
      formData.closingDate &&
      formData.closingDate <
        formData.registrationDate
    ) {
      setError(
        "Closing date cannot be before registration date."
      );
      setLoading(false);
      return;
    }

    try {
      const token =
        localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5001/api/girvi/${record._id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            amount: Number(
              formData.amount
            ),

            name:
              formData.name.trim(),

            mobileNumber:
              formData.mobileNumber.trim(),

            item:
              formData.item.trim(),

            registrationDate:
              formData.registrationDate,

            closingDate:
              formData.closingDate ||
              null,

            otherDetails:
              formData.otherDetails.trim(),
          }),
        }
      );

      const data =
        await response.json();

      if (response.status === 401) {
        localStorage.removeItem(
          "token"
        );

        localStorage.removeItem(
          "admin"
        );

        window.location.reload();

        return;
      }

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to update record."
        );

        return;
      }

      setSuccess(
        "Girvi record updated successfully."
      );

      if (onRecordUpdated) {
        await onRecordUpdated();
      }

      setTimeout(() => {
        onClose();
      }, 800);
    } catch (error) {
      console.error(
        "Update record error:",
        error
      );

      setError(
        "Unable to connect to server."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!record) {
    return null;
  }

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
    >
      <div
        className="modal-card"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        {/* HEADER */}

        <div className="modal-header">
          <div>
            <h2>
              Edit Girvi Record
            </h2>

            <p>
              Update customer and item
              details
            </p>
          </div>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {/* FORM */}

        <form
          className="record-form"
          onSubmit={handleSubmit}
        >
          {/* FIRST ROW */}

          <div className="form-row">
            <div className="form-group">
              <label>
                Amount *
              </label>

              <input
                type="number"
                name="amount"
                placeholder="Enter amount"
                min="1"
                value={formData.amount}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>
                Customer Name *
              </label>

              <input
                type="text"
                name="name"
                placeholder="Enter customer name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* SECOND ROW */}

          <div className="form-row">
            <div className="form-group">
              <label>
                Mobile Number *
              </label>

              <input
                type="tel"
                name="mobileNumber"
                placeholder="10-digit mobile number"
                maxLength={10}
                inputMode="numeric"
                value={
                  formData.mobileNumber
                }
                onChange={
                  handleMobileChange
                }
                required
              />
            </div>

            <div className="form-group">
              <label>
                Item *
              </label>

              <input
                type="text"
                name="item"
                placeholder="e.g. Gold Ring"
                value={formData.item}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* THIRD ROW */}

          <div className="form-row">
            <div className="form-group">
              <label>
                Registration Date *
              </label>

              <input
                type="date"
                name="registrationDate"
                value={
                  formData.registrationDate
                }
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>
                Closing Date
              </label>

              <input
                type="date"
                name="closingDate"
                value={
                  formData.closingDate
                }
                min={
                  formData.registrationDate
                }
                onChange={handleChange}
              />

              <small>
                Leave empty if the
                record is still open.
              </small>
            </div>
          </div>

          {/* OTHER DETAILS */}

          <div className="form-group">
            <label>
              Other Details
            </label>

            <textarea
              name="otherDetails"
              placeholder="Enter additional information..."
              rows={4}
              value={
                formData.otherDetails
              }
              onChange={handleChange}
            />
          </div>

          {/* MESSAGES */}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {success && (
            <div className="success-message">
              {success}
            </div>
          )}

          {/* ACTIONS */}

          <div className="form-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={loading}
            >
              {loading
                ? "Updating..."
                : "Update Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditRecord;