import Link from "next/link";
import { ArrowRight, CheckCircle2, CreditCard } from "lucide-react";

export default function BillingSuccessPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eefbf4_100%)] px-4 py-16 text-slate-900 dark:bg-[linear-gradient(180deg,#020617_0%,#111827_100%)] dark:text-white">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-white/70 bg-white/90 p-8 text-center shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
          <CheckCircle2 size={36} />
        </div>
        <h1 className="mt-6 text-4xl font-black">Payment started successfully</h1>
        <p className="mt-4 text-base leading-8 text-slate-600 dark:text-slate-300">
          Stripe has returned you to PathSpring. Your subscription status will be finalized by webhook update and reflected in your workspace shortly.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/admin/billing" className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-5 py-3 font-semibold text-white">
            <CreditCard size={16} />
            School Billing
          </Link>
          <Link href="/family/billing" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-5 py-3 font-semibold text-slate-700 dark:border-white/10 dark:text-slate-200">
            Family Billing
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </main>
  );
}
