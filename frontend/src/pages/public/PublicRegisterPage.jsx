import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FiPlus, FiX, FiCheckCircle } from "react-icons/fi";
import { fetchPublicSettings, submitPublicRegistration } from "../../services/publicApi";
import { BRANCH_OPTIONS, GENDERS, YEARS } from "../../constants/registration";
import { SkeletonBlock } from "../../components/Skeleton";

const MEMBER_NUMBERS = [2, 3, 4, 5, 6];

export default function PublicRegisterPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [memberCount, setMemberCount] = useState(0);
  const [success, setSuccess] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    fetchPublicSettings()
      .then(setSettings)
      .catch(() => toast.error("Failed to load registration status"))
      .finally(() => setLoading(false));
  }, []);

  const onSubmit = async (values) => {
    const payload = { ...values, declaration: Boolean(values.declaration) };

    try {
      const result = await submitPublicRegistration(payload);
      setSuccess(result);
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <SkeletonBlock className="h-8 w-64" />
        <SkeletonBlock className="h-96" />
      </div>
    );
  }

  if (settings?.registrationOpen !== "true") {
    return (
      <div className="card p-8 text-center">
        <h1 className="font-heading text-xl font-semibold text-ink">Registration Closed</h1>
        <p className="text-sm text-slate-500 mt-2">
          Registrations for SIH SIET 2026 are not open right now. Please check back later.
        </p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="card p-8 text-center">
        <FiCheckCircle size={40} className="text-success mx-auto mb-3" />
        <h1 className="font-heading text-xl font-semibold text-ink">Registration Submitted!</h1>
        <p className="text-sm text-slate-500 mt-2">
          <strong>{success.teamName}</strong> has been registered with Team ID{" "}
          <strong>{success.teamId}</strong>. You'll be notified once it's verified.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h1 className="font-heading text-xl font-semibold text-ink">Team Registration</h1>
        <p className="text-sm text-slate-500">Fill in your team details to register for SIH SIET 2026.</p>
      </div>

      <section className="card p-5 space-y-4">
        <h2 className="font-heading font-semibold text-ink">Team</h2>
        <div>
          <label className="text-xs text-slate-400">Team Name *</label>
          <input className="input mt-1" {...register("teamName", { required: "Required" })} />
          {errors.teamName && <p className="text-xs text-red-600 mt-1">{errors.teamName.message}</p>}
        </div>
      </section>

      <section className="card p-5 space-y-4">
        <h2 className="font-heading font-semibold text-ink">Team Leader</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-400">Full Name *</label>
            <input className="input mt-1" {...register("teamLeaderFullName", { required: "Required" })} />
          </div>
          <div>
            <label className="text-xs text-slate-400">Roll Number *</label>
            <input className="input mt-1" {...register("teamLeaderRollNumber", { required: "Required" })} />
          </div>
          <div>
            <label className="text-xs text-slate-400">Branch *</label>
            <select className="input mt-1" defaultValue="" {...register("teamLeaderBranchSection", { required: true })}>
              <option value="" disabled>
                Select branch
              </option>
              {BRANCH_OPTIONS.map((branch) => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400">Year *</label>
            <select className="input mt-1" {...register("teamLeaderYear", { required: true })}>
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400">Gender *</label>
            <select className="input mt-1" {...register("teamLeaderGender", { required: true })}>
              {GENDERS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400">Phone Number *</label>
            <input
              className="input mt-1"
              {...register("teamLeaderPhoneNumber", {
                required: "Required",
                pattern: { value: /^[0-9]{10}$/, message: "Must be 10 digits" },
              })}
            />
            {errors.teamLeaderPhoneNumber && (
              <p className="text-xs text-red-600 mt-1">{errors.teamLeaderPhoneNumber.message}</p>
            )}
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs text-slate-400">Email Address *</label>
            <input
              className="input mt-1"
              type="email"
              {...register("teamLeaderEmailAddress", { required: "Required" })}
            />
          </div>
        </div>
      </section>

      {MEMBER_NUMBERS.slice(0, memberCount).map((n) => (
        <section key={n} className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-semibold text-ink">Member {n}</h2>
            <button
              type="button"
              className="btn-secondary px-2 py-1"
              onClick={() => setMemberCount((c) => c - 1)}
            >
              <FiX size={14} /> Remove
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400">Full Name</label>
              <input className="input mt-1" {...register(`member${n}FullName`)} />
            </div>
            <div>
              <label className="text-xs text-slate-400">Roll Number</label>
              <input className="input mt-1" {...register(`member${n}RollNumber`)} />
            </div>
            <div>
              <label className="text-xs text-slate-400">Branch</label>
              <select className="input mt-1" defaultValue="" {...register(`member${n}BranchSection`)}>
                <option value=""></option>
                {BRANCH_OPTIONS.map((branch) => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400">Year</label>
              <select className="input mt-1" {...register(`member${n}Year`)}>
                <option value=""></option>
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400">Gender</label>
              <select className="input mt-1" {...register(`member${n}Gender`)}>
                <option value=""></option>
                {GENDERS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400">Email Address</label>
              <input className="input mt-1" type="email" {...register(`member${n}EmailAddress`)} />
            </div>
          </div>
        </section>
      ))}

      {memberCount < 5 && (
        <button
          type="button"
          className="btn-secondary"
          onClick={() => setMemberCount((c) => c + 1)}
        >
          <FiPlus size={15} /> Add Team Member
        </button>
      )}

      <section className="card p-5">
        <label className="flex items-start gap-2 text-sm text-ink dark:text-slate-100">
          <input
            type="checkbox"
            className="accent-primary w-4 h-4 mt-0.5"
            {...register("declaration", { required: true })}
          />
          I confirm all the details provided above are accurate.
        </label>
        {errors.declaration && (
          <p className="text-xs text-red-600 mt-1">You must accept the declaration to register.</p>
        )}
      </section>

      <button type="submit" className="btn-primary w-full sm:w-auto" disabled={isSubmitting}>
        {isSubmitting ? "Submitting…" : "Submit Registration"}
      </button>
    </form>
  );
}
