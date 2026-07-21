import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FiSearch, FiCheckCircle } from "react-icons/fi";
import { fetchPublicSettings, lookupPublicTeam, submitPublicSubmission } from "../../services/publicApi";
import { SkeletonBlock } from "../../components/Skeleton";

export default function PublicSubmitPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [looking, setLooking] = useState(false);
  const [team, setTeam] = useState(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm();

  useEffect(() => {
    fetchPublicSettings()
      .then(setSettings)
      .catch(() => toast.error("Failed to load submission status"))
      .finally(() => setLoading(false));
  }, []);

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLooking(true);
    try {
      const found = await lookupPublicTeam(query.trim());
      setTeam(found);
    } catch (err) {
      toast.error(err.response?.data?.message || "Team not found");
      setTeam(null);
    } finally {
      setLooking(false);
    }
  };

  const onSubmit = async (values) => {
    try {
      await submitPublicSubmission({ ...values, teamId: team.teamId });
      setSuccess(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Submission failed. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <SkeletonBlock className="h-8 w-64" />
        <SkeletonBlock className="h-56" />
      </div>
    );
  }

  if (settings?.submissionOpen !== "true") {
    return (
      <div className="card p-8 text-center">
        <h1 className="font-heading text-xl font-semibold text-ink">Submissions Closed</h1>
        <p className="text-sm text-slate-500 mt-2">
          Prototype submissions for SIH SIET 2026 are not open right now. Please check back later.
        </p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="card p-8 text-center">
        <FiCheckCircle size={40} className="text-success mx-auto mb-3" />
        <h1 className="font-heading text-xl font-semibold text-ink">Submission Received!</h1>
        <p className="text-sm text-slate-500 mt-2">
          Your prototype for <strong>{team.teamName}</strong> has been submitted. You can come back and
          resubmit any time before the deadline — it will replace your previous submission.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-xl font-semibold text-ink">Submit Your Prototype</h1>
        <p className="text-sm text-slate-500">
          Find your team using your Team ID or the leader's email, then upload your submission links.
        </p>
      </div>

      {!team ? (
        <form onSubmit={handleLookup} className="card p-5">
          <label className="text-xs text-slate-400">Team ID or Leader Email</label>
          <div className="flex gap-2 mt-1">
            <input
              className="input"
              placeholder="e.g. SIH26-014 or leader@siet.ac.in"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button className="btn-primary shrink-0" disabled={looking}>
              <FiSearch size={15} /> {looking ? "Searching…" : "Find Team"}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="card p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Submitting as</p>
              <p className="font-medium text-ink dark:text-slate-100">
                {team.teamName} ({team.teamId})
              </p>
            </div>
            <button type="button" className="btn-secondary" onClick={() => setTeam(null)}>
              Not your team?
            </button>
          </div>

          <div className="card p-5 space-y-4">
            <div>
              <label className="text-xs text-slate-400">GitHub Repository</label>
              <input className="input mt-1" placeholder="https://github.com/…" {...register("githubRepository")} />
            </div>
            <div>
              <label className="text-xs text-slate-400">PPT Link</label>
              <input className="input mt-1" placeholder="https://…" {...register("ppt")} />
            </div>
            <div>
              <label className="text-xs text-slate-400">Demo Video Link</label>
              <input className="input mt-1" placeholder="https://…" {...register("demoVideo")} />
            </div>
            <div>
              <label className="text-xs text-slate-400">Description</label>
              <textarea className="input mt-1" rows={3} {...register("description")} />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "Submitting…" : "Submit Prototype"}
          </button>
        </form>
      )}
    </div>
  );
}
