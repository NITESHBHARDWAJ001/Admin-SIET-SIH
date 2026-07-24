function departmentOf(team) {
  const branch = team.teamLeaderBranchSection || "";
  // Split on the LAST hyphen, not the first: branch codes can themselves
  // contain a hyphen (e.g. "CSE-AIML"), so "CSE-AIML-A" must yield
  // "CSE-AIML", not "CSE".
  const lastDash = branch.lastIndexOf("-");
  return lastDash === -1 ? branch : branch.slice(0, lastDash);
}

function memberCount(team) {
  let count = 1; // leader
  for (let n = 2; n <= 6; n++) {
    if (team[`member${n}FullName`]) count += 1;
  }
  return count;
}

function toListItem(team) {
  return {
    id: team.id,
    teamId: team.teamId,
    teamName: team.teamName,
    leader: team.teamLeaderFullName,
    department: departmentOf(team),
    year: team.teamLeaderYear,
    registrationTime: team.timestamp,
    status: team.status,
    memberCount: memberCount(team),
    judgeAssigned: team.judgeAssigned || null,
    presentationSlot: team.presentationSlot || null,
    rankingStatus: team.rankingStatus || null,
  };
}

const EXPORT_COLUMNS = [
  { key: "teamId", label: "Team ID" },
  { key: "teamName", label: "Team Name" },
  { key: "teamLeaderFullName", label: "Leader Name" },
  { key: "teamLeaderRollNumber", label: "Leader Roll Number" },
  { key: "teamLeaderBranchSection", label: "Branch and Section" },
  { key: "teamLeaderYear", label: "Year" },
  { key: "teamLeaderGender", label: "Gender" },
  { key: "teamLeaderPhoneNumber", label: "Phone Number" },
  { key: "teamLeaderEmailAddress", label: "Email Address" },
  { key: "status", label: "Status" },
  { key: "timestamp", label: "Registration Time" },
];

function nextTeamId(existingTeams) {
  let max = 0;
  existingTeams.forEach((t) => {
    const match = /^SIH26-(\d+)$/.exec(t.teamId || "");
    if (match) max = Math.max(max, Number(match[1]));
  });
  return `SIH26-${String(max + 1).padStart(3, "0")}`;
}

module.exports = { departmentOf, memberCount, toListItem, EXPORT_COLUMNS, nextTeamId };
