import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const demoPassword = process.env.DEMO_SEED_PASSWORD || "DemoPass123!";
const createMissingUsers =
  (process.env.DEMO_SEED_CREATE_USERS || "true").toLowerCase() !== "false";

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in the environment.",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const demoUsers = [
  {
    key: "provider",
    email: "dr.maya.chen@demo.cardiaccare.app",
    fullName: "Dr. Maya Chen",
    role: "provider",
  },
  {
    key: "eleanor",
    email: "eleanor.brooks@demo.cardiaccare.app",
    fullName: "Eleanor Brooks",
    role: "patient",
  },
  {
    key: "marcus",
    email: "marcus.reed@demo.cardiaccare.app",
    fullName: "Marcus Reed",
    role: "patient",
  },
  {
    key: "gloria",
    email: "gloria.sanchez@demo.cardiaccare.app",
    fullName: "Gloria Sanchez",
    role: "patient",
  },
  {
    key: "priya",
    email: "priya.nair@demo.cardiaccare.app",
    fullName: "Priya Nair",
    role: "patient",
  },
  {
    key: "thomas",
    email: "thomas.walker@demo.cardiaccare.app",
    fullName: "Thomas Walker",
    role: "patient",
  },
];

function isoAtUtc(daysAgo, hour, minute) {
  const value = new Date();
  value.setUTCSeconds(0, 0);
  value.setUTCHours(hour, minute, 0, 0);
  value.setUTCDate(value.getUTCDate() - daysAgo);
  return value.toISOString();
}

function dateKeyFromNow(daysFromToday) {
  const value = new Date();
  value.setUTCHours(0, 0, 0, 0);
  value.setUTCDate(value.getUTCDate() + daysFromToday);
  return value.toISOString().slice(0, 10);
}

function failIfError(context, error) {
  if (error) {
    throw new Error(`${context}: ${error.message}`);
  }
}

async function listAllUsers() {
  const users = [];
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 200,
    });

    failIfError("Failed to list auth users", error);

    users.push(...data.users);

    if (data.users.length < 200) {
      break;
    }

    page += 1;
  }

  return users;
}

async function ensureDemoUsers() {
  const existingUsers = await listAllUsers();
  const resolvedUsers = new Map();

  for (const demoUser of demoUsers) {
    const existingUser = existingUsers.find(
      (user) => user.email?.toLowerCase() === demoUser.email.toLowerCase(),
    );

    if (existingUser) {
      const { error } = await supabase.auth.admin.updateUserById(existingUser.id, {
        email_confirm: true,
        password: demoPassword,
        user_metadata: {
          full_name: demoUser.fullName,
          role: demoUser.role,
        },
      });

      failIfError(`Failed to update auth user ${demoUser.email}`, error);
      resolvedUsers.set(demoUser.key, {
        ...demoUser,
        id: existingUser.id,
      });
      continue;
    }

    if (!createMissingUsers) {
      throw new Error(
        `Auth user ${demoUser.email} does not exist and DEMO_SEED_CREATE_USERS=false.`,
      );
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email: demoUser.email,
      password: demoPassword,
      email_confirm: true,
      user_metadata: {
        full_name: demoUser.fullName,
        role: demoUser.role,
      },
    });

    failIfError(`Failed to create auth user ${demoUser.email}`, error);
    resolvedUsers.set(demoUser.key, {
      ...demoUser,
      id: data.user.id,
    });
  }

  return resolvedUsers;
}

function buildDemoDataset(ids) {
  const providerId = ids.provider.id;

  const patients = [
    {
      id: ids.eleanor.id,
      name: ids.eleanor.fullName,
      vitals: [
        {
          heart_rate: 74,
          systolic_bp: 132,
          diastolic_bp: 82,
          weight: 78.6,
          symptoms: "Mild ankle swelling after a long car ride, resolved by evening.",
          created_at: isoAtUtc(42, 8, 10),
        },
        {
          heart_rate: 72,
          systolic_bp: 128,
          diastolic_bp: 80,
          weight: 78.2,
          symptoms: "Walking 20 minutes daily. No chest pain.",
          created_at: isoAtUtc(35, 8, 5),
        },
        {
          heart_rate: 71,
          systolic_bp: 126,
          diastolic_bp: 79,
          weight: 78,
          symptoms: "No palpitations. Slept well.",
          created_at: isoAtUtc(28, 7, 55),
        },
        {
          heart_rate: 70,
          systolic_bp: 124,
          diastolic_bp: 78,
          weight: 77.8,
          symptoms: "Routine morning reading. No symptoms.",
          created_at: isoAtUtc(21, 8, 0),
        },
        {
          heart_rate: 69,
          systolic_bp: 122,
          diastolic_bp: 76,
          weight: 77.7,
          symptoms: "Continuing cardiac rehab. Energy stable.",
          created_at: isoAtUtc(14, 8, 12),
        },
        {
          heart_rate: 68,
          systolic_bp: 120,
          diastolic_bp: 75,
          weight: 77.5,
          symptoms: "No dyspnea or edema.",
          created_at: isoAtUtc(7, 8, 8),
        },
        {
          heart_rate: 67,
          systolic_bp: 118,
          diastolic_bp: 74,
          weight: 77.4,
          symptoms: "Feels well and is tolerating rehab sessions.",
          created_at: isoAtUtc(0, 8, 6),
        },
      ],
      medications: [
        {
          medication_name: "Aspirin",
          dosage: "81 mg",
          frequency: "Once daily",
          notes: "Secondary prevention after prior PCI.",
          created_at: isoAtUtc(50, 9, 0),
        },
        {
          medication_name: "Atorvastatin",
          dosage: "40 mg",
          frequency: "Every evening",
          notes: "LDL control for coronary artery disease.",
          created_at: isoAtUtc(50, 9, 2),
        },
        {
          medication_name: "Metoprolol succinate",
          dosage: "25 mg",
          frequency: "Once daily",
          notes: "Blood pressure and rate control.",
          created_at: isoAtUtc(49, 9, 0),
        },
      ],
      adherence: [
        {
          medication_name: "Aspirin",
          taken_on: dateKeyFromNow(0),
          taken_at: isoAtUtc(0, 7, 10),
        },
        {
          medication_name: "Atorvastatin",
          taken_on: dateKeyFromNow(0),
          taken_at: isoAtUtc(0, 21, 5),
        },
        {
          medication_name: "Metoprolol succinate",
          taken_on: dateKeyFromNow(0),
          taken_at: isoAtUtc(0, 7, 12),
        },
      ],
      carePlans: [
        {
          title: "Maintain daily cardiac rehab routine",
          description:
            "Continue walking and rehab sessions five days per week while tracking exertional symptoms.",
          status: "active",
          next_review_date: dateKeyFromNow(21),
          created_at: isoAtUtc(30, 10, 15),
        },
        {
          title: "Monitor weight and swelling",
          description:
            "Log morning weight and note any new edema, chest discomfort, or reduced exercise tolerance.",
          status: "active",
          next_review_date: dateKeyFromNow(14),
          created_at: isoAtUtc(12, 10, 0),
        },
      ],
      followUp: {
        next_follow_up_date: dateKeyFromNow(10),
        notes: "Routine follow-up after stable rehab progress and controlled blood pressure.",
        created_at: isoAtUtc(5, 14, 15),
        updated_at: isoAtUtc(2, 11, 0),
      },
    },
    {
      id: ids.marcus.id,
      name: ids.marcus.fullName,
      vitals: [
        {
          heart_rate: 84,
          systolic_bp: 138,
          diastolic_bp: 86,
          weight: 96.4,
          symptoms: "Intermittent headaches after work stress.",
          created_at: isoAtUtc(35, 6, 50),
        },
        {
          heart_rate: 86,
          systolic_bp: 142,
          diastolic_bp: 88,
          weight: 96.6,
          symptoms: "Skipped a few walks this week.",
          created_at: isoAtUtc(28, 7, 5),
        },
        {
          heart_rate: 88,
          systolic_bp: 146,
          diastolic_bp: 90,
          weight: 96.8,
          symptoms: "Mild palpitations after climbing stairs.",
          created_at: isoAtUtc(21, 7, 10),
        },
        {
          heart_rate: 87,
          systolic_bp: 148,
          diastolic_bp: 92,
          weight: 97,
          symptoms: "Busy schedule and increased sodium intake.",
          created_at: isoAtUtc(14, 6, 55),
        },
        {
          heart_rate: 89,
          systolic_bp: 150,
          diastolic_bp: 94,
          weight: 97.1,
          symptoms: "Late evening palpitations twice this week.",
          created_at: isoAtUtc(7, 7, 15),
        },
        {
          heart_rate: 88,
          systolic_bp: 154,
          diastolic_bp: 96,
          weight: 97.3,
          symptoms: "Reports increased work stress and inconsistent sleep.",
          created_at: isoAtUtc(0, 6, 45),
        },
      ],
      medications: [
        {
          medication_name: "Losartan",
          dosage: "50 mg",
          frequency: "Once daily",
          notes: "Blood pressure control.",
          created_at: isoAtUtc(40, 8, 0),
        },
        {
          medication_name: "Spironolactone",
          dosage: "25 mg",
          frequency: "Once daily",
          notes: "Added after rising blood pressure trend.",
          created_at: isoAtUtc(20, 8, 15),
        },
      ],
      adherence: [
        {
          medication_name: "Losartan",
          taken_on: dateKeyFromNow(0),
          taken_at: isoAtUtc(0, 7, 0),
        },
      ],
      carePlans: [
        {
          title: "Tighten blood pressure control",
          description:
            "Reduce sodium intake, resume five-day walking schedule, and review home blood pressure log twice weekly.",
          status: "active",
          next_review_date: dateKeyFromNow(7),
          created_at: isoAtUtc(18, 9, 20),
        },
      ],
      followUp: {
        next_follow_up_date: dateKeyFromNow(4),
        notes: "Discuss upward blood pressure trend and intermittent palpitations.",
        created_at: isoAtUtc(8, 13, 30),
        updated_at: isoAtUtc(1, 9, 0),
      },
    },
    {
      id: ids.gloria.id,
      name: ids.gloria.fullName,
      vitals: [
        {
          heart_rate: 92,
          systolic_bp: 148,
          diastolic_bp: 90,
          weight: 69.1,
          symptoms: "Baseline fatigue but able to complete usual activities.",
          created_at: isoAtUtc(28, 8, 10),
        },
        {
          heart_rate: 96,
          systolic_bp: 154,
          diastolic_bp: 94,
          weight: 69.8,
          symptoms: "Mild orthopnea after salty restaurant meal.",
          created_at: isoAtUtc(21, 8, 20),
        },
        {
          heart_rate: 101,
          systolic_bp: 162,
          diastolic_bp: 96,
          weight: 70.6,
          symptoms: "Increasing ankle edema and reduced appetite.",
          created_at: isoAtUtc(14, 8, 5),
        },
        {
          heart_rate: 108,
          systolic_bp: 170,
          diastolic_bp: 100,
          weight: 71.4,
          symptoms: "Two-pillow orthopnea and more fatigue with household activity.",
          created_at: isoAtUtc(7, 8, 0),
        },
        {
          heart_rate: 116,
          systolic_bp: 178,
          diastolic_bp: 104,
          weight: 72.2,
          symptoms: "Shortness of breath when walking room to room.",
          created_at: isoAtUtc(2, 7, 50),
        },
        {
          heart_rate: 126,
          systolic_bp: 186,
          diastolic_bp: 108,
          weight: 72.9,
          symptoms: "Rapid weight gain, orthopnea, and worsening lower-extremity edema.",
          created_at: isoAtUtc(0, 7, 40),
        },
      ],
      medications: [
        {
          medication_name: "Furosemide",
          dosage: "40 mg",
          frequency: "Twice daily",
          notes: "Volume management for HFrEF.",
          created_at: isoAtUtc(60, 8, 0),
        },
        {
          medication_name: "Sacubitril/valsartan",
          dosage: "49/51 mg",
          frequency: "Twice daily",
          notes: "Guideline-directed therapy for heart failure.",
          created_at: isoAtUtc(60, 8, 5),
        },
        {
          medication_name: "Carvedilol",
          dosage: "12.5 mg",
          frequency: "Twice daily",
          notes: "Rate control and HF management.",
          created_at: isoAtUtc(55, 8, 0),
        },
      ],
      adherence: [
        {
          medication_name: "Carvedilol",
          taken_on: dateKeyFromNow(0),
          taken_at: isoAtUtc(0, 8, 15),
        },
      ],
      carePlans: [
        {
          title: "Escalate heart failure monitoring",
          description:
            "Daily weights, strict sodium restriction, and same-day review if weight rises by more than 2 kg over three days.",
          status: "urgent-review",
          next_review_date: dateKeyFromNow(1),
          created_at: isoAtUtc(6, 11, 30),
        },
        {
          title: "Assess decompensation symptoms",
          description:
            "Review dyspnea, orthopnea, and edema trend and consider medication reconciliation at next contact.",
          status: "active",
          next_review_date: dateKeyFromNow(3),
          created_at: isoAtUtc(3, 11, 45),
        },
      ],
      followUp: {
        next_follow_up_date: dateKeyFromNow(-1),
        notes: "Overdue provider review for rising blood pressure, tachycardia, and fluid retention.",
        created_at: isoAtUtc(5, 15, 0),
        updated_at: isoAtUtc(1, 8, 30),
      },
    },
    {
      id: ids.priya.id,
      name: ids.priya.fullName,
      vitals: [
        {
          heart_rate: 82,
          systolic_bp: 126,
          diastolic_bp: 78,
          weight: 63.5,
          symptoms: "Occasional brief fluttering sensation after exercise.",
          created_at: isoAtUtc(30, 6, 40),
        },
        {
          heart_rate: 80,
          systolic_bp: 124,
          diastolic_bp: 78,
          weight: 63.4,
          symptoms: "Recovering well after ablation follow-up.",
          created_at: isoAtUtc(21, 6, 45),
        },
        {
          heart_rate: 78,
          systolic_bp: 122,
          diastolic_bp: 76,
          weight: 63.3,
          symptoms: "No chest pain or shortness of breath.",
          created_at: isoAtUtc(14, 6, 50),
        },
        {
          heart_rate: 77,
          systolic_bp: 120,
          diastolic_bp: 76,
          weight: 63.1,
          symptoms: "Sleeping better and tolerating normal activity.",
          created_at: isoAtUtc(7, 6, 35),
        },
        {
          heart_rate: 76,
          systolic_bp: 118,
          diastolic_bp: 74,
          weight: 63,
          symptoms: "Feels well. Walking daily without limitations.",
          created_at: isoAtUtc(0, 6, 30),
        },
      ],
      medications: [
        {
          medication_name: "Apixaban",
          dosage: "5 mg",
          frequency: "Twice daily",
          notes: "Post-ablation anticoagulation.",
          created_at: isoAtUtc(70, 9, 0),
        },
        {
          medication_name: "Diltiazem ER",
          dosage: "120 mg",
          frequency: "Once daily",
          notes: "Rate control during recovery period.",
          created_at: isoAtUtc(70, 9, 10),
        },
      ],
      adherence: [
        {
          medication_name: "Apixaban",
          taken_on: dateKeyFromNow(0),
          taken_at: isoAtUtc(0, 7, 20),
        },
        {
          medication_name: "Diltiazem ER",
          taken_on: dateKeyFromNow(0),
          taken_at: isoAtUtc(0, 7, 22),
        },
      ],
      carePlans: [
        {
          title: "Complete post-ablation recovery plan",
          description:
            "Continue hydration, avoid intense exertion for one more week, and report sustained palpitations lasting more than 10 minutes.",
          status: "active",
          next_review_date: dateKeyFromNow(14),
          created_at: isoAtUtc(10, 10, 0),
        },
      ],
      followUp: {
        next_follow_up_date: dateKeyFromNow(12),
        notes: "Routine rhythm check after stable post-ablation recovery.",
        created_at: isoAtUtc(4, 12, 0),
        updated_at: isoAtUtc(1, 10, 0),
      },
    },
    {
      id: ids.thomas.id,
      name: ids.thomas.fullName,
      vitals: [
        {
          heart_rate: 76,
          systolic_bp: 118,
          diastolic_bp: 72,
          weight: 82,
          symptoms: "No dizziness. Mild leg edema improved from last visit.",
          created_at: isoAtUtc(21, 7, 30),
        },
        {
          heart_rate: 72,
          systolic_bp: 110,
          diastolic_bp: 70,
          weight: 81.4,
          symptoms: "Reduced swelling after diuretic adjustment.",
          created_at: isoAtUtc(14, 7, 15),
        },
        {
          heart_rate: 68,
          systolic_bp: 102,
          diastolic_bp: 68,
          weight: 80.9,
          symptoms: "Lightheaded once after standing quickly.",
          created_at: isoAtUtc(7, 7, 5),
        },
        {
          heart_rate: 58,
          systolic_bp: 86,
          diastolic_bp: 58,
          weight: 80.1,
          symptoms: "New dizziness, fatigue, and near-syncope after morning medications.",
          created_at: isoAtUtc(0, 7, 0),
        },
      ],
      medications: [
        {
          medication_name: "Bumetanide",
          dosage: "1 mg",
          frequency: "Every morning",
          notes: "Loop diuretic after recent fluid overload episode.",
          created_at: isoAtUtc(24, 8, 0),
        },
        {
          medication_name: "Lisinopril",
          dosage: "10 mg",
          frequency: "Once daily",
          notes: "Blood pressure and ventricular remodeling support.",
          created_at: isoAtUtc(24, 8, 5),
        },
      ],
      adherence: [
        {
          medication_name: "Bumetanide",
          taken_on: dateKeyFromNow(0),
          taken_at: isoAtUtc(0, 6, 35),
        },
        {
          medication_name: "Lisinopril",
          taken_on: dateKeyFromNow(0),
          taken_at: isoAtUtc(0, 6, 40),
        },
      ],
      carePlans: [
        {
          title: "Evaluate symptomatic hypotension",
          description:
            "Repeat seated and standing blood pressures, review morning medication timing, and reassess diuretic dose.",
          status: "urgent-review",
          next_review_date: dateKeyFromNow(2),
          created_at: isoAtUtc(2, 9, 10),
        },
      ],
      followUp: {
        next_follow_up_date: dateKeyFromNow(1),
        notes: "Prompt medication review after hypotension alert.",
        created_at: isoAtUtc(1, 13, 0),
        updated_at: isoAtUtc(0, 9, 5),
      },
    },
  ];

  const profiles = [
    {
      id: ids.provider.id,
      full_name: ids.provider.fullName,
      role: ids.provider.role,
    },
    ...patients.map((patient) => ({
      id: patient.id,
      full_name: patient.name,
      role: "patient",
    })),
  ];

  const vitals = patients.flatMap((patient) =>
    patient.vitals.map((reading) => ({
      patient_id: patient.id,
      ...reading,
    })),
  );

  const medications = patients.flatMap((patient) =>
    patient.medications.map((medication) => ({
      patient_id: patient.id,
      ...medication,
    })),
  );

  const carePlans = patients.flatMap((patient) =>
    patient.carePlans.map((carePlan) => ({
      patient_id: patient.id,
      ...carePlan,
    })),
  );

  const followUps = patients.map((patient) => ({
    patient_id: patient.id,
    provider_id: providerId,
    next_follow_up_date: patient.followUp.next_follow_up_date,
    notes: patient.followUp.notes,
    created_at: patient.followUp.created_at,
    updated_at: patient.followUp.updated_at,
  }));

  return {
    patients,
    profiles,
    vitals,
    medications,
    carePlans,
    followUps,
  };
}

async function cleanupExistingDemoData(patientIds) {
  const { error: deleteAlertsError } = await supabase
    .from("alerts")
    .delete()
    .in("patient_id", patientIds);
  failIfError("Failed to delete existing alerts", deleteAlertsError);

  const { error: deleteFollowUpsError } = await supabase
    .from("follow_ups")
    .delete()
    .in("patient_id", patientIds);
  failIfError("Failed to delete existing follow-ups", deleteFollowUpsError);

  const { error: deleteCarePlansError } = await supabase
    .from("care_plans")
    .delete()
    .in("patient_id", patientIds);
  failIfError("Failed to delete existing care plans", deleteCarePlansError);

  const { data: existingMedications, error: existingMedicationsError } = await supabase
    .from("medications")
    .select("id")
    .in("patient_id", patientIds);
  failIfError(
    "Failed to fetch existing medications before cleanup",
    existingMedicationsError,
  );

  const medicationIds = (existingMedications || []).map((medication) => medication.id);

  if (medicationIds.length) {
    const { error: deleteAdherenceError } = await supabase
      .from("medication_adherence")
      .delete()
      .in("medication_id", medicationIds);
    failIfError("Failed to delete existing medication adherence", deleteAdherenceError);
  }

  const { error: deleteMedicationsError } = await supabase
    .from("medications")
    .delete()
    .in("patient_id", patientIds);
  failIfError("Failed to delete existing medications", deleteMedicationsError);

  const { error: deleteVitalsError } = await supabase
    .from("vitals")
    .delete()
    .in("patient_id", patientIds);
  failIfError("Failed to delete existing vitals", deleteVitalsError);
}

async function seedProfiles(dataset) {
  const { error } = await supabase.from("profiles").upsert(dataset.profiles, {
    onConflict: "id",
  });
  failIfError("Failed to upsert profiles", error);
}

async function seedVitals(dataset) {
  for (const patient of dataset.patients) {
    for (const reading of patient.vitals) {
      const { error } = await supabase.from("vitals").insert({
        patient_id: patient.id,
        ...reading,
      });

      failIfError(`Failed to insert vitals for ${patient.name}`, error);
    }
  }
}

async function seedMedicationsAndAdherence(dataset) {
  const medicationRows = [];

  for (const patient of dataset.patients) {
    const rows = patient.medications.map((medication) => ({
      patient_id: patient.id,
      ...medication,
    }));

    const { data, error } = await supabase
      .from("medications")
      .insert(rows)
      .select("id, patient_id, medication_name");

    failIfError(`Failed to insert medications for ${patient.name}`, error);
    medicationRows.push(...(data || []));
  }

  const medicationIndex = new Map(
    medicationRows.map((row) => [`${row.patient_id}:${row.medication_name}`, row.id]),
  );

  const adherenceRows = dataset.patients.flatMap((patient) =>
    patient.adherence.map((item) => ({
      medication_id: medicationIndex.get(`${patient.id}:${item.medication_name}`),
      patient_id: patient.id,
      taken_on: item.taken_on,
      taken_at: item.taken_at,
    })),
  );

  const missingMedicationReference = adherenceRows.find(
    (row) => typeof row.medication_id !== "string",
  );

  if (missingMedicationReference) {
    throw new Error("Medication adherence could not be mapped back to inserted medications.");
  }

  const { error } = await supabase.from("medication_adherence").insert(adherenceRows);
  failIfError("Failed to insert medication adherence", error);
}

async function seedCarePlans(dataset) {
  const { error } = await supabase.from("care_plans").insert(dataset.carePlans);
  failIfError("Failed to insert care plans", error);
}

async function seedFollowUps(dataset) {
  const { error } = await supabase.from("follow_ups").upsert(dataset.followUps, {
    onConflict: "patient_id",
  });
  failIfError("Failed to upsert follow-ups", error);
}

async function loadAlertSummary(patientIds) {
  const { data, error } = await supabase
    .from("alerts")
    .select("patient_id, alert_type")
    .in("patient_id", patientIds);

  failIfError("Failed to load alert summary", error);

  const alertCountByPatientId = new Map();

  for (const row of data || []) {
    alertCountByPatientId.set(
      row.patient_id,
      (alertCountByPatientId.get(row.patient_id) || 0) + 1,
    );
  }

  return alertCountByPatientId;
}

async function main() {
  const ids = await ensureDemoUsers();
  const dataset = buildDemoDataset({
    provider: ids.get("provider"),
    eleanor: ids.get("eleanor"),
    marcus: ids.get("marcus"),
    gloria: ids.get("gloria"),
    priya: ids.get("priya"),
    thomas: ids.get("thomas"),
  });
  const patientIds = dataset.patients.map((patient) => patient.id);

  await cleanupExistingDemoData(patientIds);
  await seedProfiles(dataset);
  await seedVitals(dataset);
  await seedMedicationsAndAdherence(dataset);
  await seedCarePlans(dataset);
  await seedFollowUps(dataset);

  const alertSummary = await loadAlertSummary(patientIds);

  console.log("Demo seed complete.");
  console.log(`Provider login: ${ids.get("provider").email}`);
  console.log(`Demo password: ${demoPassword}`);

  for (const patient of dataset.patients) {
    console.log(
      `- ${patient.name}: ${patient.vitals.length} vitals, ${patient.medications.length} medications, ${patient.carePlans.length} care plans, ${alertSummary.get(patient.id) || 0} active alerts`,
    );
  }
}

main().catch((error) => {
  console.error("Demo seed failed.");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
