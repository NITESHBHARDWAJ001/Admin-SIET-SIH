import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiSearch, FiCheckCircle, FiGithub } from "react-icons/fi";
import { fetchPublicSettings, fetchTeamMembers, saveTeamGithubUsernames } from "../../services/publicApi";
import { SkeletonBlock } from "../../components/Skeleton";

export default function PublicLinkGithubPage() {
  const [settings, setSettings] = useState(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [query, setQuery] = useState("");
  const [looking, setLooking] = useState(false);
  const [team, setTeam] = useState(null);
  const [usernames, setUsernames] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchPublicSettings()
      .then(setSettings)
      .catch(() => toast.error("Failed to load GitHub linking status"))
      .finally(() => setLoadingSettings(false));
  }, []);

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLooking(true);
    setSaved(false);
    try {
      const found = await fetchTeamMembers(query.trim());
      setTeam(found);
      const initial = {};
      found.members.forEach((m) => {
        initial[m.fieldKey] = m.githubUsername || "";
      });
      setUsernames(initial);
    } catch (err) {
      toast.error(err.response?.data?.message || "Team not found");
      setTeam(null);
    } finally {
      setLooking(false);
    }
  };

  const handleChange = (fieldKey, value) => {
    setUsernames((prev) => ({ ...prev, [fieldKey]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveTeamGithubUsernames(team.teamId, usernames);
      toast.success("GitHub usernames saved");
      setSaved(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save. Check the usernames and try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loadingSettings) {
    return (
      <div className="space-y-4">
        <SkeletonBlock className="h-8 w-64" />
        <SkeletonBlock className="h-40" />
      </div>
    );
  }

  if (settings?.githubLinkOpen !== "true") {
    return (
      <div className="card p-8 text-center">
        <h1 className="font-heading text-xl font-semibold text-ink">GitHub Linking Closed</h1>
        <p className="text-sm text-slate-500 mt-2">
          Linking GitHub accounts isn't open right now. Please check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-xl font-semibold text-ink flex items-center gap-2">
          <FiGithub size={20} /> Link GitHub Accounts
        </h1>
        <p className="text-sm text-slate-500">
          Enter your Team ID to add each member's GitHub username — this is how we invite you as
          collaborators to your team's repository.
        </p>
      </div>

      {!team ? (
        <form onSubmit={handleLookup} className="card p-5">
          <label className="text-xs text-slate-400">Team ID</label>
          <div className="flex gap-2 mt-1">
            <input
              className="input"
              placeholder="e.g. SIH26-014"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button className="btn-primary shrink-0" disabled={looking}>
              <FiSearch size={15} /> {looking ? "Searching…" : "Find Team"}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="card p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Team</p>
              <p className="font-medium text-ink dark:text-slate-100">
                {team.teamName} ({team.teamId})
              </p>
            </div>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setTeam(null);
                setSaved(false);
              }}
            >
              Not your team?
            </button>
          </div>

          <div className="card p-5 space-y-4">
            {team.members.map((m) => (
              <div key={m.fieldKey}>
                <label className="text-xs text-slate-400">
                  {m.role} — {m.fullName} ({m.rollNumber})
                </label>
                <input
                  className="input mt-1"
                  placeholder="GitHub username"
                  value={usernames[m.fieldKey] || ""}
                  onChange={(e) => handleChange(m.fieldKey, e.target.value)}
                />
              </div>
            ))}
          </div>

          {saved && (
            <div className="flex items-center gap-2 text-sm text-success">
              <FiCheckCircle size={16} /> Saved. You can come back and update these any time before
              your repository is created.
            </div>
          )}

          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save GitHub Usernames"}
          </button>
        </div>
      )}
    </div>
  );
}
