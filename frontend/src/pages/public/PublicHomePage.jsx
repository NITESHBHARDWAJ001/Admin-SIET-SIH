import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiUsers, FiUpload, FiBell, FiFolder, FiArrowRight } from "react-icons/fi";
import { fetchPublicSettings } from "../../services/publicApi";
import { SkeletonBlock } from "../../components/Skeleton";

const CARDS = [
  {
    to: "/register",
    icon: FiUsers,
    title: "Register Your Team",
    description: "Sign up your team of up to 6 members for the internal hackathon.",
  },
  {
    to: "/submit",
    icon: FiUpload,
    title: "Submit Your Prototype",
    description: "Already registered and approved? Upload your repository, PPT and demo.",
  },
  {
    to: "/notices",
    icon: FiBell,
    title: "Notices",
    description: "Stay up to date with the latest announcements from the organizers.",
  },
  {
    to: "/downloads",
    icon: FiFolder,
    title: "Resources",
    description: "Rulebook, guidelines, PPT template and other useful downloads.",
  },
];

export default function PublicHomePage() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    fetchPublicSettings()
      .then(setSettings)
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-10">
      <section className="text-center py-8">
        <span className="badge bg-primary/10 text-primary mb-4 inline-flex">
          {settings ? settings.currentPhase : <SkeletonBlock className="h-4 w-24 inline-block" />}
        </span>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-ink dark:text-slate-100">
          SIH SIET 2026
        </h1>
        <p className="text-lg text-slate-500 mt-2">Internal Hackathon — State Institute of Engineering &amp; Technology, Nilokheri</p>
        <p className="text-sm text-slate-400 mt-4 max-w-xl mx-auto">
          Build something impactful. Register your team, submit your prototype, and track every
          update for SIH SIET 2026 right here.
        </p>
        <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
          <Link to="/register" className="btn-primary">
            Register Your Team <FiArrowRight size={15} />
          </Link>
          <Link to="/submit" className="btn-secondary">
            Submit Prototype
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {CARDS.map((c) => (
          <Link key={c.to} to={c.to} className="card p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <c.icon size={20} />
            </div>
            <div>
              <p className="font-heading font-semibold text-ink dark:text-slate-100">{c.title}</p>
              <p className="text-sm text-slate-500 mt-1">{c.description}</p>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
