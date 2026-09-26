function StatsCards({ statistics }) {
  const formatAmount = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  return (
    <section className="stats-grid">
      {/* Total Records */}
      <div className="stat-card">
        <div className="stat-icon">📋</div>

        <div>
          <p>Total Records</p>

          <h3>
            {statistics?.totalRecords || 0}
          </h3>
        </div>
      </div>

      {/* Open Records */}
      <div className="stat-card">
        <div className="stat-icon">🟢</div>

        <div>
          <p>Open Records</p>

          <h3>
            {statistics?.openRecords || 0}
          </h3>
        </div>
      </div>

      {/* Closed Records */}
      <div className="stat-card">
        <div className="stat-icon">🔴</div>

        <div>
          <p>Closed Records</p>

          <h3>
            {statistics?.closedRecords || 0}
          </h3>
        </div>
      </div>

      {/* Total Amount */}
      <div className="stat-card">
        <div className="stat-icon">💰</div>

        <div>
          <p>Total Amount</p>

          <h3>
            {formatAmount(
              statistics?.totalAmount
            )}
          </h3>
        </div>
      </div>
    </section>
  );
}

export default StatsCards;