import { useState } from "react";

function AddRecord({ onClose, onRecordAdded }) {
  const [formData, setFormData] = useState({
    name: "",
    mobileNumber: "",
    amount: "",
    item: "",
    registrationDate: "",
    closingDate: "",
    otherDetails: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.name.trim()) {
      setError("Customer name is required.");
      return;
    }

    if (!formData.mobileNumber.trim()) {
      setError("Mobile number is required.");
      return;
    }

    if (!/^[6-9][0-9]{9}$/.test(formData.mobileNumber)) {
      setError(
        "Please enter a valid 10-digit mobile number."
      );
      return;
    }

    if (!formData.amount) {
      setError("Amount is required.");
      return;
    }

    if (Number(formData.amount) <= 0) {
      setError("Amount must be greater than 0.");
      return;
    }

    if (!formData.item.trim()) {
      setError("Item is required.");
      return;
    }

    if (!formData.registrationDate) {
      setError("Registration date is required.");
      return;
    }

    if (
      formData.closingDate &&
      formData.closingDate < formData.registrationDate
    ) {
      setError(
        "Closing date cannot be before registration date."
      );
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5001/api/girvi",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: formData.name.trim(),
            mobileNumber:
              formData.mobileNumber.trim(),
            amount: Number(formData.amount),
            item: formData.item.trim(),
            registrationDate:
              formData.registrationDate,
            closingDate:
              formData.closingDate || null,
            otherDetails:
              formData.otherDetails.trim(),
          }),
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("token");
        window.location.reload();
        return;
      }

      if (!response.ok) {
        setError(
          data.message ||
            "Failed to create record."
        );
        return;
      }

      setSuccess(
        "Record added successfully."
      );

      if (onRecordAdded) {
        onRecordAdded(data.record);
      }

      setTimeout(() => {
        onClose();
      }, 700);
    } catch (error) {
      console.error(
        "Add record error:",
        error
      );

      setError(
        "Unable to connect to server."
      );
    } finally {
      setLoading(false);
    }
  };

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
        <div className="modal-header">
          <div>
            <h2>Add New Record</h2>
            <p>
              Enter customer girvi details
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

        <form
          className="record-form"
          onSubmit={handleSubmit}
        >
          <div className="form-row">
            <div className="form-group">
              <label>
                Customer Name *
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter customer name"
              />
            </div>

            <div className="form-group">
              <label>
                Mobile Number *
              </label>

              <input
                type="tel"
                name="mobileNumber"
                value={
                  formData.mobileNumber
                }
                onChange={(event) =>
                  setFormData(
                    (previous) => ({
                      ...previous,
                      mobileNumber:
                        event.target.value.replace(
                          /\D/g,
                          ""
                        ),
                    })
                  )
                }
                maxLength={10}
                inputMode="numeric"
                placeholder="10-digit mobile number"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>
                Amount *
              </label>

              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                min="1"
                placeholder="Enter amount"
              />
            </div>

            <div className="form-group">
              <label>
                Item *
              </label>

              <input
                type="text"
                name="item"
                value={formData.item}
                onChange={handleChange}
                placeholder="e.g. Gold Ring"
              />
            </div>
          </div>

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
                onChange={handleChange}
              />

              <small>
                Leave empty if the record
                is still open.
              </small>
            </div>
          </div>

          <div className="form-group">
            <label>
              Other Details
            </label>

            <textarea
              name="otherDetails"
              value={
                formData.otherDetails
              }
              onChange={handleChange}
              placeholder="Enter any additional details..."
              rows={4}
            />
          </div>

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
                ? "Adding..."
                : "Add Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddRecord;