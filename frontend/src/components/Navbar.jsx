function Navbar({
  darkMode,
  setDarkMode,
  onLogout,
  onAccountSettings,
}) {
  return (
    <nav className="navbar">

      {/* ========================================
          LEFT SIDE
      ======================================== */}

      <div className="navbar-left">

        <div className="logo">
          GR
        </div>

        <div>
          <h2>
            Girvi Record
          </h2>

          <span>
            Management Portal
          </span>
        </div>

      </div>

      {/* ========================================
          RIGHT SIDE
      ======================================== */}

      <div className="navbar-actions">

        {/* DARK / LIGHT MODE */}

        <button
          type="button"
          className="theme-button"
          onClick={() =>
            setDarkMode(!darkMode)
          }
        >
          {darkMode
            ? "☀️ Light"
            : "🌙 Dark"}
        </button>

        {/* ACCOUNT SETTINGS */}

        <button
          type="button"
          className="settings-button"
          onClick={
            onAccountSettings
          }
        >
          ⚙️ Settings
        </button>

        {/* LOGOUT */}

        <button
          type="button"
          className="logout-button"
          onClick={onLogout}
        >
          Logout
        </button>

      </div>

    </nav>
  );
}

export default Navbar;