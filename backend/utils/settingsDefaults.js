const SETTINGS_DEFAULTS = {
  registrationOpen: "true",
  submissionOpen: "false",
  evaluationOpen: "false",
  resultsPublished: "false",
  currentPhase: "Registration Open",
  registrationFormUrl: "",
  submissionFormUrl: "",
  importantDates: "[]",
  formResponsesSheetName: "Form Responses 1",
  lastSyncedFormRow: "0",
};

function settingsFromRows(rows) {
  const settings = { ...SETTINGS_DEFAULTS };

  rows.forEach((row) => {
    if (!row.key) return;
    if (row.value === undefined || row.value === null || row.value === "") return;
    settings[row.key] = row.value;
  });

  return settings;
}

module.exports = { SETTINGS_DEFAULTS, settingsFromRows };
