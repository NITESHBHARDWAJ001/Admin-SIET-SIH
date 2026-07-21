import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { fetchSettings, updateSettings } from "../../services/settingsApi";
import { SkeletonBlock } from "../../components/Skeleton";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  useEffect(() => {
    fetchSettings()
      .then((data) => {
        reset({
          ...data,
          registrationOpen: data.registrationOpen === "true",
          submissionOpen: data.submissionOpen === "true",
          evaluationOpen: data.evaluationOpen === "true",
          resultsPublished: data.resultsPublished === "true",
        });
      })
      .catch(() => toast.error("Failed to load settings"))
      .finally(() => setLoading(false));
  }, [reset]);

  const onSave = async (values) => {
    try {
      await updateSettings(values);
      toast.success("Settings updated");
    } catch {
      toast.error("Failed to update settings");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <SkeletonBlock className="h-8 w-48" />
        <SkeletonBlock className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-xl font-semibold text-ink">Event Settings</h1>
        <p className="text-sm text-slate-500">Controls what's shown on the public website</p>
      </div>

      <form onSubmit={handleSubmit(onSave)} className="card p-5 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            ["registrationOpen", "Registration Open"],
            ["submissionOpen", "Submission Open"],
            ["evaluationOpen", "Evaluation Open"],
            ["resultsPublished", "Results Published"],
          ].map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-sm text-ink dark:text-slate-100">
              <input type="checkbox" className="accent-primary w-4 h-4" {...register(key)} />
              {label}
            </label>
          ))}
        </div>

        <div>
          <label className="text-xs text-slate-400">Current Phase</label>
          <select className="input mt-1" {...register("currentPhase")}>
            <option>Registration Open</option>
            <option>Registration Closed</option>
            <option>Submission Open</option>
            <option>Evaluation In Progress</option>
            <option>Results Published</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-400">Registration Form URL</label>
            <input className="input mt-1" {...register("registrationFormUrl")} />
          </div>
          <div>
            <label className="text-xs text-slate-400">Submission Form URL</label>
            <input className="input mt-1" {...register("submissionFormUrl")} />
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-400">Google Form Response Tab Name</label>
          <input className="input mt-1" {...register("formResponsesSheetName")} />
          <p className="text-xs text-slate-400 mt-1">
            The tab name Google created when you linked the Registration form's responses to this
            spreadsheet (usually "Form Responses 1"). Used by "Sync from Form" on the Registrations page.
          </p>
        </div>

        <button className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : "Save Settings"}
        </button>
      </form>
    </div>
  );
}
