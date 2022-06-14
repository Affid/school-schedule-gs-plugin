
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
  setValues(valuesToSet);
}

function setValues(valuesToSet){

}

/**
 * Sets up the arguments for the given trigger.
 *
 * @param {*} existingHomeworks - homeworks already in the sheet
 * 
 * @param {*} homeworksPerDate - homeworks to add
 * 
 * @return {Date} - firstDayToParse
 */
function mergeExistingHomeworkWithNew(existingHomeworks, homeworksPerDate) {
  console.log("Existing homeworks");
  console.log(existingHomeworks);
  console.log("New homeworks");
  console.log(homeworksPerDate);
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
 * @return {LessonDay[]} homeworks
 */
function getHomeworksForTenDay(firstDayToParse) {
  var homeworks = `{
    "homeworks": [{
      "date": "15.06.2022",
      "lessons": [{
        "number": 1,
        "name": "Английский язык",
        "task": "п.1 , стр12 упр. 5-10"
      },
      {
        "number": 2,
        "name": "Русский язык",
        "task": "п.1 , стр12 упр. 5-15"
      }]
    },
    {
      "date": "16.06.2022",
      "lessons": [{
        "number": 2,
        "name": "Английский язык",
        "task": "п.1 , стр12 упр. 5-10"
      },
      {
        "number": 4,
        "name": "Русский язык",
        "task": "п.1 , стр12 упр. 5-15"
      }]
    }]
  }`;
  return convertFromJsonToDays(homeworks);
}


/**
 * @param {Date} firstDayToParse
 * 
 * @return {Day[]} homeworks
 */
function getExistingHomeworksForTenDay(firstDayToParse) {
  var headers = ["Дата", "Англ. язык", "Биология","География"];
  var days = [["10.05.2022", "Placeholder for task1", "Placeholder for task2", "Placeholder for task3"]];
  var result = convertFromSheetToDays(headers,days);
  console.log(result);
  return result;
}
