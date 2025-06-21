const { Timelines, Months } = require("./constants");

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

const getDateLabel = (fulldate) => {
  const date = fulldate.getDate();
  const month = fulldate.getMonth();

  return `${date} ${Months[month].substring(0, 3)}`;
};

const getTrendsChartData = (data, timeline) => {
  const reqData = [];
  const amounts = {};

  if (timeline === Timelines[0]) {
    const currentMonth = new Date().getMonth();
    data?.forEach((item) => {
      const month = item.date.getMonth();
      if (month === currentMonth) {
        const label = getDateLabel(item.date);
        if (!amounts[label]) {
          amounts[label] = 0;
        }
        amounts[label] += item.amount;
      }
    });
  } else if (timeline === Timelines[1]) {
    const currentYear = new Date().getFullYear();
    data?.forEach((item) => {
      const year = item.date.getFullYear();
      if (year === currentYear) {
        const month = Months[item.date.getMonth()].substring(0, 3);
        if (!amounts[month]) {
          amounts[month] = 0;
        }
        amounts[month] += item.amount;
      }
    });
  }

  Object.entries(amounts)?.map(([key, value]) => {
    reqData.push({ label: key, value });
  });

  return reqData;
};

module.exports = {
  getPercentageChange,
  getTrendsChartData,
};
