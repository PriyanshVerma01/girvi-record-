import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import StatsCards from "../components/StatsCards";
import SearchBar from "../components/SearchBar";
import RecordTable from "../components/RecordTable";

import AddRecord from "../components/AddRecord";
import EditRecord from "../components/EditRecord";
import ViewRecord from "../components/ViewRecord";
import AccountSettings from "../components/AccountSettings";

function Dashboard({ onLogout }) {
  const [records, setRecords] = useState([]);
  const [statistics, setStatistics] =
    useState({
      totalRecords: 0,
      openRecords: 0,
      closedRecords: 0,
      totalAmount: 0,
    });

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("ALL");

  const [darkMode, setDarkMode] =
    useState(false);

  const [showAddRecord, setShowAddRecord] =
    useState(false);

  const [showEditRecord, setShowEditRecord] =
    useState(false);

  const [showViewRecord, setShowViewRecord] =
    useState(false);

  const [
    showAccountSettings,
    setShowAccountSettings,
  ] = useState(false);

  const [selectedRecord, setSelectedRecord] =
    useState(null);

  // =========================
  // API REQUEST
  // =========================

  const apiRequest = async (
    endpoint,
    options = {}
  ) => {
    const token =
      localStorage.getItem("token");

    const response = await fetch(
      `http://localhost:5001${endpoint}`,
      {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
          Authorization: `Bearer ${token}`,
        },
      }
    );

    let data = {};

    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (response.status === 401) {
      localStorage.removeItem("token");

      if (onLogout) {
        onLogout();
      }

      throw new Error(
        "Your session has expired. Please login again."
      );
    }

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Something went wrong."
      );
    }

    return data;
  };

  // =========================
  // FETCH RECORDS
  // =========================

  const fetchRecords = async () => {
    try {
      let endpoint = "/api/girvi";

      const params = new URLSearchParams();

      if (search.trim()) {
        params.append(
          "search",
          search.trim()
        );
      }

      if (status !== "ALL") {
        params.append(
          "status",
          status
        );
      }

      const queryString =
        params.toString();

      if (queryString) {
        endpoint += `?${queryString}`;
      }

      const data =
        await apiRequest(endpoint);

      setRecords(
        data.records || []
      );

      setError("");
    } catch (error) {
      console.error(
        "Fetch records error:",
        error
      );

      setError(
        error.message ||
          "Unable to load records."
      );
    }
  };

  // =========================
  // FETCH STATISTICS
  // =========================

  const fetchStatistics =
    async () => {
      try {
        const data =
          await apiRequest(
            "/api/girvi/statistics"
          );

        setStatistics(
          data.statistics || {
            totalRecords: 0,
            openRecords: 0,
            closedRecords: 0,
            totalAmount: 0,
          }
        );

        setError("");
      } catch (error) {
        console.error(
          "Fetch statistics error:",
          error
        );

        setError(
          error.message ||
            "Unable to load statistics."
        );
      }
    };

  // =========================
  // FETCH DASHBOARD DATA
  // =========================

  const fetchDashboardData =
    async () => {
      setLoading(true);

      try {
        await Promise.all([
          fetchRecords(),
          fetchStatistics(),
        ]);
      } finally {
        setLoading(false);
      }
    };

  // =========================
  // INITIAL LOAD
  // =========================

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // =========================
  // SEARCH / STATUS CHANGE
  // =========================

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRecords();
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [search, status]);

  // =========================
  // DARK MODE
  // =========================

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add(
        "dark-mode"
      );
    } else {
      document.body.classList.remove(
        "dark-mode"
      );
    }

    return () => {
      document.body.classList.remove(
        "dark-mode"
      );
    };
  }, [darkMode]);

  // =========================
  // ADD RECORD
  // =========================

  const handleAddRecord = () => {
    setError("");
    setShowAddRecord(true);
  };

  const handleCloseAddRecord = () => {
    setShowAddRecord(false);
  };

  const handleRecordAdded =
    async () => {
      setShowAddRecord(false);

      await fetchDashboardData();
    };

  // =========================
  // VIEW RECORD
  // =========================

  const handleViewRecord = (
    record
  ) => {
    setSelectedRecord(record);
    setShowViewRecord(true);
  };

  const handleCloseViewRecord =
    () => {
      setSelectedRecord(null);
      setShowViewRecord(false);
    };

  // =========================
  // EDIT RECORD
  // =========================

  const handleEditRecord = (
    record
  ) => {
    setSelectedRecord(record);

    // Close View modal if Edit
    // is opened from View modal.
    setShowViewRecord(false);

    setShowEditRecord(true);
  };

  const handleCloseEditRecord =
    () => {
      setSelectedRecord(null);
      setShowEditRecord(false);
    };

  const handleRecordUpdated =
    async () => {
      setShowEditRecord(false);
      setSelectedRecord(null);

      await fetchDashboardData();
    };

  // =========================
  // DELETE RECORD
  // =========================

  const handleDeleteRecord =
    async (record) => {
      if (!record?._id) {
        return;
      }

      const isConfirmed =
        window.confirm(
          `Are you sure you want to delete "${record.name}" record? This action cannot be undone.`
        );

      if (!isConfirmed) {
        return;
      }

      try {
        setLoading(true);
        setError("");

        await apiRequest(
          `/api/girvi/${record._id}`,
          {
            method: "DELETE",
          }
        );

        alert(
          "Girvi record deleted successfully."
        );

        await fetchDashboardData();
      } catch (error) {
        console.error(
          "Delete record error:",
          error
        );

        setError(
          error.message ||
            "Unable to delete record."
        );
      } finally {
        setLoading(false);
      }
    };

  // =========================
  // ACCOUNT SETTINGS
  // =========================

  const handleAccountSettings =
    () => {
      setShowAccountSettings(true);
    };

  const handleCloseAccountSettings =
    () => {
      setShowAccountSettings(false);
    };

  // =========================
  // LOGOUT
  // =========================

  const handleDashboardLogout =
    () => {
      document.body.classList.remove(
        "dark-mode"
      );

      if (onLogout) {
        onLogout();
      }
    };

  // =========================
  // RENDER
  // =========================

  return (
    <div className="dashboard-page">
      <Navbar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onLogout={handleDashboardLogout}
        onAccountSettings={
          handleAccountSettings
        }
      />

      <main className="dashboard-container">
        {/* DASHBOARD HEADER */}

        <div className="dashboard-header">
          <div>
            <h1>
              Dashboard
            </h1>

            <p>
              Manage your girvi records
              easily and securely.
            </p>
          </div>
        </div>

        {/* ERROR MESSAGE */}

        {error && (
          <div className="dashboard-error">
            {error}

            <button
              type="button"
              onClick={() =>
                setError("")
              }
            >
              ×
            </button>
          </div>
        )}

        {/* STATISTICS */}

        <StatsCards
          statistics={statistics}
        />

        {/* SEARCH */}

        <SearchBar
          search={search}
          setSearch={setSearch}
          status={status}
          setStatus={setStatus}
        />

        {/* RECORD TABLE */}

        <RecordTable
          records={records}
          loading={loading}
          onAddRecord={
            handleAddRecord
          }
          onViewRecord={
            handleViewRecord
          }
          onEditRecord={
            handleEditRecord
          }
          onDeleteRecord={
            handleDeleteRecord
          }
        />
      </main>

      {/* ADD RECORD MODAL */}

      {showAddRecord && (
        <AddRecord
          onClose={
            handleCloseAddRecord
          }
          onRecordAdded={
            handleRecordAdded
          }
        />
      )}

      {/* VIEW RECORD MODAL */}

      {showViewRecord && (
        <ViewRecord
          record={selectedRecord}
          onClose={
            handleCloseViewRecord
          }
          onEdit={
            handleEditRecord
          }
        />
      )}

      {/* EDIT RECORD MODAL */}

      {showEditRecord && (
        <EditRecord
          record={selectedRecord}
          onClose={
            handleCloseEditRecord
          }
          onRecordUpdated={
            handleRecordUpdated
          }
        />
      )}

      {/* ACCOUNT SETTINGS MODAL */}

      {showAccountSettings && (
        <AccountSettings
          onClose={
            handleCloseAccountSettings
          }
        />
      )}
    </div>
  );
}

export default Dashboard;