// Column definitions for every sheet in the spreadsheet. `key` is the object
// property used throughout the app; `header` is the human-readable column
// label written to row 1. Column order here is the column order in the sheet.

function memberFields(n) {
  return [
    { key: `member${n}FullName`, header: `Member ${n} Full Name` },
    { key: `member${n}RollNumber`, header: `Member ${n} Roll Number` },
    { key: `member${n}BranchSection`, header: `Member ${n} Branch and Section` },
    { key: `member${n}Year`, header: `Member ${n} Year` },
    { key: `member${n}Gender`, header: `Member ${n} Gender` },
    { key: `member${n}EmailAddress`, header: `Member ${n} Email Address` },
  ];
}

const REGISTRATION_FIELDS = [
  { key: "id", header: "Record ID" },
  { key: "teamId", header: "Team ID" },
  { key: "teamName", header: "Team Name" },
  { key: "teamLeaderFullName", header: "Team Leader Full Name" },
  { key: "teamLeaderRollNumber", header: "Team Leader Roll Number" },
  { key: "teamLeaderBranchSection", header: "Team Leader Branch and Section" },
  { key: "teamLeaderYear", header: "Team Leader Year" },
  { key: "teamLeaderGender", header: "Team Leader Gender" },
  { key: "teamLeaderPhoneNumber", header: "Team Leader Phone Number" },
  { key: "teamLeaderEmailAddress", header: "Team Leader Email Address" },
  ...memberFields(2),
  ...memberFields(3),
  ...memberFields(4),
  ...memberFields(5),
  ...memberFields(6),
  { key: "declaration", header: "Declaration" },
  { key: "timestamp", header: "Timestamp" },
  { key: "status", header: "Status" },
  { key: "remarks", header: "Remarks" },
  { key: "judgeAssigned", header: "Judge Assigned" },
  { key: "presentationSlot", header: "Presentation Slot" },
  { key: "createdAt", header: "Created At" },
  { key: "updatedAt", header: "Updated At" },
  { key: "rankingStatus", header: "Ranking Status" },
  { key: "teamLeaderGithubUsername", header: "Team Leader GitHub Username" },
  { key: "member2GithubUsername", header: "Member 2 GitHub Username" },
  { key: "member3GithubUsername", header: "Member 3 GitHub Username" },
  { key: "member4GithubUsername", header: "Member 4 GitHub Username" },
  { key: "member5GithubUsername", header: "Member 5 GitHub Username" },
  { key: "member6GithubUsername", header: "Member 6 GitHub Username" },
];

const USERS_FIELDS = [
  { key: "id", header: "Record ID" },
  { key: "name", header: "Name" },
  { key: "email", header: "Email" },
  { key: "passwordHash", header: "Password Hash" },
  { key: "role", header: "Role" },
];

const AUDIT_LOGS_FIELDS = [
  { key: "id", header: "Record ID" },
  { key: "user", header: "User" },
  { key: "role", header: "Role" },
  { key: "action", header: "Action" },
  { key: "details", header: "Details" },
  { key: "ip", header: "IP" },
  { key: "timestamp", header: "Timestamp" },
];

const SUBMISSION_FIELDS = [
  { key: "id", header: "Record ID" },
  { key: "teamId", header: "Team ID" },
  { key: "teamName", header: "Team Name" },
  { key: "githubRepository", header: "GitHub Repository" },
  { key: "ppt", header: "PPT" },
  { key: "demoVideo", header: "Demo Video" },
  { key: "description", header: "Description" },
  { key: "submissionTime", header: "Submission Time" },
  { key: "status", header: "Status" },
  { key: "remarks", header: "Remarks" },
  { key: "createdAt", header: "Created At" },
  { key: "updatedAt", header: "Updated At" },
];

const EVALUATION_FIELDS = [
  { key: "id", header: "Record ID" },
  { key: "teamId", header: "Team ID" },
  { key: "teamName", header: "Team Name" },
  { key: "judgeId", header: "Judge ID" },
  { key: "judgeName", header: "Judge Name" },
  { key: "problemUnderstanding", header: "Problem Understanding (10)" },
  { key: "innovationCreativity", header: "Innovation & Creativity (20)" },
  { key: "technicalFeasibility", header: "Technical Feasibility (15)" },
  { key: "prototypeQuality", header: "Prototype Quality (15)" },
  { key: "technicalImplementation", header: "Technical Implementation (10)" },
  { key: "impactScalability", header: "Impact & Scalability (10)" },
  { key: "uiUx", header: "UI/UX (5)" },
  { key: "presentationCommunication", header: "Presentation & Communication (10)" },
  { key: "technicalQnA", header: "Technical Q&A (5)" },
  { key: "total", header: "Total (100)" },
  { key: "judgeRemarks", header: "Judge Remarks" },
  { key: "facultyRemarks", header: "Faculty Remarks" },
  { key: "createdAt", header: "Created At" },
  { key: "updatedAt", header: "Updated At" },
];

const PRESENTATION_SCHEDULE_FIELDS = [
  { key: "id", header: "Record ID" },
  { key: "room", header: "Room" },
  { key: "judgeId", header: "Judge ID" },
  { key: "judgeName", header: "Judge Name" },
  { key: "teamId", header: "Team ID" },
  { key: "teamName", header: "Team Name" },
  { key: "time", header: "Time" },
  { key: "duration", header: "Duration" },
  { key: "status", header: "Status" },
];

const ANNOUNCEMENTS_FIELDS = [
  { key: "id", header: "Record ID" },
  { key: "title", header: "Title" },
  { key: "description", header: "Description" },
  { key: "priority", header: "Priority" },
  { key: "visibility", header: "Visibility" },
  { key: "publishDate", header: "Publish Date" },
  { key: "expiryDate", header: "Expiry Date" },
  { key: "pinned", header: "Pinned" },
  { key: "createdAt", header: "Created At" },
];

const RESOURCES_FIELDS = [
  { key: "id", header: "Record ID" },
  { key: "name", header: "Name" },
  { key: "category", header: "Category" },
  { key: "url", header: "URL" },
  { key: "visible", header: "Visible" },
  { key: "order", header: "Order" },
  { key: "createdAt", header: "Created At" },
];

const SETTINGS_FIELDS = [
  { key: "id", header: "Record ID" },
  { key: "key", header: "Key" },
  { key: "value", header: "Value" },
];

const REPOSITORIES_FIELDS = [
  { key: "id", header: "Record ID" },
  { key: "teamId", header: "Team ID" },
  { key: "teamName", header: "Team Name" },
  { key: "repoName", header: "Repository Name" },
  { key: "repoUrl", header: "Repository URL" },
  { key: "repoId", header: "Repository ID" },
  { key: "owner", header: "GitHub Owner" },
  { key: "status", header: "Repository Status" },
  { key: "lockStatus", header: "Lock Status" },
  { key: "collaborators", header: "Collaborators" },
  { key: "commitCount", header: "Commit Count" },
  { key: "lastCommitTime", header: "Last Commit Time" },
  { key: "lastCommitBy", header: "Last Commit By" },
  { key: "repoSize", header: "Repository Size" },
  { key: "lastSync", header: "Last Sync" },
  { key: "createdDate", header: "Created Date" },
  { key: "updatedAt", header: "Updated At" },
];

const SCHEMAS = {
  Registration: REGISTRATION_FIELDS,
  Users: USERS_FIELDS,
  AuditLogs: AUDIT_LOGS_FIELDS,
  Submission: SUBMISSION_FIELDS,
  Evaluation: EVALUATION_FIELDS,
  PresentationSchedule: PRESENTATION_SCHEDULE_FIELDS,
  Announcements: ANNOUNCEMENTS_FIELDS,
  Resources: RESOURCES_FIELDS,
  Settings: SETTINGS_FIELDS,
  Repositories: REPOSITORIES_FIELDS,
};

module.exports = { SCHEMAS };
