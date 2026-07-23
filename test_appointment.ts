import { getSession } from './src/lib/auth/roles';
import { createSessionToken } from './src/lib/auth/session';
import { getMany, getOne } from './src/lib/db/client';
import { Profile, Expert } from './src/lib/db/types';

async function main() {
  console.log("Fetching a random patient...");
  const patient = await getOne<Profile>("SELECT * FROM profiles WHERE role = 'user' LIMIT 1");
  if (!patient) {
    console.log("No patient found.");
    return;
  }
  console.log("Patient:", patient.email, patient.id);

  console.log("Fetching a random verified expert...");
  const expert = await getOne<Expert>("SELECT * FROM experts WHERE verification_status = 'approved' OR profile_status = 'approved' LIMIT 1");
  
  // If no verified expert, just get any expert
  const targetExpert = expert || await getOne<Expert>("SELECT * FROM experts LIMIT 1");
  
  if (!targetExpert) {
    console.log("No expert found in database.");
    return;
  }
  console.log("Expert:", targetExpert.id);

  console.log("\nGenerating Session Token for patient...");
  const token = await createSessionToken({
    id: patient.id,
    role: patient.role,
    status: patient.status || 'active'
  });
  console.log("Token:", token.substring(0, 30) + "...");

  const payload = {
    patientId: patient.id,
    specialistId: targetExpert.id,
    appointmentDate: "2026-08-20",
    startTime: "10:00",
    endTime: "11:00",
    reasonForVisit: "Testing appointment endpoint"
  };

  console.log("\nSending POST request to /api/appointments...");
  const res = await fetch("http://localhost:3000/api/appointments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  console.log("Status:", res.status);
  const data = await res.json();
  console.log("Response:", JSON.stringify(data, null, 2));
}

main().catch(console.error);
