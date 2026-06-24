import { logoutAction } from "@/lib/actions/auth.actions";
import { DoctorSidebar } from "@/components/layout/DoctorSidebar";
import { cookies } from "next/headers";
import { getExpertByUserId } from "@/lib/db/queries";

export default async function DoctorLayout({ children }: { children: React.ReactNode }) {
  const token = (await cookies()).get("auth-token")?.value;
  let userId = '';
  
  if (token) {
    const payloadStr = token.replace("mock-jwt-", "").replace("mock-token-", "");
    try {
      if (token.startsWith("mock-jwt-")) {
        const decoded = JSON.parse(Buffer.from(payloadStr, "base64").toString("utf-8"));
        userId = decoded.id;
      } else {
        userId = payloadStr;
      }
    } catch (e) {
      userId = payloadStr;
    }
  }

  const expert = userId ? await getExpertByUserId(userId) : null;
  const profileStatus = expert?.profile_status || 'profile_incomplete';

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50 font-sans text-slate-900">
      <DoctorSidebar logoutAction={logoutAction} profileStatus={profileStatus} />
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto w-full">{children}</main>
    </div>
  );
}
