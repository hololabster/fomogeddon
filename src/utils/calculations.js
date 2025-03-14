export const calculatePnL = (position, entryPrice, currentPrice, amount) => {
  if (position === "long") {
    return (currentPrice - entryPrice) * amount;
  } else if (position === "short") {
    return (entryPrice - currentPrice) * amount;
  } else if (position === "5XLong") {
    return (currentPrice - entryPrice) * amount * 5;
  } else if (position === "5XShort") {
    return (entryPrice - currentPrice) * amount * 5;
  }
  return 0;
};

export const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
};

export const formatPercent = (value) => {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
};
