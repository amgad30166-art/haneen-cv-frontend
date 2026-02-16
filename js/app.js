/* ═══════════════════════════════════════════════
   HANEEN AL SHARQ - CV MAKER APP
   Form wizard + validation + PDF generation
   ═══════════════════════════════════════════════ */

const TOTAL_STEPS = 8;
let currentStep = 1;
let expCount = 1;

// ─── Step labels ─────────────────────────────────────────────────
const stepLabels = [
  "", // index 0 unused
  "الشخصية",
  "العمل",
  "الجواز",
  "التعليم",
  "الخبرات",
  "المهارات",
  "الجسدية",
  "الصور",
];

// ─── Country codes ───────────────────────────────────────────────
const countryCodes = {
  Uganda: "+256",
  Kenya: "+254",
  Philippines: "+63",
  India: "+91",
  Ethiopia: "+251",
  Bangladesh: "+880",
};

// ─── Skills data ─────────────────────────────────────────────────
const skillsData = [
  { key: "cleaning", ar: "التنظيف", en: "Cleaning" },
  { key: "cooking", ar: "الطبخ", en: "Cooking" },
  { key: "arabicCooking", ar: "الطبخ العربي", en: "Arabic Cooking" },
  { key: "washing", ar: "الغسيل", en: "Washing" },
  { key: "ironing", ar: "الكي", en: "Ironing" },
  { key: "babysitting", ar: "رعاية الأطفال", en: "Babysitting" },
  { key: "childrenCare", ar: "العناية بالأطفال", en: "Children Care" },
  { key: "tutoring", ar: "التدريس", en: "Tutoring" },
  { key: "disabledCare", ar: "رعاية ذوي الاحتياجات", en: "Disabled Care" },
];

// ─── Initialize ──────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  renderStepNav();
  renderSkillsGrid();
  setupPhotoUploads();
  setupCountryCodeSync();
  updateUI();

  document.getElementById("nextBtn").addEventListener("click", nextStep);
  document.getElementById("prevBtn").addEventListener("click", prevStep);
  document.getElementById("generateBtn").addEventListener("click", generateCV);
  document.getElementById("addExpBtn").addEventListener("click", addExperience);
});

// ─── Step Navigation ─────────────────────────────────────────────
function renderStepNav() {
  const nav = document.getElementById("stepsNav");
  nav.innerHTML = "";
  for (let i = 1; i <= TOTAL_STEPS; i++) {
    const dot = document.createElement("span");
    dot.className = "step-dot" + (i === currentStep ? " active" : "");
    dot.textContent = `${i}. ${stepLabels[i]}`;
    dot.addEventListener("click", () => goToStep(i));
    nav.appendChild(dot);
  }
}

function updateUI() {
  // Update steps
  document.querySelectorAll(".form-step").forEach((s) => {
    s.classList.toggle("active", parseInt(s.dataset.step) === currentStep);
  });

  // Update progress
  document.getElementById("progressFill").style.width = `${(currentStep / TOTAL_STEPS) * 100}%`;

  // Update nav dots
  document.querySelectorAll(".step-dot").forEach((dot, i) => {
    const step = i + 1;
    dot.className = "step-dot";
    if (step === currentStep) dot.classList.add("active");
    else if (step < currentStep) dot.classList.add("completed");
  });

  // Update buttons
  document.getElementById("prevBtn").disabled = currentStep === 1;
  document.getElementById("nextBtn").style.display = currentStep < TOTAL_STEPS ? "" : "none";
  document.getElementById("generateBtn").style.display = currentStep === TOTAL_STEPS ? "" : "none";

  // Scroll to top
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function nextStep() {
  if (!validateStep(currentStep)) return;
  if (currentStep < TOTAL_STEPS) {
    currentStep++;
    updateUI();
  }
}

function prevStep() {
  if (currentStep > 1) {
    currentStep--;
    updateUI();
  }
}

function goToStep(step) {
  // Allow going back freely, but validate when going forward
  if (step > currentStep) {
    for (let i = currentStep; i < step; i++) {
      if (!validateStep(i)) return;
    }
  }
  currentStep = step;
  updateUI();
}

// ─── Validation ──────────────────────────────────────────────────
function validateStep(step) {
  const section = document.querySelector(`.form-step[data-step="${step}"]`);
  if (!section) return true;

  let valid = true;

  // Clear previous errors
  section.querySelectorAll(".error").forEach((el) => el.classList.remove("error"));

  // Check required fields
  section.querySelectorAll("[required]").forEach((field) => {
    if (!field.value || field.value.trim() === "") {
      field.classList.add("error");
      valid = false;
    }
  });

  // Step-specific validation
  if (step === 1) {
    const dob = section.querySelector('[name="dateOfBirth"]');
    if (dob && dob.value) {
      const age = calcAge(dob.value);
      if (age < 21 || age > 45) {
        dob.classList.add("error");
        alert("العمر يجب أن يكون بين 21 و 45 سنة\nAge must be between 21 and 45 years");
        valid = false;
      }
    }
  }

  if (step === 2) {
    const mobile = section.querySelector('[name="mobileNumber"]');
    if (mobile && mobile.value && mobile.value.startsWith("0")) {
      mobile.classList.add("error");
      alert("رقم الجوال يجب أن لا يبدأ بصفر\nMobile number should not start with 0");
      valid = false;
    }
  }

  if (step === 3) {
    const expiry = section.querySelector('[name="passportExpiryDate"]');
    if (expiry && expiry.value) {
      const expiryDate = new Date(expiry.value);
      const sixMonths = new Date();
      sixMonths.setMonth(sixMonths.getMonth() + 6);
      if (expiryDate < sixMonths) {
        expiry.classList.add("error");
        alert("يجب أن يكون الجواز صالحاً لمدة 6 أشهر على الأقل\nPassport must be valid for at least 6 months");
        valid = false;
      }
    }
  }

  if (step === 7) {
    const height = section.querySelector('[name="heightCm"]');
    const weight = section.querySelector('[name="weightKg"]');
    if (height && height.value && parseInt(height.value) < 150) {
      height.classList.add("error");
      alert("الحد الأدنى للطول 150 سم\nMinimum height is 150 cm");
      valid = false;
    }
    if (weight && weight.value) {
      const w = parseInt(weight.value);
      if (w < 40 || w > 80) {
        weight.classList.add("error");
        alert("الوزن يجب أن يكون بين 40 و 80 كغ\nWeight must be between 40 and 80 kg");
        valid = false;
      }
    }
  }

  if (!valid) {
    // Shake effect
    section.style.animation = "none";
    setTimeout(() => (section.style.animation = ""), 10);
  }

  return valid;
}

function calcAge(dob) {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

// ─── Skills Grid ─────────────────────────────────────────────────
function renderSkillsGrid() {
  const grid = document.getElementById("skillsGrid");
  grid.innerHTML = skillsData
    .map(
      (s) => `
    <div class="skill-card">
      <div class="skill-name">${s.ar}</div>
      <div class="skill-name-en">${s.en}</div>
      <select name="skill_${s.key}">
        <option value="Poor">ضعيف / Poor</option>
        <option value="Good">جيد / Good</option>
        <option value="Very Good" selected>جيد جداً / Very Good</option>
        <option value="Excellent">ممتاز / Excellent</option>
      </select>
    </div>
  `
    )
    .join("");
}

// ─── Photo Uploads ───────────────────────────────────────────────
function setupPhotoUploads() {
  ["profilePhoto", "fullPhoto", "passportScan"].forEach((name) => {
    const input = document.getElementById(name + "Input");
    const preview = document.getElementById(name + "Preview");
    if (!input || !preview) return;

    input.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
        preview.innerHTML = `<img src="${ev.target.result}" />`;
        preview.classList.add("has-image");
      };
      reader.readAsDataURL(file);
    });
  });
}

// ─── Country Code Sync ──────────────────────────────────────────
function setupCountryCodeSync() {
  const natSelect = document.querySelector('[name="nationality"]');
  const codeSpan = document.getElementById("countryCode");
  if (!natSelect || !codeSpan) return;

  natSelect.addEventListener("change", () => {
    codeSpan.textContent = countryCodes[natSelect.value] || "+---";
  });
}

// ─── Add Experience ──────────────────────────────────────────────
function addExperience() {
  const idx = expCount++;
  const list = document.getElementById("experienceList");
  const entry = document.createElement("div");
  entry.className = "exp-entry";
  entry.dataset.index = idx;
  entry.innerHTML = `
    <button type="button" class="remove-exp" onclick="this.parentElement.remove()">×</button>
    <div class="form-grid">
      <div class="field">
        <label>الدولة <span class="en">Country</span></label>
        <input type="text" name="expCountry_${idx}" placeholder="e.g. السعودية / Saudi Arabia" />
      </div>
      <div class="field">
        <label>المدة (سنوات) <span class="en">Period (Years)</span></label>
        <input type="number" name="expPeriod_${idx}" min="0" max="20" placeholder="2" dir="ltr" />
      </div>
      <div class="field full">
        <label>المنصب <span class="en">Position</span></label>
        <select name="expPosition_${idx}">
          <option value="">اختر...</option>
          <option value="عاملة منزلية / Housemaid">عاملة منزلية / Housemaid</option>
          <option value="مربية أطفال / Nanny">مربية أطفال / Nanny</option>
          <option value="طباخة / Cook">طباخة / Cook</option>
          <option value="سائق خاص / Driver">سائق خاص / Driver</option>
          <option value="أخرى / Other">أخرى / Other</option>
        </select>
      </div>
    </div>
  `;
  list.appendChild(entry);
}

// ─── Collect Form Data ──────────────────────────────────────────
function collectData() {
  const form = document.getElementById("cvForm");
  const fd = new FormData(form);

  const dob = fd.get("dateOfBirth");

  const data = {
    fullName: fd.get("fullName") || "",
    fullNameAr: fd.get("fullNameAr") || "",
    gender: fd.get("gender") || "",
    dateOfBirth: dob || "",
    age: dob ? calcAge(dob) : "",
    nationality: fd.get("nationality") || "",
    religion: fd.get("religion") || "",
    maritalStatus: fd.get("maritalStatus") || "",
    numberOfChildren: parseInt(fd.get("numberOfChildren")) || 0,
    currentResidence: fd.get("currentResidence") || "",

    profession: fd.get("profession") || "",
    monthlySalary: fd.get("monthlySalary") || "",
    contractPeriod: "2",
    mobileNumber: (document.getElementById("countryCode")?.textContent || "") + (fd.get("mobileNumber") || ""),

    passportNumber: fd.get("passportNumber") || "",
    passportIssueDate: fd.get("passportIssueDate") || "",
    passportExpiryDate: fd.get("passportExpiryDate") || "",

    educationLevel: fd.get("educationLevel") || "",
    englishLevel: fd.get("englishLevel") || "",
    arabicLevel: fd.get("arabicLevel") || "",

    otherExperience: fd.get("otherExperience") || "",

    heightCm: fd.get("heightCm") || "",
    weightKg: fd.get("weightKg") || "",
    medicalFit: fd.get("medicalFit") === "true",

    agencyName: fd.get("agencyName") || "",
  };

  // Collect experience entries
  data.experienceAbroad = [];
  document.querySelectorAll(".exp-entry").forEach((entry) => {
    const idx = entry.dataset.index;
    const country = form.querySelector(`[name="expCountry_${idx}"]`)?.value;
    const period = form.querySelector(`[name="expPeriod_${idx}"]`)?.value;
    const position = form.querySelector(`[name="expPosition_${idx}"]`)?.value;
    if (country || period || position) {
      data.experienceAbroad.push({ country, period, position });
    }
  });

  // Collect skills
  data.skills = {};
  skillsData.forEach((s) => {
    data.skills[s.key] = fd.get(`skill_${s.key}`) || "Poor";
  });

  return data;
}

// ─── Generate CV ─────────────────────────────────────────────────
async function generateCV() {
  if (!validateStep(currentStep)) return;

  const btn = document.getElementById("generateBtn");
  const loader = document.getElementById("btnLoader");
  const text = document.getElementById("btnText");

  btn.disabled = true;
  loader.style.display = "";
  text.textContent = "جاري إنشاء السيرة الذاتية...";

  try {
    const data = collectData();

    // Build FormData for multipart upload
    const formData = new FormData();
    formData.append("data", JSON.stringify(data));

    // Attach photos
    const profileInput = document.getElementById("profilePhotoInput");
    const fullInput = document.getElementById("fullPhotoInput");
    const passportInput = document.getElementById("passportScanInput");

    if (profileInput.files[0]) formData.append("profilePhoto", profileInput.files[0]);
    if (fullInput.files[0]) formData.append("fullPhoto", fullInput.files[0]);
    if (passportInput.files[0]) formData.append("passportScan", passportInput.files[0]);

    // Send to backend
    const response = await fetch(`${API_URL}/api/generate-cv`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || "Server error");
    }

    // Download PDF
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CV_${data.fullName.replace(/\s+/g, "_")}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Success feedback
    text.textContent = "✅ تم إنشاء السيرة الذاتية بنجاح!";
    setTimeout(() => {
      text.textContent = "📄 إنشاء السيرة الذاتية / Generate CV";
      btn.disabled = false;
      loader.style.display = "none";
    }, 3000);
  } catch (err) {
    console.error("Generation error:", err);
    alert(`خطأ في إنشاء السيرة الذاتية\nError: ${err.message}\n\nتأكد من أن الخادم يعمل\nMake sure the backend server is running.`);
    text.textContent = "📄 إنشاء السيرة الذاتية / Generate CV";
    btn.disabled = false;
    loader.style.display = "none";
  }
}
