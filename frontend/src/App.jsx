import { useState } from "react";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

function App() {
  const [isLoggedIn, setIsLoggedIn] =
    useState(
      Boolean(
        localStorage.getItem("token")
      )
    );

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");

    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return (
      <Login
        onLoginSuccess={
          handleLoginSuccess
        }
      />
    );
  }

  return (
    <Dashboard
      onLogout={handleLogout}
    />
  );
}

export default App;