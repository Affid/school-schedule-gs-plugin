
function autoUpdate() {
  if (getAutoUpdateNeeded()) {
    updateSchedule();
  }
}

function updateOnClick() {

}


function updateSchedule() {
  var scriptStartTime = getScriptStartTime();
  var firstDayToParse = getFirstIncludedDay(scriptStartTime);
  var homeworksPerDate = getHomeworksForTenDay(firstDayToParse);
  var existingHomeworks = getExistingHomeworksForTenDay(firstDayToParse);
  var valuesToSet = mergeExistingHomeworkWithNew(existingHomeworks, homeworksPerDate);
  setValues(valuesToSet, getSheetHeaders());
  console.log("Данные обновлены на листе ДЗ");
}

/**
 * @param {HomeworkDay[]} valuesToSet
 * 
 * @param {Object[]} headers
 */
function setValues(valuesToSet, headers) {
  var sortedDays = valuesToSet.sort((a, b) => a.date.getTime() - b.date.getTime());
  var firstDay = sortedDays[0].date;
  var lastRow = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("ДЗ").getLastRow();
  lastRow = lastRow < 11 ? 1 : lastRow - 10; 
  var dateColumn = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("ДЗ").getRange(lastRow, 1, 10, 1).getValues();
  var index = dateColumn.findIndex(value => value[0] instanceof Date && value[0].getTime() == firstDay.getTime());
  index = index == -1 ? lastRow + 1 : index + lastRow;

  var newSubjects = sortedDays.map(value => value.homeworks.map(hw => hw.name)).reduce((prev, curr) => {
    if(prev === undefined){
      return curr;
    }
    return [...new Set(prev.concat(curr))];
  }).filter(subj => !headers.includes(subj));

  if(newSubjects.length > 0){
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
    return new Date(scriptStartTime.getFullYear, scriptStartTime.getMonth, scriptStartTime.getDate() + 1);
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
  var homeworks = `{
    "homeworks": [{
      "date": "06.15.2022",
      "lessons": [{
        "number": 1,
        "name": "Английский язык",
        "task": "п.1 , стр12 упр. 5-25"
      },
      {
        "number": 2,
        "name": "Русский язык",
        "task": "п.1 , стр12 упр. 5-15"
      }]
    },
    {
      "date": "06.16.2022",
      "lessons": [{
        "number": 2,
        "name": "Английский язык",
        "task": "п.1 , стр12 упр. 5-10"
      },
      {
        "number": 4,
        "name": "Русский язык",
        "task": "п.1 , стр12 упр. 5-15"
      },
      {
        "number": 5,
        "name": "Биохимия",
        "task": "п.1 , стр12 упр. 5-15"
      }]
    }]
  }`;
  var homeworksPerDay = convertFromJsonToDays(homeworks);
  return homeworksPerDay.map((value) => {
    var hwPerName = {};
    value.lessons.forEach(lesson => {
      hwPerName[lesson.homework.name] = hwPerName[lesson.homework.name] == undefined ? lesson.homework.task : hwPerName[lesson.homework.name] + "; " + lesson.homework.task;
    })
    var hw = Object.keys(hwPerName).map((key) => new Homework(key, hwPerName[key]))
    return new HomeworkDay(new Date(value.date), hw);
  })
}


/**
 * @param {Date} firstDayToParse
 * 
 * @return {HomeworkDay[]} homeworks
 */
function getExistingHomeworksForTenDay(firstDayToParse) {
  var headers = getSheetHeaders();

  var lastRow = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("ДЗ").getLastRow();
  if(lastRow == 1){
    return convertFromSheetToDays(headers, []);
  }
  var dateColumn = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("ДЗ").getRange(lastRow - 10, 1, 10, 1).getValues();
  var index = dateColumn.findIndex(value => {
    var t1 = { "year": value[0].getFullYear(), "month": value[0].getMonth(), "day": value[0].getDate() };
    var t2 = { "year": firstDayToParse.getFullYear(), "month": firstDayToParse.getMonth(), "day": firstDayToParse.getDate() };
    var t3 = JSON.stringify(t1) === JSON.stringify(t2);
    return value[0] instanceof Date && t3;
  });
  index = index == -1 ? lastRow + 1 : index + lastRow - 10;

  var days = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("ДЗ").getRange(index, 1, 10, headers.length).getValues();

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
function updateHeaders(headers){
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName("ДЗ").getRange(1, 1, 1, headers.length).setValues([headers]);
}

