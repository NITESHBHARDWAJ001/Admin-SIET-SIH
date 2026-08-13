import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FiLock, FiCheckCircle } from "react-icons/fi";
import {
  fetchPublicSettings,
  authenticateTeamForSubmission,
  submitPublicSubmission,
} from "../../services/publicApi";
import { SkeletonBlock } from "../../components/Skeleton";
import { formatDateTime } from "../../utils/formatters";

export default function PublicSubmitPage() {
  const [settings, setSettings] = useState(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [teamId, setTeamId] = useState("");
  const [password, setPassword] = useState("");
  const [authenticating, setAuthenticating] = useState(false);
  const [session, setSession] = useState(null);
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
      .finally(() => setLoadingSettings(false));
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!teamId.trim() || !password.trim()) return;
    setAuthenticating(true);
    try {
      const result = await authenticateTeamForSubmission(teamId.trim(), password.trim());
      setSession(result);
    } catch (err) {
      toast.error(err.response?.data?.message || "Authentication failed");
    } finally {
      setAuthenticating(false);
    }
  };

  const onSubmit = async (values) => {
    try {
      await submitPublicSubmission({ ...values, teamId: session.teamId, password: password.trim() });
      setSuccess(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Submission failed. Please try again.");
    }
  };

  if (loadingSettings) {
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
          Your prototype for <strong>{session.teamName}</strong> has been submitted. Submission is one-time
          only, so this cannot be changed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-xl font-semibold text-ink">Submit Your Prototype</h1>
        <p className="text-sm text-slate-500">
          Enter your Team ID and the password provided by the organizers. Submission is one-time only, so
          double-check your links before submitting.
        </p>
      </div>

      {!session ? (
        <form onSubmit={handleAuth} className="card p-5 space-y-3">
          <div>
            <label className="text-xs text-slate-400">Team ID</label>
            <input
              className="input mt-1"
              placeholder="e.g. SIH26-014"
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-slate-400">Password</label>
            <input
              className="input mt-1"
              type="password"
              placeholder="Password from the organizers"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className="btn-primary" disabled={authenticating}>
            <FiLock size={14} /> {authenticating ? "Verifying…" : "Continue"}
          </button>
        </form>
      ) : session.locked ? (
        <div className="card p-8 text-center">
          <FiCheckCircle size={40} className="text-success mx-auto mb-3" />
          <h2 className="font-heading text-lg font-semibold text-ink">Already Submitted</h2>
          <p className="text-sm text-slate-500 mt-2">
            <strong>{session.teamName}</strong> has already submitted. Submission is one-time only.
          </p>
          <p className="text-xs text-slate-400 mt-2">Submitted {formatDateTime(session.submission?.submissionTime)}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="card p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Submitting as</p>
              <p className="font-medium text-ink dark:text-slate-100">
                {session.teamName} ({session.teamId})
              </p>
            </div>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setSession(null);
                setPassword("");
              }}
            >
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
            {isSubmitting ? "Submitting…" : "Submit Prototype (one-time only)"}
          </button>
        </form>
      )}
    </div>
  );
}
