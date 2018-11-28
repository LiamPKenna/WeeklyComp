    // Connects tools used to convert csv=>jason and json=>csv
const getCsv = require('./js/csvHandler.js').getCsv;
const writeCsv = require('./js/csvHandler.js').writeCsv;

    // Connects tools used to locate file locations and return them as strings
const findFile = require('./js/findFile.js').findFile;
const findFileArray = require('./js/findFile.js').findFileArray;

    //TOOLS
const prepCompObject = require('./js/tools.js').prepCompObject;  // Requires tool that takes cafe template json and adds number fields for use in the main program
const crunchNumbers = require('./js/tools.js').crunchNumbers;  // Requires tool that takes prepared cafes object and runs through line items in a single report to get desired data
const getTotalNet = require('./js/tools.js').getTotalNet;  // Uses the data from above to find the total sales for all categories except the one specified (gift)
const getChange = require('./js/tools.js').getChange;  // Uses the data from above to find the year over year or week over week change in sales
const getTotals = require('./js/tools.js').getTotals;  // Uses the data from above to find the week to week change in sales
const getPercentChange = require('./js/tools.js').getPercentChange;  // Uses the data from above to find the week to week change in sales as a percentage
const sortByKey = require('./js/tools.js').sortByKey;  // Sorts the object by the requested field (Large=>Small)

    // Take query from command line,
const query = process.argv.slice(2);
console.log(`Getting comp results for "${query[0]}"`);
const searchString = query[0];

/**
* @param {string} beansLW Recieves file path of the CSV file with the earliest date to be converted to JSON
* @param {string} stringLW Recieves text to be used for the object key related to the coresponding week
* @param {string} beansTW Recieves file path of the CSV file with the latest date to be converted to JSON
* @param {string} stringTW Recieves text to be used for the object key related to the coresponding week
* @return {boolean} true
*/
const start = async (merchLY, merchLW, merchTY, template) => {
    // Strings for key use in cafe object
  const stringTY = 'thisYear';
  const stringLY = 'lastYear';
  const stringTW = 'thisWeek';
  const stringLW = 'lastWeek';
  const stringtotalNet = 'totalNet';
  const stringChange = 'change';
  const stringChangeWeek = 'changeWeek';
  const stringPC = 'percentChange';
  const stringPCW = 'percentChangeWeek';
  const stringPTN = 'percentTotalNet';
      // Convert csv files to usable json
  const lastYearJson = await getCsv(merchLY);
  const lastWeekJson = await getCsv(merchLW);
  const thisYearJson = await getCsv(merchTY);
  const cafes = await getCsv(template);
      // Prepare the cafe json for data
  const fixedCafes = await prepCompObject(cafes);
      // Run through all weeks to find net total sold in each cafe and update that data field
  crunchNumbers(fixedCafes, lastYearJson, stringLY, searchString); // Running the numbers for previous year
  crunchNumbers(fixedCafes, lastWeekJson, stringLW, searchString); // Running the numbers for last week
  crunchNumbers(fixedCafes, thisYearJson, stringTY, searchString); // Running the numbers for the most recent week and storing as thisYear
  crunchNumbers(fixedCafes, thisYearJson, stringTW, searchString); // Running the numbers for the most recent week and storing as thisWeek

  getTotalNet(fixedCafes, thisYearJson, stringtotalNet, 'Gift');  // Find total sales less Gift cards for each cafe
  getChange(fixedCafes, stringLY, stringChange);  // Do math on the weeks to get change year over year and update that field for each cafe
  getChange(fixedCafes, stringLW, stringChangeWeek);  // Do math on the weeks to get change week over week and update that field for each cafe
  sortByKey(fixedCafes, stringChangeWeek);  // Sort by change week over week: highest on top
  getTotals(fixedCafes);  // Do math on the weeks to get totals, then create a new object containing those values and push into cafe object
  getPercentChange(fixedCafes, stringLY, stringChange, stringPC);  // Do math on the weeks to get change year over year and update that field for each cafe
  getPercentChange(fixedCafes, stringLW, stringChangeWeek, stringPCW);  // Do math on the weeks to get change week over week and update that field for each cafe
  getPercentChange(fixedCafes, stringtotalNet, stringTW, stringPTN); // Find the percentage of total sales represented by thisWeek
  writeCsv(fixedCafes, `${searchString}Comp`, results);  // Write json data to csv format file named using the string passed in and today's date in the root folder
  console.log(`done`);
}

const item = 'category-sales';  // Declare file name pattern
const fileFolder = 'csv_weekly';  // Declare file location string
const results = './results/'  // string of results directory

    //find the three category sales files coresponding to last year last week and this week. Store them as strings
const filesArray = findFileArray(item, fileFolder);
const merchLY = filesArray[0];
const merchLW = filesArray[1];
const merchTY = filesArray[2];
    //find the template file with cafe names and coresponding Staff Pick coffee names
const template = findFile('template', '2018', fileFolder);

start(merchLY, merchLW, merchTY, template);
