const MILLIS_PER_DAY = 1000 * 60 * 60 * 24;
const SCHEDULE_APP_URL = "https://dnevnik-schedule.herokuapp.com/schedule/?dateFrom=%s&dateTo=%s&login=%s&password=%s"

function autoUpdate() {
  if (getAutoUpdateNeeded()) {
    var scriptStartTime = getScriptStartTime();
    updateSchedule(scriptStartTime);
  }
}

function updateOnClick() {
  var scriptStartTime = getScriptStartTime();
  updateSchedule(scriptStartTime);
}

/**
 * Manually updates the sheet.
 *
 * @param {Date} scriptStartTime
 */
function updateManually(scriptStartTime) {
  date = new Date(scriptStartTime);
  console.log("==================")
  console.log(date);
  updateSchedule(date);
}

/**
 * Updates the sheet.
 *
 * @param {Date} scriptStartTime
 */
function updateSchedule(scriptStartTime) {
  var firstDayToParse = getFirstIncludedDay(scriptStartTime);
  var homeworksPerDate = getHomeworksForTenDay(firstDayToParse);
  var existingHomeworks = getExistingHomeworksForTenDay(firstDayToParse);
  var valuesToSet = mergeExistingHomeworkWithNew(existingHomeworks, homeworksPerDate);
  setValues(valuesToSet, getSheetHeaders());
  console.log("Данные обновлены на листе ДЗ");
  setLastUpdateDateTime(getScriptStartTime())
}

/**
 * Sets up the time of update into the sheet.
 *
 * @param {Date} scriptStartTime
 */
function setLastUpdateDateTime(scriptStartTime) {
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Расписание Неделя").getRange("J5").setValue(scriptStartTime)
}

/**
 * @param {HomeworkDay[]} valuesToSet
 * 
 * @param {Object[]} headers
 */
function setValues(valuesToSet, headers) {
  if (valuesToSet.length == 0) {
    console.log("There is nothing to set")
    return;
  }
  var sortedDays = valuesToSet.sort((a, b) => a.date.getTime() - b.date.getTime());
  var firstDay = sortedDays[0].date;
  var lastRow = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("ДЗ").getLastRow();
  var dateColumn = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("ДЗ").getRange(1, 1, lastRow, 1).getValues();
  var index = dateColumn.findIndex(value => value[0] instanceof Date && value[0].getTime() == firstDay.getTime());
  index = index == -1 ? lastRow + 1 : index + 1;

  var newSubjects = sortedDays.map(value => value.homeworks.map(hw => hw.name)).reduce((prev, curr) => {
    if (prev === undefined) {
      return curr;
    }
    return [...new Set(prev.concat(curr))];
  }).filter(subj => !headers.includes(subj));

  if (newSubjects.length > 0) {
    headers.push(...newSubjects);
    updateHeaders(headers);
  }

  var values = sortedDays.map((value, i) => {
    return headers.map((header => {
      if (header == "Дата") {
        return value.date;
      }
      return value.homeworks.find(hw => hw.name === header)?.task;
    }));
  });

  SpreadsheetApp.getActiveSpreadsheet().getSheetByName("ДЗ").getRange(index, 1, values.length, values[0].length).setValues(values);
}

/**
 * Sets up the arguments for the given trigger.
 *
 * @param {HomeworkDay[]} existingHomeworks - homeworks already in the sheet
 * 
 * @param {HomeworkDay[]} homeworksPerDate - homeworks to add
 * 
 * @return {HomeworkDay[]} - new homeworks to set
 */
function mergeExistingHomeworkWithNew(existingHomeworks, homeworksPerDate) {
  console.log("Existing homeworks:\n" + JSON.stringify(existingHomeworks));
  console.log("New homeworks:\n" + JSON.stringify(homeworksPerDate));
  var homeworksToAdd = homeworksPerDate.map((hw) => {
    var exisitingHwForDay = existingHomeworks.find(hwEx => hwEx.date.getTime() === hw.date.getTime());
    if (exisitingHwForDay === undefined) {
      return hw;
    }
    var newHws = hw.homeworks.filter(homework => {
      var old = exisitingHwForDay.homeworks.find(exHw => { return exHw != undefined && homework.name === exHw.name });
      return old === undefined || old.task != homework.task;
    });


    return new HomeworkDay(hw.date, newHws.concat(exisitingHwForDay.homeworks));
  });
  console.log("Homeworks to add:\n" + JSON.stringify(homeworksToAdd));
  return homeworksToAdd;
}

/**
 * Sets up the arguments for the given trigger.
 *
 * @param {Date} scriptStartTime
 * 
 * @return {Date} - firstDayToParse
 */
function getFirstIncludedDay(scriptStartTime) {
  console.log("Текущее время: " + Utilities.formatDate(scriptStartTime, "GMT+3", "yyyy-MM-dd'T'HH:mm:ss"));
  var lastHour = getBoundDayTime();
  if (scriptStartTime.getHours() > lastHour
    || (scriptStartTime.getHours() == lastHour && scriptStartTime.getMinutes() > 0)) {
    console.log("Время позже последнего допустимого для учета сегодняшнего дня. Обновление будет произведено начиная со следующего дня");
    var firstIncludedDay = new Date(scriptStartTime.getTime() + MILLIS_PER_DAY);
    return firstIncludedDay;
  }
  console.log("Обновление будет произведено начиная с текущего дня");
  return scriptStartTime;
}

/**
 * @return {Date} - currentDateTime
 */
function getScriptStartTime() {
  return new Date();
}

/**
 * @param {Date} firstDayToParse
 * 
 * @return {HomeworkDay[]} homeworks
 */
function getHomeworksForTenDay(firstDayToParse) {
  var lasDay = new Date(firstDayToParse.getTime() + MILLIS_PER_DAY * 10);
  var strFirstDay = Utilities.formatDate(firstDayToParse, "GMT+3", "MM.dd.yyyy");
  var strLastDay = Utilities.formatDate(lasDay, "GMT+3", "MM.dd.yyyy");
  console.log(Utilities.formatString(SCHEDULE_APP_URL, strFirstDay, strLastDay, getDnevnikLogin(), getDnevnikPassword()))
  var homeworks = UrlFetchApp.fetch(Utilities.formatString(SCHEDULE_APP_URL, strFirstDay, strLastDay, getDnevnikLogin(), getDnevnikPassword())).getContentText();
  var homeworksPerDay = convertFromJsonToDays(homeworks);
  return homeworksPerDay.map((day) => {
    var hwPerName = {};
    day.lessons.forEach(lesson => {
      hwPerName[lesson.homework.name] = hwPerName[lesson.homework.name] == undefined ? lesson.homework.task : hwPerName[lesson.homework.name] + "; " + lesson.homework.task;
    })
    var hw = Object.keys(hwPerName).map((key) => new Homework(key, hwPerName[key]))
    return new HomeworkDay(new Date(day.date), hw);
  })
}


/**
 * @param {Date} firstDayToParse
 * 
 * @return {HomeworkDay[]} homeworks
 */
function getExistingHomeworksForTenDay(firstDayToParse) {
  var headers = getSheetHeaders();
  var offset = 10;

  var lastRow = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("ДЗ").getLastRow();
  if (lastRow == 1) {
    return convertFromSheetToDays(headers, []);
  }
  var firstRowToCheck = lastRow - offset;
  if (firstRowToCheck < 1) {
    firstRowToCheck = 1;
  }

  var dateColumn = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("ДЗ").getRange(firstRowToCheck, 1, offset, 1).getValues();
  var firstDayToParseIndex = dateColumn.findIndex(value => {
    if (!(value[0] instanceof Date)) {
      return false;
    }
    var t1 = { "year": value[0].getFullYear(), "month": value[0].getMonth(), "day": value[0].getDate() };
    var t2 = { "year": firstDayToParse.getFullYear(), "month": firstDayToParse.getMonth(), "day": firstDayToParse.getDate() };
    var t3 = JSON.stringify(t1) === JSON.stringify(t2);
    return t3;
  });
  firstDayToParseIndex = firstDayToParseIndex == -1 ? lastRow + 1 : firstDayToParseIndex + firstRowToCheck;

  offset = lastRow - firstDayToParseIndex;

  offset = offset <= 0 ? 1 : offset;

  var days = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("ДЗ").getRange(firstDayToParseIndex, 1, offset, headers.length).getValues();

  return convertFromSheetToDays(headers, days);
}

/**
 * @return {String[]} homeworks
 */
function getSheetHeaders() {
  var lastColumn = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("ДЗ").getLastColumn();
  var headers = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("ДЗ").getRange(1, 1, 1, lastColumn).getValues();
  return headers[0];
}

/**
 * @param {Object[]} headers
 */
function updateHeaders(headers) {
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName("ДЗ").getRange(1, 1, 1, headers.length).setValues([headers]);
}

