/**
 * @param {String} homeworks - json text
 * 
 * @return {LessonDay[]} schedule
 */
function convertFromJsonToDays(homeworks) {
  return JSON.parse(homeworks, parseKeyValue)["homeworks"];
}

/**
 * @param {Object[][]} days
 * 
 * @param {Object[]} headers
 * 
 * @return {HomeworkDay[]} schedule
 */
function convertFromSheetToDays(headers, days) {
  var schedule = days.map((value) => {
    var date = new Date(value[0]);
    var homeworks = convertArrayToHomeworks(value, headers);
    return new HomeworkDay(date, homeworks);
  });

  return schedule;
}

/**
 * @param {Object[]} row
 * 
 * @param {Object[]} headers
 * 
 * @return {Homework[]} homework
 */
function convertArrayToHomeworks(row, headers) {
  return row.filter((value, index) => {return index > 0}).map((value, index) => { return new Homework(headers[index], value) });
}

function parseKeyValue(key, value) {
  switch (key) {
    case 'number': return Number.parseInt(value);
    case 'name':
    case 'task': return value;
    case 'lessons': return convertArrayToLessonArray(value);
    case 'date': return new Date(value);
    case 'homeworks': return convertArrayToDayArray(value);
    default: return value;
  }
}

/**
 * @param {Array} array
 * 
 * @return {Lesson[]}
 */
function convertArrayToLessonArray(array) {
  return array.map((value) => { return new Lesson(value["number"], new Homework(value["name"], value["task"])) });
}

function convertArrayToDayArray(array) {
  return array.map((value) => { return new LessonDay(value["date"], value["lessons"]) });
}
