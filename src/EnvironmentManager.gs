/**
 * @param {String} login
 */
function setDnevnikLogin(login) {
  var properties = PropertiesService.getScriptProperties();
  properties.setProperty('login', login);
}

/**
 * @param {String} password
 */
function setDnevnikPassword(password) {
  var properties = PropertiesService.getScriptProperties();
  properties.setProperty('password', password);
}

/**
 * @param {Number} hour
 */
function setBoundDayTime(hour) {
  var properties = PropertiesService.getScriptProperties();
  properties.setProperty('lastAcceptedHour', hour);
}

/**
 * @param {Boolean} autoUpdateNeeded
 */
function setAutoUpdateNeeded(autoUpdateNeeded) {
  var properties = PropertiesService.getScriptProperties();
  properties.setProperty('autoUpdateNeeded', autoUpdateNeeded);
}

/**
 * @param {Number} numberOfDays
 */
function setDayToParseAmount(numberOfDays) {
  var properties = PropertiesService.getScriptProperties();
  properties.setProperty('numberOfDaysToParse', numberOfDays);
}

/**
 * @return {String} - login
 */
function getDnevnikLogin() {
  var properties = PropertiesService.getScriptProperties();
  return properties.getProperty('login');
  
}

/**
 * @return {String} - password
 */
function getDnevnikPassword() {
  var properties = PropertiesService.getScriptProperties();
  return properties.getProperty('password');
}

/**
 * @return {Number} - hour
 */
function getBoundDayTime() {
  var properties = PropertiesService.getScriptProperties();
  return Number.parseInt(properties.getProperty('lastAcceptedHour'));
}

/**
 * @return {Boolean} - autoUpdateNeeded
 */
function getAutoUpdateNeeded() {
  var properties = PropertiesService.getScriptProperties();
  return properties.getProperty('autoUpdateNeeded').toLowerCase() === 'true';
}

/**
 * @return {Number} - hour
 */
function getDayToParseAmount() {
  var properties = PropertiesService.getScriptProperties();
  return Number.parseInt(properties.getProperty('numberOfDaysToParse'));
}

