const sheetsService = require("../services/googleSheets/sheetsService");
const {
  departmentOf,
  memberCount,
  participantGenders,
  girlsCount,
} = require("../utils/registrationHelpers");

function countBy(items, keyFn) {
  const counts = {};
  for (const item of items) {
    const key = keyFn(item) || "Unknown";
    counts[key] = (counts[key] || 0) + 1;
  }
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

async function getDashboard(req, res) {
  const [teams, submissions, users, settings] = await Promise.all([
    sheetsService.getRows("Registration"),
    sheetsService.getRows("Submission"),
    sheetsService.getRows("Users"),
    sheetsService.getRows("Settings"),
  ]);

  const totalTeams = teams.length;
  const totalParticipants = teams.reduce((sum, t) => sum + memberCount(t), 0);
  const pending = teams.filter((t) => t.status === "Pending").length;
  const approved = teams.filter((t) => t.status === "Approved").length;
  const rejected = teams.filter((t) => t.status === "Rejected").length;
  const presentationScheduled = teams.filter((t) => t.presentationSlot).length;
  const judges = users.filter((u) => u.role === "Judge").length;
  const currentPhaseSetting = settings.find((s) => s.key === "currentPhase");

  const departmentWise = countBy(teams, departmentOf);
  const yearWise = countBy(teams, (t) => t.teamLeaderYear);
  const participantGenderCounts = {};
  teams.forEach((team) => {
    participantGenders(team).forEach((gender) => {
      participantGenderCounts[gender] = (participantGenderCounts[gender] || 0) + 1;
    });
  });
  const genderWise = Object.entries(participantGenderCounts).map(([name, value]) => ({
    name,
    value,
  }));

  const teamsWithGirlsLessThanOne = teams.filter((team) => girlsCount(team) < 1).length;
  const teamsByGirlsPresence = [
    { name: "0 Girls", value: teamsWithGirlsLessThanOne },
    { name: "1+ Girls", value: Math.max(0, totalTeams - teamsWithGirlsLessThanOne) },
  ];

  const timelineCounts = countBy(teams, (t) => (t.timestamp || "").slice(0, 10));
  const timeline = timelineCounts.sort((a, b) => (a.name < b.name ? -1 : 1));

  res.json({
    stats: {
      totalTeams,
      totalParticipants,
      pending,
      approved,
      rejected,
      prototypeSubmitted: submissions.length,
      presentationScheduled,
      judges,
      currentPhase: currentPhaseSetting?.value || "Registration Open",
    },
    charts: {
      departmentWise,
      yearWise,
      genderWise,
      teamsByGirlsPresence,
      timeline,
    },
  });
}

module.exports = { getDashboard };
