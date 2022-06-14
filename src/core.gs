
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
  if ((scriptStartTime.getHours() > lastHour)
    || (scriptStartTime.getHours() == lastHour && scriptStartTime.getMinutes() > 0)) {
    console.log("Время позже последнего допустимого для учета сегодняшнего дня. Обновление будет произведено начиная со следующего дня");
    return new Date(scriptStartTime.getFullYear, scriptStartTime.getMonth, scriptStartTime.getDate() + 1);
  }
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
 */
function getHomeworksForTenDay(firstDayToParse) {
  var homeworks = {"14.06.2022": {
    "Английский язык": "Placeholder задания 1",
    "Математика": "Placeholder задания 2", 
    "Русский язык": "Placeholder задания 3", 
    "Биология": "Placeholder задания 4"

  }}
}


/**
 * @param {Date} firstDayToParse
 */
function getExistingHomeworksForTenDay(firstDayToParse) {

}
