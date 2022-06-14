function updateSettings() {
  var userData = showSettingDialog();
  setAutoUpdateNeeded(userData["autoUpdateNeeded"]);
  setDnevnikLogin(userData["login"]);
  setDnevnikPassword(userData["password"]);
  setBoundDayTime(userData["lastAcceptedHour"]);
}

/**
 * @return {Object} - user settings
 */
function showSettingDialog() {

}
