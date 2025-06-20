const getPercentageChange = (current, last) => {
  if (
    ((current === undefined || current === null) &&
      (last === undefined || last === null)) ||
    isNaN(current) ||
    isNaN(last) ||
    last === 0
  )
    return "";

  const change = current - last;
  const percentageChange = (change / last) * 100;
  return percentageChange.toFixed(2);
};

module.exports = { getPercentageChange };
