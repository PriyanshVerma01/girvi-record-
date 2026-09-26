import { useEffect, useState } from "react";

function AccountSettings({ onClose }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ========================================
  // CHANGE NAME
  // ========================================

  const [newName, setNewName] = useState("");
  const [changingName, setChangingName] = useState(false);

  // ========================================
  // CHANGE PASSWORD
  // ========================================

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // ========================================
  // CHANGE EMAIL
  // ========================================

  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [emailStep, setEmailStep] = useState("start");
  const [changingEmail, setChangingEmail] = useState(false);

  // ========================================
  // CHANGE MOBILE
  // ========================================

  const [newMobileNumber, setNewMobileNumber] = useState("");
  const [mobilePassword, setMobilePassword] = useState("");
  const [mobileOtp, setMobileOtp] = useState("");
  const [mobileStep, setMobileStep] = useState("start");
  const [changingMobile, setChangingMobile] = useState(false);

  // ========================================
  // API REQUEST
  // ========================================

  const apiRequest = async (url, options = {}) => {
    const token = localStorage.getItem("token");

    if (!token) {
      localStorage.removeItem("admin");
      window.location.reload();
      return null;
    }

    try {
      const response = await fetch(url, {
        ...options,

        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
          Authorization: `Bearer ${token}`,
        },
      });

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("admin");
        window.location.reload();

        return null;
      }

      return {
        response,
        data,
      };
    } catch (error) {
      console.error("API request error:", error);
      throw error;
    }
  };

  // ========================================
  // FETCH PROFILE
  // ========================================

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await apiRequest(
        "http://localhost:5001/api/auth/profile"
      );

      if (!result) {
        return;
      }

      const { response, data } = result;

      if (!response.ok) {
        setError(
          data.message || "Failed to load profile."
        );
        return;
      }

      setProfile(data.admin);
    } catch (error) {
      console.error("Fetch profile error:", error);

      setError(
        "Unable to connect to server."
      );
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // INITIAL LOAD
  // ========================================

  useEffect(() => {
    fetchProfile();
  }, []);

  // ========================================
  // CLEAR MESSAGES
  // ========================================

  const clearMessages = () => {
    setMessage("");
    setError("");
  };

  // ========================================
  // CHANGE NAME
  // ========================================

  const handleChangeName = async (event) => {
    event.preventDefault();

    clearMessages();

    const trimmedName = newName.trim();

    if (!trimmedName) {
      setError("Name cannot be empty.");
      return;
    }

    try {
      setChangingName(true);

      const result = await apiRequest(
        "http://localhost:5001/api/auth/change-name",
        {
          method: "POST",

          body: JSON.stringify({
            name: trimmedName,
          }),
        }
      );

      if (!result) {
        return;
      }

      const { response, data } = result;

      if (!response.ok) {
        setError(
          data.message ||
            "Failed to change name."
        );
        return;
      }

      setMessage(
        data.message ||
          "Name changed successfully."
      );

      setNewName("");

      await fetchProfile();
    } catch (error) {
      console.error(
        "Change name error:",
        error
      );

      setError(
        "Unable to connect to server."
      );
    } finally {
      setChangingName(false);
    }
  };

  // ========================================
  // CHANGE PASSWORD
  // ========================================

  const handleChangePassword = async (event) => {
    event.preventDefault();

    clearMessages();

    if (!currentPassword) {
      setError(
        "Please enter your current password."
      );
      return;
    }

    if (!newPassword) {
      setError(
        "Please enter your new password."
      );
      return;
    }

    if (!confirmPassword) {
      setError(
        "Please confirm your new password."
      );
      return;
    }

    if (newPassword.length < 8) {
      setError(
        "New password must be at least 8 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(
        "New password and confirm password do not match."
      );
      return;
    }

    try {
      setChangingPassword(true);

      const result = await apiRequest(
        "http://localhost:5001/api/auth/change-password",
        {
          method: "POST",

          body: JSON.stringify({
            currentPassword,
            newPassword,
            confirmPassword,
          }),
        }
      );

      if (!result) {
        return;
      }

      const { response, data } = result;

      if (!response.ok) {
        setError(
          data.message ||
            "Failed to change password."
        );
        return;
      }

      setMessage(
        "Password changed successfully. Please login again."
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("admin");

        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error(
        "Change password error:",
        error
      );

      setError(
        "Unable to connect to server."
      );
    } finally {
      setChangingPassword(false);
    }
  };

  // ========================================
  // CHANGE EMAIL - START
  // ========================================

  const handleChangeEmailStart = async (event) => {
    event.preventDefault();

    clearMessages();

    const trimmedEmail = newEmail
      .trim()
      .toLowerCase();

    if (!emailPassword) {
      setError(
        "Please enter your current password."
      );
      return;
    }

    if (!trimmedEmail) {
      setError(
        "Please enter your new email."
      );
      return;
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmedEmail)) {
      setError(
        "Please enter a valid email address."
      );
      return;
    }

    if (
      profile?.email &&
      trimmedEmail ===
        profile.email.toLowerCase()
    ) {
      setError(
        "New email must be different from current email."
      );
      return;
    }

    try {
      setChangingEmail(true);

      const result = await apiRequest(
        "http://localhost:5001/api/auth/change-email/start",
        {
          method: "POST",

          body: JSON.stringify({
            currentPassword: emailPassword,
            newEmail: trimmedEmail,
          }),
        }
      );

      if (!result) {
        return;
      }

      const { response, data } = result;

      if (!response.ok) {
        setError(
          data.message ||
            "Failed to start email change."
        );
        return;
      }

      setNewEmail(trimmedEmail);

      setMessage(
        "Password verified. Now enter the 6-digit code from your Google Authenticator app."
      );

      setEmailStep("verify");
    } catch (error) {
      console.error(
        "Change email start error:",
        error
      );

      setError(
        "Unable to connect to server."
      );
    } finally {
      setChangingEmail(false);
    }
  };

  // ========================================
  // VERIFY EMAIL AUTHENTICATOR CODE
  // ========================================

  const handleVerifyEmailOTP = async (event) => {
    event.preventDefault();

    clearMessages();

    const trimmedOtp = emailOtp.trim();

    if (!trimmedOtp) {
      setError(
        "Please enter your Google Authenticator code."
      );
      return;
    }

    if (!/^\d{6}$/.test(trimmedOtp)) {
      setError(
        "Authenticator code must be exactly 6 digits."
      );
      return;
    }

    try {
      setChangingEmail(true);

      const result = await apiRequest(
        "http://localhost:5001/api/auth/change-email/verify-otp",
        {
          method: "POST",

          body: JSON.stringify({
            otp: trimmedOtp,
          }),
        }
      );

      if (!result) {
        return;
      }

      const { response, data } = result;

      console.log(
        "Email change verification response:",
        response.status,
        data
      );

      if (!response.ok) {
        setError(
          data.message ||
            "Invalid Google Authenticator code."
        );
        return;
      }

      setMessage(
        data.message ||
          "Email changed successfully. Please login again."
      );

      setEmailStep("start");
      setEmailOtp("");
      setEmailPassword("");
      setNewEmail("");

      /*
        IMPORTANT:
        Backend successfully updated the email.
        Old session is now cleared and user goes to login.
      */

      setTimeout(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("admin");

        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error(
        "Verify email Authenticator code error:",
        error
      );

      setError(
        "Unable to connect to server."
      );
    } finally {
      setChangingEmail(false);
    }
  };

  // ========================================
  // CANCEL EMAIL CHANGE
  // ========================================

  const resetEmailFlow = () => {
    setEmailStep("start");

    setNewEmail("");
    setEmailPassword("");
    setEmailOtp("");

    clearMessages();
  };

  // ========================================
  // CHANGE MOBILE - START
  // ========================================

  const handleChangeMobileStart = async (event) => {
    event.preventDefault();

    clearMessages();

    const trimmedMobile =
      newMobileNumber.trim();

    if (!mobilePassword) {
      setError(
        "Please enter your current password."
      );
      return;
    }

    if (!trimmedMobile) {
      setError(
        "Please enter your new mobile number."
      );
      return;
    }

    if (
      !/^[6-9][0-9]{9}$/.test(
        trimmedMobile
      )
    ) {
      setError(
        "Please enter a valid 10-digit mobile number."
      );
      return;
    }

    try {
      setChangingMobile(true);

      const result = await apiRequest(
        "http://localhost:5001/api/auth/change-mobile/start",
        {
          method: "POST",

          body: JSON.stringify({
            currentPassword: mobilePassword,
          }),
        }
      );

      if (!result) {
        return;
      }

      const { response, data } = result;

      if (!response.ok) {
        setError(
          data.message ||
            "Failed to start mobile change."
        );
        return;
      }

      setMessage(
        data.message ||
          "Password verified. OTP generated. Check your backend terminal."
      );

      setMobileStep("verify-current");
    } catch (error) {
      console.error(
        "Change mobile start error:",
        error
      );

      setError(
        "Unable to connect to server."
      );
    } finally {
      setChangingMobile(false);
    }
  };

  // ========================================
  // VERIFY CURRENT MOBILE OTP
  // ========================================

  const handleVerifyCurrentMobileOTP =
    async (event) => {
      event.preventDefault();

      clearMessages();

      const trimmedOtp =
        mobileOtp.trim();

      if (!trimmedOtp) {
        setError("Please enter the OTP.");
        return;
      }

      if (!/^\d{6}$/.test(trimmedOtp)) {
        setError(
          "OTP must be exactly 6 digits."
        );
        return;
      }

      try {
        setChangingMobile(true);

        const result = await apiRequest(
          "http://localhost:5001/api/auth/change-mobile/verify-current-otp",
          {
            method: "POST",

            body: JSON.stringify({
              otp: trimmedOtp,
            }),
          }
        );

        if (!result) {
          return;
        }

        const {
          response,
          data,
        } = result;

        if (!response.ok) {
          setError(
            data.message ||
              "Invalid or expired OTP."
          );
          return;
        }

        setMobileOtp("");

        const newOtpResult =
          await apiRequest(
            "http://localhost:5001/api/auth/change-mobile/send-new-otp",
            {
              method: "POST",

              body: JSON.stringify({
                newMobileNumber:
                  newMobileNumber.trim(),
              }),
            }
          );

        if (!newOtpResult) {
          return;
        }

        const {
          response: newOtpResponse,
          data: newOtpData,
        } = newOtpResult;

        if (!newOtpResponse.ok) {
          setError(
            newOtpData.message ||
              "Failed to generate new mobile OTP."
          );
          return;
        }

        setMessage(
          newOtpData.message ||
            "New mobile OTP generated. Check your backend terminal."
        );

        setMobileStep("verify-new");
      } catch (error) {
        console.error(
          "Verify current mobile OTP error:",
          error
        );

        setError(
          "Unable to connect to server."
        );
      } finally {
        setChangingMobile(false);
      }
    };

  // ========================================
  // RESEND NEW MOBILE OTP
  // ========================================

  const handleSendNewMobileOTP = async () => {
    clearMessages();

    const trimmedMobile =
      newMobileNumber.trim();

    if (!trimmedMobile) {
      setError(
        "New mobile number is missing."
      );
      return;
    }

    try {
      setChangingMobile(true);

      const result = await apiRequest(
        "http://localhost:5001/api/auth/change-mobile/send-new-otp",
        {
          method: "POST",

          body: JSON.stringify({
            newMobileNumber: trimmedMobile,
          }),
        }
      );

      if (!result) {
        return;
      }

      const { response, data } = result;

      if (!response.ok) {
        setError(
          data.message ||
            "Failed to generate new mobile OTP."
        );
        return;
      }

      setMessage(
        data.message ||
          "New mobile OTP generated. Check your backend terminal."
      );
    } catch (error) {
      console.error(
        "Send new mobile OTP error:",
        error
      );

      setError(
        "Unable to connect to server."
      );
    } finally {
      setChangingMobile(false);
    }
  };

  // ========================================
  // VERIFY NEW MOBILE OTP
  // ========================================

  const handleVerifyNewMobileOTP =
    async (event) => {
      event.preventDefault();

      clearMessages();

      const trimmedOtp =
        mobileOtp.trim();

      if (!trimmedOtp) {
        setError("Please enter the OTP.");
        return;
      }

      if (!/^\d{6}$/.test(trimmedOtp)) {
        setError(
          "OTP must be exactly 6 digits."
        );
        return;
      }

      try {
        setChangingMobile(true);

        const result = await apiRequest(
          "http://localhost:5001/api/auth/change-mobile/verify-new-otp",
          {
            method: "POST",

            body: JSON.stringify({
              otp: trimmedOtp,
            }),
          }
        );

        if (!result) {
          return;
        }

        const { response, data } = result;

        if (!response.ok) {
          setError(
            data.message ||
              "Invalid or expired OTP."
          );
          return;
        }

        setMessage(
          data.message ||
            "Mobile number changed successfully."
        );

        setMobileStep("start");
        setMobileOtp("");
        setNewMobileNumber("");
        setMobilePassword("");

        await fetchProfile();
      } catch (error) {
        console.error(
          "Verify new mobile OTP error:",
          error
        );

        setError(
          "Unable to connect to server."
        );
      } finally {
        setChangingMobile(false);
      }
    };

  // ========================================
  // CANCEL MOBILE CHANGE
  // ========================================

  const resetMobileFlow = () => {
    setMobileStep("start");

    setNewMobileNumber("");
    setMobilePassword("");
    setMobileOtp("");

    clearMessages();
  };

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div
        className="settings-overlay"
        onClick={onClose}
      >
        <div
          className="settings-modal"
          onClick={(event) =>
            event.stopPropagation()
          }
        >
          <div className="settings-loading">
            Loading account settings...
          </div>
        </div>
      </div>
    );
  }

  // ========================================
  // UI
  // ========================================

  return (
    <div
      className="settings-overlay"
      onClick={onClose}
    >
      <div
        className="settings-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        {/* HEADER */}

        <div className="settings-header">
          <div>
            <h2>Account Settings</h2>

            <p>
              Manage your account information
            </p>
          </div>

          <button
            type="button"
            className="settings-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {/* MESSAGES */}

        {(message || error) && (
          <div
            style={{
              padding: "15px 22px 0",
            }}
          >
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {message && (
              <div className="success-message">
                {message}
              </div>
            )}
          </div>
        )}

        {/* ACCOUNT INFORMATION */}

        <div className="settings-section">
          <h3>Account Information</h3>

          {profile && (
            <div className="account-info">
              <div className="account-info-row">
                <span className="account-info-label">
                  Name
                </span>

                <span className="account-info-value">
                  {profile.name}
                </span>
              </div>

              <div className="account-info-row">
                <span className="account-info-label">
                  Email
                </span>

                <span className="account-info-value">
                  {profile.email}
                </span>
              </div>

              <div className="account-info-row">
                <span className="account-info-label">
                  Mobile Number
                </span>

                <span className="account-info-value">
                  {profile.mobileNumber}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* CHANGE NAME */}

        <div className="settings-section">
          <h3>Change Name</h3>

          <form onSubmit={handleChangeName}>
            <div className="settings-form-group">
              <label>New Name</label>

              <input
                type="text"
                value={newName}
                onChange={(event) =>
                  setNewName(
                    event.target.value
                  )
                }
                placeholder="Enter your new name"
                autoComplete="name"
              />
            </div>

            <button
              type="submit"
              className="settings-primary-button"
              disabled={changingName}
            >
              {changingName
                ? "Changing..."
                : "Change Name"}
            </button>
          </form>
        </div>

        {/* CHANGE PASSWORD */}

        <div className="settings-section">
          <h3>Change Password</h3>

          <form
            onSubmit={handleChangePassword}
          >
            <div className="settings-form-group">
              <label>
                Current Password
              </label>

              <input
                type="password"
                value={currentPassword}
                onChange={(event) =>
                  setCurrentPassword(
                    event.target.value
                  )
                }
                placeholder="Enter current password"
                autoComplete="current-password"
              />
            </div>

            <div className="settings-form-group">
              <label>
                New Password
              </label>

              <input
                type="password"
                value={newPassword}
                onChange={(event) =>
                  setNewPassword(
                    event.target.value
                  )
                }
                placeholder="Enter new password"
                autoComplete="new-password"
              />
            </div>

            <div className="settings-form-group">
              <label>
                Confirm New Password
              </label>

              <input
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(
                    event.target.value
                  )
                }
                placeholder="Confirm new password"
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              className="settings-primary-button"
              disabled={changingPassword}
            >
              {changingPassword
                ? "Changing..."
                : "Change Password"}
            </button>
          </form>

          <p className="settings-help">
            Password must be at least 8
            characters.
          </p>
        </div>

        {/* CHANGE EMAIL */}

        <div className="settings-section">
          <h3>Change Email</h3>

          {emailStep === "start" ? (
            <form
              onSubmit={
                handleChangeEmailStart
              }
            >
              <div className="settings-form-group">
                <label>
                  Current Password
                </label>

                <input
                  type="password"
                  value={emailPassword}
                  onChange={(event) =>
                    setEmailPassword(
                      event.target.value
                    )
                  }
                  placeholder="Enter current password"
                  autoComplete="current-password"
                />
              </div>

              <div className="settings-form-group">
                <label>
                  New Email Address
                </label>

                <input
                  type="email"
                  value={newEmail}
                  onChange={(event) =>
                    setNewEmail(
                      event.target.value
                    )
                  }
                  placeholder="Enter new email"
                  autoComplete="email"
                />
              </div>

              <button
                type="submit"
                className="settings-primary-button"
                disabled={changingEmail}
              >
                {changingEmail
                  ? "Verifying..."
                  : "Change Email"}
              </button>
            </form>
          ) : (
            <form
              onSubmit={
                handleVerifyEmailOTP
              }
            >
              <div className="settings-form-group">
                <label>
                  New Email
                </label>

                <input
                  type="email"
                  value={newEmail}
                  disabled
                  readOnly
                />
              </div>

              <div className="settings-form-group">
                <label>
                  Google Authenticator Code
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={emailOtp}
                  onChange={(event) =>
                    setEmailOtp(
                      event.target.value.replace(
                        /\D/g,
                        ""
                      )
                    )
                  }
                  placeholder="Enter 6-digit Authenticator code"
                  autoComplete="one-time-code"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className="settings-primary-button"
                disabled={changingEmail}
              >
                {changingEmail
                  ? "Verifying..."
                  : "Verify Authenticator Code"}
              </button>

              <button
                type="button"
                className="settings-secondary-button"
                style={{
                  marginLeft: "10px",
                }}
                onClick={resetEmailFlow}
                disabled={changingEmail}
              >
                Cancel
              </button>

              <p className="settings-help">
                Google Authenticator app me
                currently shown 6-digit code
                enter karein.
              </p>
            </form>
          )}
        </div>

        {/* CHANGE MOBILE */}

        <div className="settings-section">
          <h3>Change Mobile Number</h3>

          {/* START */}

          {mobileStep === "start" && (
            <form
              onSubmit={
                handleChangeMobileStart
              }
            >
              <div className="settings-form-group">
                <label>
                  Current Password
                </label>

                <input
                  type="password"
                  value={mobilePassword}
                  onChange={(event) =>
                    setMobilePassword(
                      event.target.value
                    )
                  }
                  placeholder="Enter current password"
                  autoComplete="current-password"
                />
              </div>

              <div className="settings-form-group">
                <label>
                  New Mobile Number
                </label>

                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={newMobileNumber}
                  onChange={(event) =>
                    setNewMobileNumber(
                      event.target.value.replace(
                        /\D/g,
                        ""
                      )
                    )
                  }
                  placeholder="Enter 10-digit mobile number"
                  autoComplete="tel"
                />
              </div>

              <button
                type="submit"
                className="settings-primary-button"
                disabled={changingMobile}
              >
                {changingMobile
                  ? "Verifying..."
                  : "Change Mobile Number"}
              </button>
            </form>
          )}

          {/* VERIFY CURRENT MOBILE */}

          {mobileStep ===
            "verify-current" && (
            <form
              onSubmit={
                handleVerifyCurrentMobileOTP
              }
            >
              <div className="settings-form-group">
                <label>
                  Current Mobile OTP
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={mobileOtp}
                  onChange={(event) =>
                    setMobileOtp(
                      event.target.value.replace(
                        /\D/g,
                        ""
                      )
                    )
                  }
                  placeholder="Enter 6-digit OTP"
                  autoComplete="one-time-code"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className="settings-primary-button"
                disabled={changingMobile}
              >
                {changingMobile
                  ? "Verifying..."
                  : "Verify Current OTP"}
              </button>

              <button
                type="button"
                className="settings-secondary-button"
                style={{
                  marginLeft: "10px",
                }}
                onClick={resetMobileFlow}
                disabled={changingMobile}
              >
                Cancel
              </button>

              <p className="settings-help">
                Current mobile OTP backend
                terminal me generate hoga.
              </p>
            </form>
          )}

          {/* VERIFY NEW MOBILE */}

          {mobileStep === "verify-new" && (
            <form
              onSubmit={
                handleVerifyNewMobileOTP
              }
            >
              <div className="settings-form-group">
                <label>
                  New Mobile Number
                </label>

                <input
                  type="tel"
                  value={newMobileNumber}
                  disabled
                  readOnly
                />
              </div>

              <div className="settings-form-group">
                <label>
                  New Mobile OTP
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={mobileOtp}
                  onChange={(event) =>
                    setMobileOtp(
                      event.target.value.replace(
                        /\D/g,
                        ""
                      )
                    )
                  }
                  placeholder="Enter 6-digit OTP"
                  autoComplete="one-time-code"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className="settings-primary-button"
                disabled={changingMobile}
              >
                {changingMobile
                  ? "Verifying..."
                  : "Verify New Mobile OTP"}
              </button>

              <button
                type="button"
                className="settings-secondary-button"
                style={{
                  marginLeft: "10px",
                }}
                onClick={
                  handleSendNewMobileOTP
                }
                disabled={changingMobile}
              >
                Resend OTP
              </button>

              <button
                type="button"
                className="settings-secondary-button"
                style={{
                  marginLeft: "10px",
                }}
                onClick={resetMobileFlow}
                disabled={changingMobile}
              >
                Cancel
              </button>

              <p className="settings-help">
                New mobile OTP backend
                terminal me generate hoga.
              </p>
            </form>
          )}
        </div>

        {/* CLOSE */}

        <div
          className="settings-section"
          style={{
            textAlign: "right",
          }}
        >
          <button
            type="button"
            className="settings-secondary-button"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default AccountSettings;