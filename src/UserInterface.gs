function updateSettings(userData) {
  setAutoUpdateNeeded(userData["autoUpdate"]);
  setDnevnikLogin(userData["login"]);
  setDnevnikPassword(userData["password"]);
  setBoundDayTime(userData["lastHour"]);
}

function openSettings() {
  var html = HtmlService.createHtmlOutputFromFile('SetEnvironment');
  SpreadsheetApp.getUi()
   .showModalDialog(
     html.setHeight(450).setWidth(650),
     'Переменные среды'
   )
}

function openManualUpdateDialog(){
  var form = HtmlService.createHtmlOutputFromFile('UpdateDate');
  SpreadsheetApp.getUi()
   .showModalDialog(
     form.setHeight(450).setWidth(650),
     'Ручное обновление'
   )
}

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu("Дневник")
  .addItem("Настройки", "openSettings")
  .addSeparator()
  .addItem("Обновить сейчас", "updateOnClick")
  .addItem("Обновить вручную", "openManualUpdateDialog")
  .addToUi();
}

function updateWithDateFromForm(form){
  var startDate = form["start_date"]
  console.log(startDate)
  updateManually(startDate)
  SpreadsheetApp.getUi().alert("Данные обновлены.");
}

function getValuesFromForm(form){
  var login = form.login
  var password = form.password
  var autoUpdate = form.autoUpdate === "true"
  var lastHour = form.lastHour
  var settings = {}
  settings.login = login;
  settings.password = password;
  settings.autoUpdate = autoUpdate;
  settings.lastHour = lastHour;
  updateSettings(settings);
  console.log(getDnevnikLogin());
  console.log(getDnevnikPassword());
  console.log(getAutoUpdateNeeded());
  console.log(getBoundDayTime());
  SpreadsheetApp.getUi().alert("Значения успешно сохранены");
}
