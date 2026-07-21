import { useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const onSubmit = async ({ email, password }) => {
    try {
      await login(email, password);
      const redirectTo = location.state?.from?.pathname || "/dashboard";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const message = err.response?.data?.message || "Login failed. Please try again.";
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center font-heading font-bold text-lg mx-auto mb-3">
            S
          </div>
          <h1 className="font-heading font-semibold text-xl text-ink">SIH SIET 2026</h1>
          <p className="text-sm text-slate-500 mt-1">Admin Management Portal</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Email</label>
            <input
              type="email"
              className="input"
              placeholder="you@siet.ac.in"
              {...register("email", { required: "Email is required" })}
            />
            {errors.email && (
              <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">Password</label>
            <input
              type="password"
              className="input"
              placeholder="••••••••"
              {...register("password", { required: "Password is required" })}
            />
            {errors.password && (
              <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>
            )}
          </div>

          <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="text-xs text-slate-400 text-center mt-6">
          Internal portal for organizers only. Not for student use.
        </p>
      </div>
    </div>
  );
}
