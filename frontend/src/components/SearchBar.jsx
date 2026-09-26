function SearchBar({
  search,
  setSearch,
  status,
  setStatus,
}) {
  return (
    <section className="search-section">
      <div className="search-box">
        <span>🔎</span>

        <input
          type="text"
          placeholder="Search customer name, mobile number or item..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />

        {search && (
          <button
            className="clear-search"
            onClick={() => setSearch("")}
          >
            ×
          </button>
        )}
      </div>

      <div className="filter-buttons">
        <button
          className={status === "ALL" ? "active" : ""}
          onClick={() => setStatus("ALL")}
        >
          All
        </button>

        <button
          className={status === "OPEN" ? "active" : ""}
          onClick={() => setStatus("OPEN")}
        >
          Open
        </button>

        <button
          className={
            status === "CLOSED" ? "active" : ""
          }
          onClick={() => setStatus("CLOSED")}
        >
          Closed
        </button>
      </div>
    </section>
  );
}

export default SearchBar;