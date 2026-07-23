import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { logoutAction } from "@/lib/actions/auth.actions";
import { getExpertByUserId } from "@/lib/db/queries";
import { getServerSession } from "@/lib/auth/session";

export default async function ApplicationRejectedPage() {
  const session = await getServerSession();
  let rejectionReason = "Missing documentation or unverified credentials.";

  if (session) {
    try {
      const expert = await getExpertByUserId(session.id);
      if (expert?.rejection_reason) {
        rejectionReason = expert.rejection_reason;
      }
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border p-8 text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Application Not Approved</h1>
          <p className="text-gray-500 text-sm">
            Unfortunately, we were unable to approve your application at this time.
          </p>
        </div>

        <div className="bg-red-50 p-4 rounded-xl text-left border border-red-100">
          <p className="text-xs font-semibold text-red-800 uppercase tracking-wider mb-2">Reason provided</p>
          <p className="text-sm text-red-700">{rejectionReason}</p>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <p className="text-sm text-gray-600">
            If you believe this was a mistake or have updated documentation, please contact our support team.
          </p>
          
          <div className="flex flex-col gap-3">
            <a href="mailto:support@elira.health" className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-2.5 px-4 rounded-lg transition-colors inline-block">
              Contact Support
            </a>
            <form action={logoutAction}>
              <button type="submit" className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-2.5 px-4 rounded-lg transition-colors">
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
