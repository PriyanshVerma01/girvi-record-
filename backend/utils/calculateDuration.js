const calculateDuration = (
  registrationDate,
  closingDate = null
) => {
  const startDate = new Date(registrationDate);

  // Agar closing date hai to timer wahi rukega
  // Agar closing date nahi hai to aaj ki date use hogi
  const endDate = closingDate
    ? new Date(closingDate)
    : new Date();

  if (
    Number.isNaN(startDate.getTime()) ||
    Number.isNaN(endDate.getTime())
  ) {
    return null;
  }

  // Sirf calendar date use karenge
  const start = new Date(
    startDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate()
  );

  const end = new Date(
    endDate.getFullYear(),
    endDate.getMonth(),
    endDate.getDate()
  );

  if (end < start) {
    return null;
  }

  const millisecondsPerDay =
    1000 * 60 * 60 * 24;

  const totalDays = Math.round(
    (end - start) / millisecondsPerDay
  );

  let years =
    end.getFullYear() -
    start.getFullYear();

  let months =
    end.getMonth() -
    start.getMonth();

  let days =
    end.getDate() -
    start.getDate();

  if (days < 0) {
    months--;

    const previousMonth = new Date(
      end.getFullYear(),
      end.getMonth(),
      0
    );

    days += previousMonth.getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  return {
    years,
    months,
    days,
    totalDays,

    // Important:
    // closingDate hai to CLOSED rahega
    // warna OPEN rahega
    status: closingDate
      ? "CLOSED"
      : "OPEN",

    formatted: `${years} Years, ${months} Months, ${days} Days`,
  };
};

export default calculateDuration;