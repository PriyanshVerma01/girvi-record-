import { useState } from "react";
import "./Login.css";

function Login({ onLoginSuccess }) {
  // ========================================
  // LOGIN STATES
  // ========================================

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [otp, setOtp] = useState("");

  // ========================================
  // AUTHENTICATOR SETUP STATES
  // ========================================

  const [qrCode, setQrCode] = useState("");
  const [authenticatorSecret, setAuthenticatorSecret] =
    useState("");

  // ========================================
  // FORGOT PASSWORD STATES
  // ========================================

  const [forgotEmail, setForgotEmail] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  // ========================================
  // COMMON STATES
  // ========================================

  const [loginStep, setLoginStep] = useState("login");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [message, setMessage] = useState("");

  // ========================================
  // CLEAR MESSAGES
  // ========================================

  const clearMessages = () => {
    setError("");
    setMessage("");
  };

  // ========================================
  // LOGIN
  // EMAIL + PASSWORD
  // ========================================

  const handleLogin = async (event) => {
    event.preventDefault();

    clearMessages();

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5001/api/auth/login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Invalid login credentials."
        );
        return;
      }

      // ========================================
      // FIRST TIME AUTHENTICATOR SETUP
      // ========================================

      if (data.requiresAuthenticatorSetup) {
        setQrCode(
          data.qrCodeDataUrl ||
            data.qrCode ||
            ""
        );

        setAuthenticatorSecret(
          data.secret || ""
        );

        setOtp("");

        setMessage(
          "Scan the QR code using your Authenticator app, then enter the 6-digit OTP."
        );

        setLoginStep("authenticatorSetup");

        return;
      }

      // ========================================
      // AUTHENTICATOR ALREADY ENABLED
      // ========================================

      if (
        data.requiresAuthenticator ||
        data.requiresOTP
      ) {
        setOtp("");

        setMessage(
          "Enter the 6-digit OTP from your Authenticator app."
        );

        setLoginStep("authenticatorOtp");

        return;
      }

      // ========================================
      // UNEXPECTED RESPONSE
      // ========================================

      setError("Unexpected login response.");
    } catch (error) {
      console.error("Login error:", error);

      setError(
        "Unable to connect to server. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // VERIFY NORMAL AUTHENTICATOR OTP
  // ========================================

  const handleVerifyAuthenticatorOTP = async (event) => {
    event.preventDefault();

    clearMessages();

    if (!otp) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    if (otp.length !== 6) {
      setError("OTP must be 6 digits.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5001/api/auth/verify-otp",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: email.trim(),
            otp: otp.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Invalid Authenticator OTP."
        );
        return;
      }

      // ========================================
      // SAVE JWT TOKEN
      // ========================================

      localStorage.setItem(
        "token",
        data.token
      );

      // ========================================
      // SAVE ADMIN INFORMATION
      // ========================================

      if (data.admin) {
        localStorage.setItem(
          "admin",
          JSON.stringify(data.admin)
        );
      }

      setMessage("Login successful!");

      onLoginSuccess();
    } catch (error) {
      console.error(
        "Authenticator OTP error:",
        error
      );

      setError(
        "Unable to connect to server."
      );
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // FIRST TIME AUTHENTICATOR SETUP
  // VERIFY OTP
  // ========================================

  const handleAuthenticatorSetup = async (event) => {
    event.preventDefault();

    clearMessages();

    if (!otp) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    if (otp.length !== 6) {
      setError("OTP must be 6 digits.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5001/api/auth/verify-authenticator-setup",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: email.trim(),
            otp: otp.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Invalid Authenticator OTP."
        );
        return;
      }

      // ========================================
      // SAVE JWT TOKEN
      // ========================================

      localStorage.setItem(
        "token",
        data.token
      );

      // ========================================
      // SAVE ADMIN INFORMATION
      // ========================================

      if (data.admin) {
        localStorage.setItem(
          "admin",
          JSON.stringify(data.admin)
        );
      }

      setMessage(
        "Authenticator setup completed successfully!"
      );

      onLoginSuccess();
    } catch (error) {
      console.error(
        "Authenticator setup error:",
        error
      );

      setError(
        "Unable to connect to server."
      );
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // FORGOT PASSWORD
  // ========================================

  const handleForgotPassword = async (event) => {
    event.preventDefault();

    clearMessages();

    if (!forgotEmail.trim()) {
      setError("Please enter your email.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5001/api/auth/forgot-password",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: forgotEmail.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to start password reset."
        );
        return;
      }

      setMessage(
        "Open Google Authenticator and enter the current 6-digit code."
      );

      setResetOtp("");
      setResetToken("");

      setLoginStep("resetOtp");
    } catch (error) {
      console.error(
        "Forgot password error:",
        error
      );

      setError(
        "Unable to connect to server. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // VERIFY RESET AUTHENTICATOR OTP
  // ========================================

  const handleVerifyResetOTP = async (event) => {
    event.preventDefault();

    clearMessages();

    if (!resetOtp) {
      setError(
        "Please enter the 6-digit Authenticator code."
      );
      return;
    }

    if (resetOtp.length !== 6) {
      setError(
        "Authenticator code must be 6 digits."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5001/api/auth/verify-reset-otp",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: forgotEmail.trim(),
            otp: resetOtp.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Invalid or expired Google Authenticator code."
        );
        return;
      }

      // ========================================
      // SAVE RESET TOKEN
      // ========================================

      setResetToken(
        data.resetToken || ""
      );

      setMessage(
        "Authenticator code verified. Now create your new password."
      );

      setNewPassword("");
      setConfirmPassword("");

      setLoginStep("newPassword");
    } catch (error) {
      console.error(
        "Reset Authenticator OTP error:",
        error
      );

      setError(
        "Unable to connect to server. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // RESET PASSWORD
  // ========================================

  const handleResetPassword = async (event) => {
    event.preventDefault();

    clearMessages();

    // ========================================
    // RESET TOKEN CHECK
    // ========================================

    if (!resetToken) {
      setError(
        "Password reset session is missing. Please start again."
      );
      return;
    }

    // ========================================
    // PASSWORD CHECK
    // ========================================

    if (
      !newPassword ||
      !confirmPassword
    ) {
      setError(
        "Please enter both password fields."
      );
      return;
    }

    if (newPassword.length < 8) {
      setError(
        "New password must be at least 8 characters long."
      );
      return;
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      setError(
        "New password and confirm password do not match."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5001/api/auth/reset-password",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            resetToken,
            newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Password reset failed."
        );
        return;
      }

      // ========================================
      // SUCCESS
      // ========================================

      setMessage(
        "Password reset successfully. Please login with your new password."
      );

      // ========================================
      // CLEAR RESET DATA
      // ========================================

      setForgotEmail("");
      setResetOtp("");
      setResetToken("");
      setNewPassword("");
      setConfirmPassword("");

      // ========================================
      // BACK TO LOGIN
      // ========================================

      setLoginStep("login");
    } catch (error) {
      console.error(
        "Reset password error:",
        error
      );

      setError(
        "Unable to connect to server. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // BACK TO LOGIN
  // ========================================

  const handleBackToLogin = () => {
    setError("");
    setMessage("");

    setOtp("");

    setQrCode("");

    setAuthenticatorSecret("");

    setForgotEmail("");

    setResetOtp("");

    setResetToken("");

    setNewPassword("");

    setConfirmPassword("");

    setLoginStep("login");
  };

  // ========================================
  // BACK FROM AUTHENTICATOR OTP
  // ========================================

  const handleBackFromAuthenticator = () => {
    setError("");
    setMessage("");

    setOtp("");

    setLoginStep("login");
  };

  // ========================================
  // LOGIN SCREEN
  // ========================================

  if (loginStep === "login") {
    return (
      <div className="login-page">
        <div className="login-card">

          <div className="login-logo">
            GR
          </div>

          <h1>
            Girvi Record
          </h1>

          <p className="login-subtitle">
            Management Portal
          </p>

          <form onSubmit={handleLogin}>

            <div className="form-group">

              <label>
                Email
              </label>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                autoComplete="email"
              />

            </div>

            <div className="form-group">

              <label>
                Password
              </label>

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                autoComplete="current-password"
              />

            </div>

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

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : "Login"}
            </button>

          </form>

          <button
            type="button"
            className="forgot-password-button"
            onClick={() => {
              setError("");
              setMessage("");

              setForgotEmail(email);

              setResetOtp("");
              setResetToken("");

              setNewPassword("");
              setConfirmPassword("");

              setLoginStep(
                "forgotPassword"
              );
            }}
          >
            Forgot Password?
          </button>

        </div>
      </div>
    );
  }

  // ========================================
  // FIRST TIME AUTHENTICATOR SETUP
  // ========================================

  if (
    loginStep ===
    "authenticatorSetup"
  ) {
    return (
      <div className="login-page">
        <div className="login-card">

          <div className="login-logo">
            GR
          </div>

          <h1>
            Setup Authenticator
          </h1>

          <p className="login-subtitle">
            Scan this QR code using
            Google Authenticator or
            another compatible
            Authenticator app.
          </p>

          {qrCode && (
            <div className="qr-container">

              <img
                src={qrCode}
                alt="Authenticator QR Code"
                className="qr-code"
              />

            </div>
          )}

          <p className="authenticator-help">
            After scanning the QR code,
            enter the 6-digit code shown
            in your Authenticator app.
          </p>

          {authenticatorSecret && (
            <div className="secret-container">

              <span>
                Manual setup key
              </span>

              <strong>
                {authenticatorSecret}
              </strong>

            </div>
          )}

          <form
            onSubmit={
              handleAuthenticatorSetup
            }
          >

            <div className="form-group">

              <label>
                Authenticator OTP
              </label>

              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(event) =>
                  setOtp(
                    event.target.value.replace(
                      /\D/g,
                      ""
                    )
                  )
                }
                autoComplete="one-time-code"
              />

            </div>

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

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading
                ? "Verifying..."
                : "Enable Authenticator"}
            </button>

          </form>

          <button
            type="button"
            className="back-button"
            onClick={
              handleBackToLogin
            }
          >
            ← Back to Login
          </button>

        </div>
      </div>
    );
  }

  // ========================================
  // NORMAL AUTHENTICATOR OTP
  // ========================================

  if (
    loginStep ===
    "authenticatorOtp"
  ) {
    return (
      <div className="login-page">
        <div className="login-card">

          <div className="login-logo">
            GR
          </div>

          <h1>
            Verify Authenticator
          </h1>

          <p className="login-subtitle">
            Open your Authenticator app
            and enter the current
            6-digit OTP.
          </p>

          <form
            onSubmit={
              handleVerifyAuthenticatorOTP
            }
          >

            <div className="form-group">

              <label>
                Authenticator OTP
              </label>

              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(event) =>
                  setOtp(
                    event.target.value.replace(
                      /\D/g,
                      ""
                    )
                  )
                }
                autoComplete="one-time-code"
                autoFocus
              />

            </div>

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

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading
                ? "Verifying..."
                : "Verify OTP"}
            </button>

          </form>

          <button
            type="button"
            className="back-button"
            onClick={
              handleBackFromAuthenticator
            }
          >
            ← Back to Login
          </button>

        </div>
      </div>
    );
  }

  // ========================================
  // FORGOT PASSWORD
  // ========================================

  if (
    loginStep ===
    "forgotPassword"
  ) {
    return (
      <div className="login-page">
        <div className="login-card">

          <div className="login-logo">
            GR
          </div>

          <h1>
            Forgot Password
          </h1>

          <p className="login-subtitle">
            Enter your registered
            email address.
          </p>

          <form
            onSubmit={
              handleForgotPassword
            }
          >

            <div className="form-group">

              <label>
                Email
              </label>

              <input
                type="email"
                placeholder="Enter your email"
                value={forgotEmail}
                onChange={(event) =>
                  setForgotEmail(
                    event.target.value
                  )
                }
                autoComplete="email"
              />

            </div>

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

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : "Continue"}
            </button>

          </form>

          <button
            type="button"
            className="back-button"
            onClick={
              handleBackToLogin
            }
          >
            ← Back to Login
          </button>

        </div>
      </div>
    );
  }

  // ========================================
  // RESET AUTHENTICATOR OTP
  // ========================================

  if (
    loginStep ===
    "resetOtp"
  ) {
    return (
      <div className="login-page">
        <div className="login-card">

          <div className="login-logo">
            GR
          </div>

          <h1>
            Verify Authenticator
          </h1>

          <p className="login-subtitle">
            Open Google Authenticator
            and enter the current
            6-digit code.
          </p>

          <form
            onSubmit={
              handleVerifyResetOTP
            }
          >

            <div className="form-group">

              <label>
                Google Authenticator OTP
              </label>

              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter 6-digit Authenticator code"
                value={resetOtp}
                onChange={(event) =>
                  setResetOtp(
                    event.target.value.replace(
                      /\D/g,
                      ""
                    )
                  )
                }
                autoComplete="one-time-code"
                autoFocus
              />

            </div>

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

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading
                ? "Verifying..."
                : "Verify Authenticator"}
            </button>

          </form>

          <button
            type="button"
            className="back-button"
            onClick={
              handleBackToLogin
            }
          >
            ← Back to Login
          </button>

        </div>
      </div>
    );
  }

  // ========================================
  // NEW PASSWORD
  // ========================================

  if (
    loginStep ===
    "newPassword"
  ) {
    return (
      <div className="login-page">
        <div className="login-card">

          <div className="login-logo">
            GR
          </div>

          <h1>
            Create New Password
          </h1>

          <p className="login-subtitle">
            Your new password must be
            at least 8 characters long.
          </p>

          <form
            onSubmit={
              handleResetPassword
            }
          >

            <div className="form-group">

              <label>
                New Password
              </label>

              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(event) =>
                  setNewPassword(
                    event.target.value
                  )
                }
                autoComplete="new-password"
              />

            </div>

            <div className="form-group">

              <label>
                Confirm Password
              </label>

              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(
                    event.target.value
                  )
                }
                autoComplete="new-password"
              />

            </div>

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

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : "Change Password"}
            </button>

          </form>

          <button
            type="button"
            className="back-button"
            onClick={
              handleBackToLogin
            }
          >
            ← Back to Login
          </button>

        </div>
      </div>
    );
  }

  // ========================================
  // FALLBACK
  // ========================================

  return null;
}

export default Login;
