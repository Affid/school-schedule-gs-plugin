const SUBJECT_COLUMN = 2;
const COMMENT_COLUMN = 4;
const DAY_ROWS_AMOUNT = 8;


function saveTodayCommentsToHistoryAndClearSchedule() {
  var today = new Date();

  var sheets = SpreadsheetApp.getActiveSpreadsheet().getSheets();
  var scheduleSheet = sheets[0];
  var historySheet = sheets[1];


  console.log("Merging comments and homeworks...");
  
  moveHomeworkAndCommentToHistoryMerged(today, historySheet, scheduleSheet);

  console.log("Clearing old comments...");
  clearComments(today, scheduleSheet);

  console.log("Success");
}


/**
 * @param {Date} today
 * 
 * @param {SpreadsheetApp.Sheet} scheduleSheet
 * 
 * @param {SpreadsheetApp.Sheet} historySheet
 */
function moveHomeworkAndCommentToHistoryMerged(today, historySheet, scheduleSheet) {

  var todayHomeworksAndComments = getTodayHomeworkAndComments(today, scheduleSheet, historySheet);

  var mergedHomeworksAndCommentsBySubject = Object.assign({}, ...todayHomeworksAndComments.map((x) => ({ [x.subject]: `${x.homework}${x.homework === "" ? "" : x.comment === "" ? "" : " | "}${x.comment}` })));

  updateHistoryWitComments(today, historySheet, mergedHomeworksAndCommentsBySubject);
}

/**
 * @param {Date} today
 * 
 * @param {SpreadsheetApp.Sheet} scheduleSheet
 */
function clearComments(today, scheduleSheet){
  var todayStartRow = getTodayStartRow(today);

  var commentsColumns = scheduleSheet.getRange(todayStartRow, COMMENT_COLUMN, DAY_ROWS_AMOUNT);

  var emptyValues = [[''],[''],[''],[''],[''],[''],[''],['']];

  commentsColumns.setValues(emptyValues);
}

/**
 * @param {Date} today
 * 
 * @param {SpreadsheetApp.Sheet} scheduleSheet
 * 
 * @param {SpreadsheetApp.Sheet} historySheet
 * 
 * @return {HomeworkAndCommentBySubject[]} - homeworks and comments by subject for the date
 */
function getTodayHomeworkAndComments(today, scheduleSheet, historySheet) {
  var homeworksAndComments = [];

  var todaySubjects = getTodaySubjectsDistinct(today, scheduleSheet);

  var todayComments = getTodayComments(today, scheduleSheet, todaySubjects);

  var todayHomeworks = getTodayHomeworks(today, historySheet, todaySubjects);


  todaySubjects.forEach((subject) => {
    var homework = todayHomeworks[subject];
    var comment = todayComments[subject];
    var homeworkAndComment = new HomeworkAndCommentBySubject(subject, homework, comment);

    homeworksAndComments.push(homeworkAndComment);
  });

  return homeworksAndComments;
}

/**
 * @param {Date} today
 * 
 * @param {SpreadsheetApp.Sheet} sheet
 * 
 * @return {string[]} - distinct list of today subjects
 */
function getTodaySubjectsDistinct(today, sheet) {
  var todaySubjects = getTodaySubjects(today, sheet);

  return [...new Set(todaySubjects)];

}

/**
 * @param {Date} today
 * 
 * @param {string[]} todaySubjects
 * 
 * @param {SpreadsheetApp.Sheet} scheduleSheet
 * 
 */
function getTodayComments(today, scheduleSheet, todaySubjects) {
  var comments = Object.assign({}, ...todaySubjects.map((x) => ({ [x]: [] })));

  var todayStartRow = getTodayStartRow(today);

  var commentsFromSheet = scheduleSheet.getRange(todayStartRow, SUBJECT_COLUMN, DAY_ROWS_AMOUNT, COMMENT_COLUMN - SUBJECT_COLUMN + 1).getDisplayValues();

  commentsFromSheet.forEach((row) => {
    var subject = row[0]?.replace(/\*/g, "");
    var comment = row[2];

    if (comment === "") {
      return;
    }

    if (subject === "") {
      SpreadsheetApp.getUi().alert(`Комментарий ${comment} не относится ни к одному предмету`);
      return;
    }

    if (!todaySubjects.includes(subject)) {
      SpreadsheetApp.getUi().alert(`Предмет ${subject} не найден в сегодняшнем дне. Обратитесь в поддержку, если увидели это сообщение.`);
      return;
    }

    comments[subject].push(comment);
  })

  for (const subj in comments) {
    comments[subj] = comments[subj].reduce((prev, curr) => prev === "" ? curr : `${prev}; ${curr}`, "");
  }

  return comments;
}

/**
 * @param {Date} today
 * 
 * @param {string[]} todaySubjects
 * 
 * @param {SpreadsheetApp.Sheet} historySheet
 * 
 */
function getTodayHomeworks(today, historySheet, todaySubjects) {
  var subjectToColumn = historySheet.getRange(1, 1, 1, historySheet.getLastColumn()).getDisplayValues()
    .map((row) => Object.assign({}, ...row.map((x, index) => ({ [x]: index }))))[0];


  var todayRow = historySheet.getRange(1, 1, historySheet.getLastRow()).getValues()
    .findIndex(value => value[0] instanceof Date && value[0].toLocaleDateString() === today.toLocaleDateString());

  if (todayRow === -1) {
    SpreadsheetApp.getUi().alert(`Текущий день ${today.toLocaleDateString()} не найден на листе ДЗ`);
    return undefined;
  }

  var historyHomeworks = historySheet.getRange(todayRow + 1, 1, 1, historySheet.getLastColumn()).getDisplayValues()[0];

  var homeworks = Object.assign({}, ...todaySubjects.map((x) => ({ [x]: historyHomeworks[subjectToColumn[x]] })));

  return homeworks;
}

/**
 * @param {Date} today
 * 
 * @param {SpreadsheetApp.Sheet} historySheet
 * 
 */
function updateHistoryWitComments(today, historySheet, mergedHomeworksAndCommentsBySubject) {
  var subjects = historySheet.getRange(1, 1, 1, historySheet.getLastColumn()).getDisplayValues()[0];


  var todayRow = historySheet.getRange(1, 1, historySheet.getLastRow()).getValues()
    .findIndex(value => value[0] instanceof Date && value[0].toLocaleDateString() == today.toLocaleDateString());

  if (todayRow === -1) {
    SpreadsheetApp.getUi().alert(`Текущий день ${today.toLocaleDateString()} не найден на листе ДЗ`);
    return undefined;
  }

  var targetHistoryRow = historySheet.getRange(todayRow + 1, 1, 1, historySheet.getLastColumn());

  var valuesToSet = targetHistoryRow.getValues()[0].map((val, index) => {
    if (!mergedHomeworksAndCommentsBySubject.hasOwnProperty(subjects[index])) {
      return val;
    }

    return mergedHomeworksAndCommentsBySubject[subjects[index]];
  });

  targetHistoryRow.setValues([valuesToSet]);
}

/**
 * @param {Date} today
 * 
 * @param {SpreadsheetApp.Sheet} sheet
 * 
 * @return {string[]} - list of today subjects
 */
function getTodaySubjects(today, sheet) {

  var todayStartRow = getTodayStartRow(today);

  var subjects = sheet.getRange(todayStartRow, SUBJECT_COLUMN, DAY_ROWS_AMOUNT);

  return subjects.getDisplayValues()
    .map((value) => value[0])
    .filter((value) => value != '' && value != null && value != undefined)
    .map((value) => value.replace(/\*/g, ""));
}


function getTodayStartRow(today) {
  return 4 + (today.getDay() - 1) * 8;
}
