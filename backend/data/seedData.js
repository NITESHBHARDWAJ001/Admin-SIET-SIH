const { v4: uuidv4 } = require("uuid");

const DEPARTMENTS = [
  "CSE-A",
  "CSE-B",
  "ECE-A",
  "ECE-B",
  "ME-A",
  "CE-A",
  "EE-A",
  "IT-A",
];

const FIRST_NAMES = [
  "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Krishna",
  "Ishaan", "Rohan", "Ananya", "Diya", "Saanvi", "Aadhya", "Kiara", "Myra",
  "Anika", "Riya", "Ishita", "Priya",
];
const LAST_NAMES = [
  "Sharma", "Verma", "Gupta", "Singh", "Kumar", "Rana", "Chauhan", "Yadav",
  "Malik", "Rathi", "Bansal", "Tyagi",
];
const GENDERS = ["Male", "Female"];
const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
const STATUSES = ["Pending", "Approved", "Rejected"];

function pick(arr, i) {
  return arr[i % arr.length];
}

function makeMember(seed, idx) {
  const first = pick(FIRST_NAMES, seed + idx);
  const last = pick(LAST_NAMES, seed + idx * 3);
  return {
    fullName: `${first} ${last}`,
    rollNumber: `SIET-${20220000 + seed * 7 + idx}`,
    branchSection: pick(DEPARTMENTS, seed + idx),
    year: pick(YEARS, seed + idx),
    gender: pick(GENDERS, seed + idx * 2),
    email: `${first}.${last}${seed}${idx}@siet.ac.in`.toLowerCase(),
  };
}

function buildTeam(seed) {
  const teamSize = 3 + (seed % 4); // 3-6 members total (leader + up to 5)
  const leaderBase = makeMember(seed, 0);
  const leader = {
    ...leaderBase,
    phoneNumber: `9${(100000000 + seed * 12345) % 900000000}`,
  };

  const members = [];
  for (let m = 2; m <= teamSize; m++) {
    members.push(makeMember(seed, m));
  }

  const status = pick(STATUSES, seed);
  const createdAt = new Date(Date.now() - seed * 6 * 60 * 60 * 1000).toISOString();

  const team = {
    id: uuidv4(),
    teamId: `SIH26-${String(seed).padStart(3, "0")}`,
    teamName: `Team ${["Innovate", "ByteForce", "CodeCrafters", "NextGen", "Vertex", "Quantum", "Synapse", "Pioneers", "Catalyst", "Nimbus"][seed % 10]}${seed}`,
    teamLeaderFullName: leader.fullName,
    teamLeaderRollNumber: leader.rollNumber,
    teamLeaderBranchSection: leader.branchSection,
    teamLeaderYear: leader.year,
    teamLeaderGender: leader.gender,
    teamLeaderPhoneNumber: leader.phoneNumber,
    teamLeaderEmailAddress: leader.email,
    declaration: true,
    timestamp: createdAt,
    status,
    remarks: [],
    judgeAssigned: null,
    presentationSlot: null,
    createdAt,
    updatedAt: createdAt,
  };

  members.forEach((member, i) => {
    const n = i + 2;
    team[`member${n}FullName`] = member.fullName;
    team[`member${n}RollNumber`] = member.rollNumber;
    team[`member${n}BranchSection`] = member.branchSection;
    team[`member${n}Year`] = member.year;
    team[`member${n}Gender`] = member.gender;
    team[`member${n}EmailAddress`] = member.email;
  });

  for (let n = teamSize + 1; n <= 6; n++) {
    team[`member${n}FullName`] = "";
    team[`member${n}RollNumber`] = "";
    team[`member${n}BranchSection`] = "";
    team[`member${n}Year`] = "";
    team[`member${n}Gender`] = "";
    team[`member${n}EmailAddress`] = "";
  }

  return team;
}

function buildRegistrations(count = 24) {
  const rows = [];
  for (let i = 1; i <= count; i++) {
    rows.push(buildTeam(i));
  }
  return rows;
}

const users = [
  {
    id: uuidv4(),
    name: "Dr. Super Admin",
    email: "superadmin@siet.ac.in",
    // password: Admin@123
    passwordHash: "$2a$10$NyF/J7CrvJ5sHwL320AzjOgrH9.RjFzBE5X0MpAumYlLvQ4nYhWmq",
    role: "SuperAdmin",
  },
  {
    id: uuidv4(),
    name: "Faculty Coordinator",
    email: "faculty@siet.ac.in",
    // password: Faculty@123
    passwordHash: "$2a$10$g6XUvuCDALhBCPLCGguGqebAD0Xg44tU6hBLjweGL78MmfroaNIf2",
    role: "FacultyCoordinator",
  },
];

module.exports = {
  buildRegistrations,
  users,
};
