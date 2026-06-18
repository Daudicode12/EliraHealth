import { AlertTriangle } from "lucide-react";
import { logoutAction } from "@/lib/actions/auth.actions";

export default function AccountSuspendedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border p-8 text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8 text-gray-700" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Account Suspended</h1>
          <p className="text-gray-500 text-sm">
            Your specialist account has been temporarily suspended by an administrator.
          </p>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <p className="text-sm text-gray-600">
            While suspended, you cannot access your dashboard, patient records, or manage appointments. 
            Please contact the platform administrator to resolve this issue.
          </p>
          
          <div className="flex flex-col gap-3">
            <a href="mailto:admin@elira.health" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors inline-block">
              Contact Administrator
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
