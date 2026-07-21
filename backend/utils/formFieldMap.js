// Maps Google Form response sheet column headers (exact question titles) to
// our Registration schema field keys. Used by the form-response sync job.

function memberHeaderMap(n) {
  return {
    [`Member ${n} Full Name`]: `member${n}FullName`,
    [`Member ${n} Roll Number`]: `member${n}RollNumber`,
    [`Member ${n} Branch and Section`]: `member${n}BranchSection`,
    [`Member ${n} Year`]: `member${n}Year`,
    [`Member ${n} Gender`]: `member${n}Gender`,
    [`Member ${n} Email Address`]: `member${n}EmailAddress`,
  };
}

const REGISTRATION_FORM_HEADER_MAP = {
  "Team Name": "teamName",
  "Team Leader Full Name": "teamLeaderFullName",
  "Team Leader Roll Number": "teamLeaderRollNumber",
  "Team Leader Branch and Section": "teamLeaderBranchSection",
  "Team Leader Year": "teamLeaderYear",
  "Team Leader Gender": "teamLeaderGender",
  "Team Leader Phone Number": "teamLeaderPhoneNumber",
  "Team Leader Email Address": "teamLeaderEmailAddress",
  ...memberHeaderMap(2),
  ...memberHeaderMap(3),
  ...memberHeaderMap(4),
  ...memberHeaderMap(5),
  ...memberHeaderMap(6),
  Declaration: "declaration",
};

module.exports = { REGISTRATION_FORM_HEADER_MAP };
