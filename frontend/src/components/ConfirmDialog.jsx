import { AnimatePresence, motion } from "framer-motion";

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  danger = false,
  onConfirm,
  onCancel,
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="card w-full max-w-sm p-6"
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
          >
            <h3 className="font-heading font-semibold text-lg text-ink dark:text-slate-100">
              {title}
            </h3>
            <p className="text-sm text-slate-500 mt-2">{message}</p>
            <div className="flex justify-end gap-2 mt-6">
              <button className="btn-secondary" onClick={onCancel}>
                Cancel
              </button>
              <button
                className={danger ? "btn-danger" : "btn-primary"}
                onClick={onConfirm}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
