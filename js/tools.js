// Takes prepared cafes object and runs through line items in a single report to get desired data
const crunchNumbers = (cafes, data, dataString, searchString) => {
  for (let cafe in cafes) {
    let thisCafe = cafes[cafe];
    for (let lineItem in data) {
      let thisLine = data[lineItem];
      if (thisLine.Location.includes(`${thisCafe.Location}`) && thisLine.Category.includes(`${searchString}`)) {
        thisCafe[dataString] += Number(thisLine['Net Sales'].replace(/[^0-9.-]+/g,""));
      }
    }
  }
}

const crunchCategories = (categories, data, dataString) => {
  for (let category in categories) {
    let thisCategory = categories[category];
    for (let lineItem in data) {
      let thisLine = data[lineItem];
      if (thisLine.Category.includes(`${thisCategory.Category}`) && !thisLine.Location.includes(`Morgan`) && !thisLine.Location.includes(`Pacific`)) {
        thisCategory[dataString] += Number(thisLine['Net Sales'].replace(/[^0-9.-]+/g,""));
      }
    }
  }
}

// Takes prepared cafes object and runs through line items in a single report to get all categories except the excluded category
const getTotalNet = (cafes, data, dataString, excludeFromSearch) => {
  for (let cafe in cafes) {
    let thisCafe = cafes[cafe];
    for (let lineItem in data) {
      let thisLine = data[lineItem];
      if (thisLine.Location.includes(`${thisCafe.Location}`) && !(thisLine.Category == excludeFromSearch)) {
        thisCafe[dataString] += Number(thisLine['Net Sales'].replace(/[^0-9.-]+/g,""));
      }
    }
  }
}

// Takes cafe template json and adds number fields for use in the main program
const prepCompObject = (cafesObject) => {
  return new Promise((resolve, reject) => {
    for (let cafe in cafesObject) {
      cafesObject[cafe].thisYear = 0;
      cafesObject[cafe].lastYear = 0;
      cafesObject[cafe].thisWeek = 0;
      cafesObject[cafe].lastWeek = 0;
      cafesObject[cafe].change = 0;
      cafesObject[cafe].percentChange = 0;
      cafesObject[cafe].percentChangeWeek = 0;
      cafesObject[cafe].totalNet = 0;
    }
    resolve(cafesObject)
  })
}

const sortByKey = (array, key) => {
  return array.sort(function(a, b) {
      var x = a[key]; var y = b[key];
      return ((x > y) ? -1 : ((x < y) ? 1 : 0));
  });
}

// Finds the year over year or week over week change in sales
const getChange = (cafes, key, keyToEdit) => {
  for (let cafe in cafes) {
    if (cafes[cafe][key] != 0) {
      cafes[cafe][keyToEdit] = cafes[cafe].thisYear - cafes[cafe][key];
    }
  }
}

const getPercentChange = (cafes, keydata, keyChange, keyToEdit) => {
  for (let cafe in cafes) {
    if (cafes[cafe][keydata] != 0) {
      cafes[cafe][keyToEdit] = cafes[cafe][keyChange]/cafes[cafe][keydata];
    } else {
      cafes[cafe][keyToEdit] = 0;
    }
  }
}

/**
* @param {json} cafes Recieves json object to get totals on
* creates variables with number value of 0 then iterates through cafe object to get total for each category
**/
const getTotals = (cafes) => {
  let thisYearX = 0;
  let lastYearX = 0;
  let thisWeekX = 0;
  let lastWeekX = 0;
  let changeX = 0;
  let changeWeekX = 0;
  let totalNetX = 0;
  for (let cafe in cafes) {
    thisWeekX += cafes[cafe].thisWeek;
    totalNetX += cafes[cafe].totalNet;
    if (cafes[cafe].lastYear != 0) {
      thisYearX += cafes[cafe].thisYear;
      lastYearX += cafes[cafe].lastYear;
      changeX += cafes[cafe].change;
    }
    if (cafes[cafe].lastWeek != 0) {
      lastWeekX += cafes[cafe].lastWeek;
      changeWeekX += cafes[cafe].changeWeek;
    }
  }
  const totals = {
    'Location' : 'TOTAL',
    'thisYear' : thisYearX,
    'lastYear' : lastYearX,
    'thisWeek' : thisWeekX,
    'lastWeek' : lastWeekX,
    'change' : changeX,
    'changeWeek' : changeWeekX,
    'percentChange' : 0,
    'totalNet' : totalNetX
  }
  cafes.push(totals);
}

module.exports.crunchNumbers = crunchNumbers;
module.exports.crunchCategories = crunchCategories;
module.exports.getTotalNet = getTotalNet;
module.exports.prepCompObject = prepCompObject;
module.exports.sortByKey = sortByKey;
module.exports.getChange = getChange;
module.exports.getTotals = getTotals;
module.exports.getPercentChange = getPercentChange;
