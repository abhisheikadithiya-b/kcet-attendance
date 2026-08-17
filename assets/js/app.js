"use strict";

// Security Hardening: Clickjacking Defense (OWASP 2.3)
if (window.self !== window.top) {
  window.top.location = window.self.location;
}

// Security Hardening: DOM XSS Encoder (OWASP 2.1)
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


const defaultClassesConfig = {
  'd11': {
    minLat: 9.673417,
    maxLat: 9.673443,
    minLon: 77.964781,
    maxLon: 77.964789,
    polygon: [
      [9.673417, 77.964787],
      [9.673437, 77.964781],
      [9.673443, 77.964789],
      [9.673420, 77.964789]
    ]
  },
  'd12': {
    minLat: 9.673417,
    maxLat: 9.673443,
    minLon: 77.9647702,
    maxLon: 77.9647782,
    polygon: [
      [9.673417, 77.9647762],
      [9.673437, 77.9647702],
      [9.673443, 77.9647782],
      [9.673420, 77.9647782]
    ]
  }
};

const CONFIG = {
  collegeName: "Kamaraj College of Engineering & Technology",
  faceModelsPath: "/models",
  firebaseConfig: {
    apiKey: "AIzaSyANVKvC52Qx-nJM2f-gstVfjcBtPb1YxJE",
    authDomain: "kcet-attendance.firebaseapp.com",
    projectId: "kcet-attendance",
    storageBucket: "kcet-attendance.firebasestorage.app",
    messagingSenderId: "531484845333",
    appId: "1:531484845333:web:05c407544c3e976bf0f51c",
    measurementId: "G-Y181LLDDD9"
  }
};

const students = [];

const state = {
  insideCampus: false,
  cameraActive: false,
  faceModelsReady: false,
  detectionTimer: null,
  db: null,
  captureAngles: 0,
  attendance: JSON.parse(localStorage.getItem("studentAttendanceRecords") || "{}"),
  descriptors: JSON.parse(localStorage.getItem("studentFaceDescriptors") || "{}"),
  map: null,
  userMarker: null,
  editMode: false,
  editStudentId: null,
  campusBoundaryLayer: null,
  tileLayer: null,
  classesConfig: null,
  shiftConfig: null,
  scanLocked: false,
  matchLog: JSON.parse(localStorage.getItem("matchDebugLog") || "[]")
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const elements = {
  collegeName: $("#collegeName"),
  currentDate: $("#currentDate"),
  currentTime: $("#currentTime"),
  topStatus: $("#topStatus"),
  typingText: $("#typingText"),
  totalStudents: $("#totalStudents"),
  presentStudents: $("#presentStudents"),
  absentStudents: $("#absentStudents"),
  attendanceRate: $("#attendanceRate"),
  video: $("#video"),
  canvas: $("#overlayCanvas"),
  cameraFrame: $("#cameraFrame"),
  scanStatus: $("#scanStatus"),
  scanHint: $("#scanHint"),
  recognizedName: $("#recognizedName"),
  recognizedTime: $("#recognizedTime"),
  latitudeValue: $("#latitudeValue"),
  longitudeValue: $("#longitudeValue"),
  distanceValue: $("#distanceValue"),
  campusStatus: $("#campusStatus"),
  insideCampusValue: $("#insideCampusValue"),
  verificationCard: $("#verificationCard"),
  gpsIndicator: $("#gpsIndicator"),
  attendanceTable: $("#attendanceTable"),
  searchInput: $("#searchInput"),
  dateFilter: $("#dateFilter"),
  toastStack: $("#toastStack"),
  successModal: $("#successModal"),
  modalTitle: $("#modalTitle"),
  modalText: $("#modalText"),
  captureCount: $("#captureCount")
};

document.addEventListener("DOMContentLoaded", init);

async function fetchClassesConfig() {
  try {
    const res = await fetch('/api/classes');
    if (res.ok) {
      state.classesConfig = await res.json();
    }
  } catch (err) {
    console.error("Failed to load class boundaries from server:", err);
  }
  if (!state.classesConfig) {
    state.classesConfig = defaultClassesConfig;
  }
}

async function fetchShiftConfig() {
  try {
    const res = await fetch('/api/shifts');
    if (res.ok) {
      state.shiftConfig = await res.json();
    }
  } catch (err) {
    console.error("Failed to load shifts config from server:", err);
  }
  if (!state.shiftConfig) {
    state.shiftConfig = {
      morningStart: "08:50",
      morningEnd: "09:45",
      afternoonStart: "13:30",
      afternoonEnd: "14:30"
    };
  }
}

async function init() {
  await fetchClassesConfig();
  await fetchShiftConfig();
  if (elements.collegeName) elements.collegeName.textContent = CONFIG.collegeName;
  if ($("#year")) $("#year").textContent = new Date().getFullYear();
  if (elements.dateFilter) elements.dateFilter.valueAsDate = new Date();

  if (window.AOS) AOS.init({ duration: 400, once: true, offset: 40 });
  if (elements.currentDate && elements.currentTime) initClock();
  if (elements.typingText) initTyping();

  // Sync admin student list from cloud FIRST (via server API, no Firebase client SDK needed)
  // This ensures the table has data before it renders for the first time
  await syncRegistryFromCloud();

  // Initialize Firebase client SDK in parallel (for client-side Firestore reads if needed)
  initFirebase();

  initMap();
  hydrateDescriptors();
  bindEvents();
  if (elements.attendanceTable) renderAttendanceTable();
  if (elements.totalStudents) updateStats();
  if (window.location.pathname.includes('register.html')) {
    renderActiveLinks();
    renderPendingQueue();
  }
  loadFaceModels();
  initPwa();
  updateCameraStateRestriction();
  initSplashAndLogin();
}

function bindEvents() {
  if ($("#menuToggle")) $("#menuToggle").addEventListener("click", () => {
    const nav = $(".nav-links");
    if (nav) nav.classList.toggle("open");
  });
  if ($("#themeToggle")) $("#themeToggle").addEventListener("click", toggleTheme);
  if ($("#verifyLocationBtn")) $("#verifyLocationBtn").addEventListener("click", verifyLocation);
  if ($("#simulateLocationBtn")) $("#simulateLocationBtn").addEventListener("click", simulateLocation);
  if ($("#startCameraBtn")) $("#startCameraBtn").addEventListener("click", startCamera);
  if ($("#exportBtn")) $("#exportBtn").addEventListener("click", exportCsv);
  if ($("#exportTodayBtn")) $("#exportTodayBtn").addEventListener("click", exportTodayCsv);
  if ($("#exportAbsenteesBtn")) $("#exportAbsenteesBtn").addEventListener("click", exportAbsenteesCsv);
  if ($("#captureFaceBtn")) $("#captureFaceBtn").addEventListener("click", captureFaceAngle);
  if ($("#saveFaceBtn")) $("#saveFaceBtn").addEventListener("click", saveRegisteredFace);
  if ($("#approveCapturesBtn")) $("#approveCapturesBtn").addEventListener("click", approveCaptures);
  if ($("#retryCapturesBtn")) $("#retryCapturesBtn").addEventListener("click", retryCaptures);
  if ($("#closeModalBtn")) $("#closeModalBtn").addEventListener("click", closeModal);
  
  if (elements.searchInput) elements.searchInput.addEventListener("input", renderAttendanceTable);
  if (elements.dateFilter) elements.dateFilter.addEventListener("change", renderAttendanceTable);
  
  $$(".nav-links a").forEach((link) => link.addEventListener("click", () => {
    const nav = $(".nav-links");
    if (nav) nav.classList.remove("open");
  }));
  document.addEventListener("scroll", activateCurrentNav, { passive: true });
}

function initClock() {
  const update = () => {
    const now = new Date();
    elements.currentDate.textContent = now.toLocaleDateString(undefined, {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
    elements.currentTime.textContent = now.toLocaleTimeString();
  };
  update();
  setInterval(update, 1000);
}

function initTyping() {
  const phrases = [
    "Face recognized. GPS verified. Attendance saved.",
    "Automatic student attendance tracking for smart campuses.",
    "Firebase-ready database logs with duplicate checks."
  ];
  let phraseIndex = 0;
  let letterIndex = 0;
  let deleting = false;

  const tick = () => {
    const phrase = phrases[phraseIndex];
    elements.typingText.textContent = phrase.slice(0, letterIndex);
    if (!deleting && letterIndex < phrase.length) letterIndex += 1;
    else if (deleting && letterIndex > 0) letterIndex -= 1;
    else {
      deleting = !deleting;
      if (!deleting) phraseIndex = (phraseIndex + 1) % phrases.length;
    }
    setTimeout(tick, deleting ? 20 : letterIndex === phrase.length ? 2000 : 40);
  };
  tick();
}

function toggleTheme() {
  document.body.classList.toggle("dark-mode");
  const isDark = document.body.classList.contains("dark-mode");
  localStorage.setItem("theme", isDark ? "dark" : "light");
  
  if (state.map && state.tileLayer) {
    const tileUrl = isDark 
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' 
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
    state.tileLayer.setUrl(tileUrl);
  }
}

if (localStorage.getItem("theme") === "dark") document.body.classList.add("dark-mode");

async function initFirebase() {
  const hasConfig = CONFIG.firebaseConfig && CONFIG.firebaseConfig.apiKey;
  if (!hasConfig || !window.firebase) return;

  try {
    firebase.initializeApp(CONFIG.firebaseConfig);
    state.db = firebase.firestore();
    if (window.firebase.storage) {
      state.storage = firebase.storage();
    }
    toast("Firebase connected", "Student attendance will sync with Firestore.");
  } catch (error) {
    toast("Firebase skipped", "Offline local storage mode enabled.");
  }
}

async function syncRegistryFromCloud() {
  const isAdminPage = window.location.pathname.includes('register.html');
  let adminToken = sessionStorage.getItem('adminToken') || localStorage.getItem('adminToken');
  let adminClass = sessionStorage.getItem('adminClass') || localStorage.getItem('adminClass') || "";
  let studentClass = sessionStorage.getItem('studentClass') || "";

  // Sync to sessionStorage if we recovered from localStorage
  if (adminToken && !sessionStorage.getItem('adminToken')) {
    sessionStorage.setItem('adminToken', adminToken);
    sessionStorage.setItem('adminClass', adminClass);
    sessionStorage.setItem('isAdmin', 'true');
  }

  // Determine active target class code
  let targetClass = (isAdminPage ? adminClass : (studentClass || adminClass)).trim().toLowerCase();

  // Use admin endpoint if adminToken exists, otherwise public /api/students endpoint
  let fetchUrl = adminToken 
    ? `/api/admin/students?classCode=${encodeURIComponent(targetClass)}`
    : `/api/students?classCode=${encodeURIComponent(targetClass)}`;

  let headers = adminToken ? { 'Authorization': `Bearer ${adminToken}` } : {};

  try {
    const res = await fetch(fetchUrl, { headers });
    if (res.ok) {
      const data = await res.json();
      if (data.students && Array.isArray(data.students)) {
        localStorage.setItem("customStudentsList", JSON.stringify(data.students));
      }
      if (data.descriptors) {
        // Merge descriptors, handling both legacy single and new multi-descriptor format
        for (const [did, dval] of Object.entries(data.descriptors)) {
          state.descriptors[did] = dval;
        }
        localStorage.setItem("studentFaceDescriptors", JSON.stringify(state.descriptors));
      }
      if (elements.attendanceTable) renderAttendanceTable();
      updateStats();
    } else if (res.status === 401 && adminToken) {
      // Session expired or server restarted — clear stale tokens
      console.warn('[Admin] Session expired (401). Clearing admin session.');
      sessionStorage.removeItem('adminToken');
      sessionStorage.removeItem('isAdmin');
      localStorage.removeItem('adminToken');
      if (isAdminPage) {
        toast("Session Expired", "Your admin session has expired. Please log in again.", "warning");
        setTimeout(() => { window.location.href = 'admin_login.html'; }, 2500);
      }
    } else {
      console.warn('Sync registry non-ok response:', res.status);
    }
  } catch (err) {
    console.warn("Sync registry error:", err);
  }

  // Fetch public attendance records for today
  try {
    const todayStr = elements.dateFilter ? elements.dateFilter.value : new Date().toISOString().split('T')[0];
    const attRes = await fetch(`/api/attendance?dateKey=${todayStr}`);
    if (attRes.ok) {
      const attData = await attRes.json();
      if (attData.records) {
        state.attendance[attData.dateKey] = { ...state.attendance[attData.dateKey], ...attData.records };
        localStorage.setItem("studentAttendanceRecords", JSON.stringify(state.attendance));
        if (elements.attendanceTable) renderAttendanceTable();
        updateStats();
      }
    }
  } catch (attErr) {
    console.warn("Public attendance fetch error:", attErr);
  }
}

function initMap() {
  if (!$("#mapView") || !window.L) return;
  const config = getActiveConfiguration(true);
  const defaultCenter = [9.67343, 77.96478]; // Campus fallback center
  const centerLat = config ? (config.minLat + config.maxLat) / 2 : defaultCenter[0];
  const centerLon = config ? (config.minLon + config.maxLon) / 2 : defaultCenter[1];
  
  if (!state.map) {
    state.map = L.map('mapView', { maxZoom: 20, zoomControl: false }).setView([centerLat, centerLon], 19);
    
    const isDark = document.body.classList.contains("dark-mode");
    const tileUrl = isDark 
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' 
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
      
    state.tileLayer = L.tileLayer(tileUrl, {
        maxZoom: 20,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    }).addTo(state.map);
  } else if (config) {
    state.map.setView([centerLat, centerLon], 19);
  }
  
  drawBoundaryOnMap();
}

function drawBoundaryOnMap() {
  if (!state.map) return;
  if (state.campusBoundaryLayer) state.map.removeLayer(state.campusBoundaryLayer);
  
  const config = getActiveConfiguration(true);
  if (!config) return;

  const greenStyle = {
    color: "#10ac84",
    weight: 3,
    fillColor: "#10ac84",
    fillOpacity: 0.2,
    dashArray: "0"
  };

  if (config.polygon) {
    state.campusBoundaryLayer = L.polygon(config.polygon, greenStyle).addTo(state.map);
    state.map.fitBounds(L.polygon(config.polygon).getBounds());
  } else {
    const bounds = [[config.minLat, config.minLon], [config.maxLat, config.maxLon]];
    state.campusBoundaryLayer = L.rectangle(bounds, greenStyle).addTo(state.map);
    state.map.fitBounds(bounds);
  }
}

async function loadFaceModels() {
  if (!window.faceapi) {
    setScanStatus("Face API loading", "Waiting for scripts to finish loading...");
    return;
  }

  try {
    setScanStatus("Loading AI models", "Initializing face detection engines...");
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(CONFIG.faceModelsPath),
      faceapi.nets.faceLandmark68Net.loadFromUri(CONFIG.faceModelsPath),
      faceapi.nets.faceRecognitionNet.loadFromUri(CONFIG.faceModelsPath)
    ]);
    state.faceModelsReady = true;
    setScanStatus("AI models ready", "Verify class GPS to unlock check-in camera.");
    setTopStatus("AI Ready", true);
    toast("Face AI ready", "Recognition descriptors successfully activated.");
  } catch (error) {
    state.faceModelsReady = false;
    setScanStatus("Model loading error", "Weights file missing in /models.");
    setTopStatus("AI Offline", false);
    toast("Models offline", "Could not load neural networks weights.");
  }
}

function getDecimalPlaces(val) {
  if (val === null || val === undefined) return 0;
  const str = String(val).trim();
  if (!str.includes('.')) return 0;
  return str.split('.')[1].length;
}

function distanceToSegmentMeters(pLat, pLon, lat1, lon1, lat2, lon2) {
  const latRad = (pLat * Math.PI) / 180;
  const metersPerDegreeLat = 111139;
  const metersPerDegreeLon = 111139 * Math.cos(latRad);

  const px = 0;
  const py = 0;
  const x1 = (lon1 - pLon) * metersPerDegreeLon;
  const y1 = (lat1 - pLat) * metersPerDegreeLat;
  const x2 = (lon2 - pLon) * metersPerDegreeLon;
  const y2 = (lat2 - pLat) * metersPerDegreeLat;

  const dx = x2 - x1;
  const dy = y2 - y1;

  if (dx === 0 && dy === 0) {
    return Math.sqrt(x1 * x1 + y1 * y1);
  }

  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)));
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;

  return Math.sqrt(projX * projX + projY * projY);
}

function minDistanceToPolygonMeters(lat, lon, polygon) {
  if (!polygon || polygon.length < 3) return Infinity;
  let minDistance = Infinity;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const p1 = polygon[j];
    const p2 = polygon[i];
    const dist = distanceToSegmentMeters(lat, lon, p1[0], p1[1], p2[0], p2[1]);
    if (dist < minDistance) minDistance = dist;
  }
  return minDistance;
}

function logGpsAudit(inside, reason, accuracy, distanceOutside) {
  const entry = {
    timestamp: new Date().toISOString(),
    matchedId: inside ? 'GPS_VERIFIED' : 'GPS_REJECTED',
    winningDistance: inside ? 0 : Number((distanceOutside || 0).toFixed(2)),
    runnerUpDistance: 0, // Strict polygon - 0m buffer allowed
    gpsVerified: inside,
    accuracy: accuracy !== null && accuracy !== undefined ? Number(accuracy.toFixed(1)) : null,
    reason: reason
  };
  state.matchLog.push(entry);
  if (state.matchLog.length > 100) {
    state.matchLog = state.matchLog.slice(-100);
  }
  localStorage.setItem("matchDebugLog", JSON.stringify(state.matchLog));
  renderDebugPanel();
}

function verifyLocation() {
  if (!navigator.geolocation) {
    setCampusStatus(false, null, null, null, "Geolocation is not supported by your browser.");
    return;
  }

  elements.campusStatus.textContent = "Sampling GPS (4s window)...";
  if (elements.gpsIndicator) elements.gpsIndicator.style.background = "var(--warning)";

  const samples = [];
  const startTime = Date.now();
  const sampleDurationMs = 4000;
  let watchId = null;

  const processBestSample = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
    }

    if (!samples.length) {
      setCampusStatus(false, null, null, null, "GPS verification failed. No valid location reading received.");
      return;
    }

    // Pick the single BEST reading (lowest accuracy value) from the batch
    samples.sort((a, b) => a.coords.accuracy - b.coords.accuracy);
    const bestReading = samples[0];

    const rawLatStr = bestReading.coords.latitude !== undefined && bestReading.coords.latitude !== null ? bestReading.coords.latitude.toString() : "";
    const rawLonStr = bestReading.coords.longitude !== undefined && bestReading.coords.longitude !== null ? bestReading.coords.longitude.toString() : "";
    const latitude = bestReading.coords.latitude;
    const longitude = bestReading.coords.longitude;
    const accuracy = bestReading.coords.accuracy;

    const config = getActiveConfiguration();
    if (!config) return;

    const centerLat = (config.minLat + config.maxLat) / 2;
    const centerLon = (config.minLon + config.maxLon) / 2;
    const distanceToCenter = getDistanceMeters(latitude, longitude, centerLat, centerLon);

    // 1. Accuracy Check (Missing/0/NaN rejected)
    if (accuracy === undefined || accuracy === null || isNaN(accuracy) || accuracy <= 0) {
      const reason = "REJECTED: GPS accuracy reading missing or invalid. Please retry.";
      setCampusStatus(false, latitude, longitude, distanceToCenter, reason);
      logGpsAudit(false, reason, accuracy, distanceToCenter);
      return;
    }

    // 2. Precision Check (Fewer than 4 decimal digits rejected)
    if (getDecimalPlaces(rawLatStr) < 4 || getDecimalPlaces(rawLonStr) < 4) {
      const reason = `REJECTED: Coarse GPS reading (fewer than 4 decimal digits). Accuracy: ${accuracy.toFixed(1)}m. Please retry.`;
      setCampusStatus(false, latitude, longitude, distanceToCenter, reason);
      logGpsAudit(false, reason, accuracy, distanceToCenter);
      return;
    }

    // 3. Strict Polygon or Bounding Box Check (NO BUFFER, NO RADIUS, NO EXPANSION)
    let inside = false;
    let distanceOutside = 0;

    if (config.polygon && Array.isArray(config.polygon) && config.polygon.length >= 3) {
      inside = isPointInPolygon(latitude, longitude, config.polygon);
      if (!inside) {
        distanceOutside = minDistanceToPolygonMeters(latitude, longitude, config.polygon);
      }
    } else {
      // Bounding box fallback with NO expansion whatsoever
      inside = (latitude >= config.minLat && latitude <= config.maxLat && longitude >= config.minLon && longitude <= config.maxLon);
      distanceOutside = inside ? 0 : distanceToCenter;
    }

    // 4. Clear Unambiguous Messages & Audit Log
    const customMessage = inside
      ? `Class location verified. Coordinates match classroom polygon bounds.`
      : `You appear to be outside the classroom boundary. Please move fully inside the room and tap Verify GPS again.`;

    const reason = inside
      ? `PASS: Directly inside classroom polygon (Best Accuracy: ${accuracy.toFixed(1)}m from ${samples.length} samples)`
      : `REJECTED: ${distanceOutside.toFixed(1)}m outside classroom boundary (Best Accuracy: ${accuracy.toFixed(1)}m from ${samples.length} samples)`;

    setCampusStatus(inside, latitude, longitude, distanceToCenter, customMessage);
    logGpsAudit(inside, reason, accuracy, distanceOutside);

    if (state.map) {
      if (!state.userMarker) {
        state.userMarker = L.circleMarker([latitude, longitude], {
          radius: 6,
          color: "#ffffff",
          weight: 2,
          fillColor: inside ? "#2b8a3e" : "#c92a2a",
          fillOpacity: 1
        }).addTo(state.map);
      } else {
        state.userMarker.setLatLng([latitude, longitude]);
        state.userMarker.setStyle({ fillColor: inside ? "#2b8a3e" : "#c92a2a" });
      }
      state.map.setView([latitude, longitude], 19);
    }
  };

  watchId = navigator.geolocation.watchPosition(
    (pos) => {
      samples.push(pos);
      if (Date.now() - startTime >= sampleDurationMs) {
        processBestSample();
      }
    },
    (err) => {
      if (samples.length) {
        processBestSample();
      } else {
        setCampusStatus(false, null, null, null, `GPS access error (${err.message}). Please enable location privileges.`);
      }
    },
    { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
  );

  setTimeout(() => {
    if (watchId !== null) {
      processBestSample();
    }
  }, sampleDurationMs + 500);
}

function simulateLocation() {
  const config = getActiveConfiguration();
  if (!config) return;
  const centerLat = (config.minLat + config.maxLat) / 2;
  const centerLon = (config.minLon + config.maxLon) / 2;
  
  elements.campusStatus.textContent = "Simulating GPS...";
  if (elements.gpsIndicator) elements.gpsIndicator.style.background = "var(--warning)";
  
  const latitude = centerLat;
  const longitude = centerLon;
  const inside = true;
  const distance = 0;
  
  setTimeout(() => {
    setCampusStatus(true, latitude, longitude, distance, "Simulated classroom presence. Face scan is enabled for automatic check-in.");
    
    if (state.map) {
      if (!state.userMarker) {
        state.userMarker = L.circleMarker([latitude, longitude], {
          radius: 6,
          color: "#ffffff",
          weight: 2,
          fillColor: "#2b8a3e",
          fillOpacity: 1
        }).addTo(state.map);
      } else {
        state.userMarker.setLatLng([latitude, longitude]);
        state.userMarker.setStyle({ fillColor: "#2b8a3e" });
      }
      state.map.setView([latitude, longitude], 19);
    }
  }, 500);
}

function setCampusStatus(inside, latitude, longitude, distance, customMessage) {
  state.insideCampus = inside;
  if (elements.latitudeValue) elements.latitudeValue.textContent = latitude ? latitude.toFixed(6) : "--";
  if (elements.longitudeValue) elements.longitudeValue.textContent = longitude ? longitude.toFixed(6) : "--";
  if (elements.distanceValue) elements.distanceValue.textContent = distance !== null && distance !== undefined ? `${Math.round(distance)} m` : "--";
  if (elements.insideCampusValue) elements.insideCampusValue.textContent = inside ? "Inside Class" : "Outside Class";
  if (elements.campusStatus) elements.campusStatus.textContent = inside ? "Inside Class" : "Outside Class";
  if (elements.gpsIndicator) elements.gpsIndicator.style.background = inside ? "var(--accent)" : "var(--danger)";
  
  if (elements.verificationCard) {
    elements.verificationCard.classList.toggle("verified", inside);
    elements.verificationCard.classList.toggle("warning", !inside);
    elements.verificationCard.querySelector("p").textContent = customMessage || (
      inside
        ? "Class location verification complete. Face scan is now enabled for automatic check-in."
        : "You are outside class boundaries. Please move within coordinates."
    );
  }
  
  setTopStatus(inside ? "Class Verified" : "GPS Checked", inside);
  toast(inside ? "Location Verified" : "Outside Bounds", inside ? "Coordinates match class range." : "Access restricted outside bounds.");
  
  updateCameraStateRestriction();
}

function updateCameraStateRestriction() {
  const isRegisterPage = window.location.pathname.includes('register.html');
  const startBtn = $("#startCameraBtn");
  
  // Task 4: Disable/Enable camera access dynamically
  if (startBtn && !isRegisterPage) {
    if (state.insideCampus) {
      startBtn.disabled = false;
      startBtn.title = "Start live facial scan";
    } else {
      startBtn.disabled = true;
      startBtn.title = "Verify GPS location inside class bounds to start camera";
    }
  }
}

function getDistanceMeters(lat1, lon1, lat2, lon2) {
  const earth = 6371000;
  const toRad = (value) => (value * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return earth * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function startCamera() {
  // Task 4: Camera startup coordinates restriction
  const isRegisterPage = window.location.pathname.includes('register.html');
  if (!isRegisterPage && !state.insideCampus) {
    toast("GPS Required", "GPS verification inside class bounds is mandatory before starting the camera.");
    return;
  }

  try {
    setScanStatus("Accessing webcam", "Requesting media devices input...");
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
    
    if (elements.video) {
      elements.video.srcObject = stream;
      elements.cameraFrame.classList.add("camera-on");
      elements.video.addEventListener("loadedmetadata", () => {
        resizeCanvas();
        if (state.faceModelsReady) startFaceDetection();
      }, { once: true });
    }
    
    const regVideo = $("#regVideo");
    if (regVideo) {
      regVideo.srcObject = stream;
      $("#regCameraFrame").classList.add("camera-on");
      regVideo.addEventListener("loadedmetadata", () => {
        resizeCanvas();
        if (state.faceModelsReady) startFaceDetection();
      }, { once: true });
    }
    
    state.cameraActive = true;
    setScanStatus("Scanning Frame", state.faceModelsReady ? "Awaiting student identification scan..." : "Camera active. Awaiting models load.");
    setTopStatus("Scanning", true);
    toast("Camera active", "Video feed successfully mounted.");
  } catch (error) {
    setScanStatus("Camera blocked", "Permit camera capture in browser settings and retry.");
    setTopStatus("Camera Offline", false);
    toast("Camera error", "Webcam access denied.");
  }
}

function resizeCanvas() {
  if (elements.video) {
    const rect = elements.video.getBoundingClientRect();
    elements.canvas.width = rect.width;
    elements.canvas.height = rect.height;
  }
  const regVideo = $("#regVideo");
  const regCanvas = $("#regOverlayCanvas");
  if (regVideo && regCanvas) {
    const rect = regVideo.getBoundingClientRect();
    regCanvas.width = rect.width;
    regCanvas.height = rect.height;
  }
}

function startFaceDetection() {
  clearInterval(state.detectionTimer);
  state.scanLocked = false;
  const options = new faceapi.SsdMobilenetv1Options({ minConfidence: FACE_THRESHOLDS.MIN_CONFIDENCE });

  let _tickTimes = [];
  state.detectionTimer = setInterval(async () => {
    if (!state.cameraActive) return;
    const _t0 = performance.now();

    try {
      resizeCanvas();

      // 1. Process main check-in screen
      if (elements.video && !elements.video.paused && !elements.video.ended) {
        // Session lock: skip matching after successful check-in
        if (state.scanLocked) {
          setScanStatus("Check-in complete", "Camera locked. Restart camera for next student.");
          return;
        }

        const detections = await faceapi
          .detectAllFaces(elements.video, options)
          .withFaceLandmarks()
          .withFaceDescriptors();

        const displaySize = { width: elements.canvas.width, height: elements.canvas.height };
        const resized = faceapi.resizeResults(detections, displaySize);
        const ctx = elements.canvas.getContext("2d");
        ctx.clearRect(0, 0, elements.canvas.width, elements.canvas.height);
        resized.forEach((result) => drawFaceBox(ctx, result.detection.box));

        if (detections.length === 0) {
          setScanStatus("No face detected", "Align your face with the camera lens.");
        } else if (detections.length > 1) {
          setScanStatus("Multiple faces detected", "Ensure only one student stands in view.");
          toast("Scan Paused", "Multiple faces detected.");
        } else {
          const matchedStudent = matchStudent(detections[0].descriptor);
          if (!matchedStudent) {
            setScanStatus("Unregistered Profile", "Student record not found in system storage.");
          } else {
            setScanStatus("Match Identified", `Identified: ${matchedStudent.name}. Checking bounds...`);
            await markAttendance(matchedStudent);
          }
        }
      }

      // 2. Process Registration Outline Drawing
      const regVideo = $("#regVideo");
      const regCanvas = $("#regOverlayCanvas");
      if (regVideo && regCanvas && !regVideo.paused && !regVideo.ended) {
        const regDetections = await faceapi
          .detectAllFaces(regVideo, options)
          .withFaceLandmarks();
        const regDisplaySize = { width: regCanvas.width, height: regCanvas.height };
        const regResized = faceapi.resizeResults(regDetections, regDisplaySize);
        const regCtx = regCanvas.getContext("2d");
        regCtx.clearRect(0, 0, regCanvas.width, regCanvas.height);
        regResized.forEach((result) => drawFaceBox(regCtx, result.detection.box));
      }
    } catch (err) {
      console.error("Face detection loop error:", err);
      if (typeof Sentry !== 'undefined') Sentry.captureException(err);
    }

    // Performance telemetry: log avg per-tick time every 20 ticks
    const _elapsed = performance.now() - _t0;
    _tickTimes.push(_elapsed);
    if (_tickTimes.length >= 20) {
      const avg = _tickTimes.reduce((a, b) => a + b, 0) / _tickTimes.length;
      const max = Math.max(..._tickTimes);
      console.log(`[PerfTelemetry] Detection tick avg=${avg.toFixed(1)}ms, max=${max.toFixed(1)}ms over ${_tickTimes.length} ticks (interval=${FACE_THRESHOLDS.DETECTION_INTERVAL_MS}ms)`);
      _tickTimes = [];
    }
  }, FACE_THRESHOLDS.DETECTION_INTERVAL_MS);
}

function drawFaceBox(ctx, box) {
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.strokeRect(box.x, box.y, box.width, box.height);
}

function matchStudent(descriptor) {
  const entries = Object.entries(state.descriptors);
  if (!entries.length) {
    console.log('[FaceMatch] No descriptors registered.');
    logMatchAttempt(null, null, null);
    return null;
  }

  let best = { id: null, distance: Infinity };
  let secondBest = { id: null, distance: Infinity };
  entries.forEach(([id, descriptorSet]) => {
    // Support both legacy single descriptor (flat array of numbers) and
    // new multi-descriptor format (array of arrays)
    const isLegacy = descriptorSet && typeof descriptorSet[0] === 'number';
    const descs = isLegacy ? [descriptorSet] : (descriptorSet || []);

    // Best-of-set: use minimum distance across all stored descriptors
    let minDist = Infinity;
    for (const desc of descs) {
      if (!desc || !desc.length) continue;
      const dist = faceapi.euclideanDistance(descriptor, new Float32Array(desc));
      if (dist < minDist) minDist = dist;
    }

    if (minDist < best.distance) {
      secondBest = { ...best };
      best = { id, distance: minDist };
    } else if (minDist < secondBest.distance) {
      secondBest = { id, distance: minDist };
    }
  });

  const margin = secondBest.distance - best.distance;
  console.log(`[FaceMatch] Best: ${best.id} (d=${best.distance.toFixed(4)}), Runner-up: ${secondBest.id} (d=${secondBest.distance.toFixed(4)}), Margin: ${margin.toFixed(4)}`);

  if (best.distance >= FACE_THRESHOLDS.MATCH_DISTANCE) {
    logMatchAttempt('no match', best.distance, secondBest.distance);
    return null;
  }

  if (entries.length > 1 && margin < FACE_THRESHOLDS.MATCH_MARGIN) {
    console.warn(`[FaceMatch] AMBIGUOUS: margin ${margin.toFixed(4)} < ${FACE_THRESHOLDS.MATCH_MARGIN} threshold. Rejecting match.`);
    if (typeof Sentry !== 'undefined') Sentry.captureMessage(`Ambiguous face match: best=${best.id} d=${best.distance.toFixed(4)}, runner-up=${secondBest.id} d=${secondBest.distance.toFixed(4)}, margin=${margin.toFixed(4)}`, 'warning');
    logMatchAttempt('ambiguous', best.distance, secondBest.distance);
    return null;
  }

  logMatchAttempt(best.id, best.distance, secondBest.distance);
  const list = getLocalStudentsList();
  return list.find((s) => s.id === best.id) || null;
}

function logMatchAttempt(matchedId, winningDistance, runnerUpDistance) {
  const entry = {
    timestamp: new Date().toISOString(),
    matchedId: matchedId || 'no match',
    winningDistance: winningDistance !== null ? Number(winningDistance.toFixed(4)) : null,
    runnerUpDistance: runnerUpDistance !== null ? Number(runnerUpDistance.toFixed(4)) : null,
    gpsVerified: state.insideCampus
  };
  state.matchLog.push(entry);
  // Cap at 100 entries
  if (state.matchLog.length > 100) {
    state.matchLog = state.matchLog.slice(-100);
  }
  localStorage.setItem("matchDebugLog", JSON.stringify(state.matchLog));
  renderDebugPanel();
}

function renderDebugPanel() {
  const table = document.getElementById('debugMatchTable');
  if (!table) return;
  const last20 = state.matchLog.slice(-20).reverse();
  table.innerHTML = last20.map(e => `<tr>
    <td style="font-size:0.7rem;white-space:nowrap">${new Date(e.timestamp).toLocaleTimeString()}</td>
    <td style="font-size:0.7rem">${escapeHtml(String(e.matchedId))}</td>
    <td style="font-size:0.7rem">${e.winningDistance !== null ? e.winningDistance : '—'}</td>
    <td style="font-size:0.7rem">${e.runnerUpDistance !== null ? e.runnerUpDistance : '—'}</td>
    <td style="font-size:0.7rem">${e.gpsVerified ? '✅' : '❌'}</td>
  </tr>`).join('');
}

function getLocalStudentsList() {
  return JSON.parse(localStorage.getItem("customStudentsList") || "[]");
}

async function markAttendance(student) {
  try {
    if (!state.insideCampus) {
      if (typeof Sentry !== 'undefined') Sentry.captureMessage(`Match attempted while GPS unverified: student=${student.id}`, 'info');
      toast("GPS Required", "You must verify your location coordinates first.");
      return;
    }

    // Throttle scanner: prevent alert spam if scanned multiple times in a row
    const timestamp = Date.now();
    if (state.lastScannedStudent && state.lastScannedStudent.id === student.id && (timestamp - state.lastScannedStudent.time < 8000)) {
      if (typeof Sentry !== 'undefined') Sentry.captureMessage(`Duplicate attendance blocked by throttle: student=${student.id}`, 'info');
      return;
    }
    state.lastScannedStudent = { id: student.id, time: timestamp };

    // Timing check: Morning vs Afternoon Shift check-ins
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    if (!state.shiftConfig) {
      state.shiftConfig = {
        morningStart: "08:50",
        morningEnd: "09:45",
        afternoonStart: "13:30",
        afternoonEnd: "14:30"
      };
    }

    const timeToMin = (str) => {
      const [h, m] = str.split(':').map(Number);
      return h * 60 + m;
    };

    const morningStart = timeToMin(state.shiftConfig.morningStart);
    const morningEnd = timeToMin(state.shiftConfig.morningEnd);
    const afternoonStart = timeToMin(state.shiftConfig.afternoonStart);
    const afternoonEnd = timeToMin(state.shiftConfig.afternoonEnd);

    let activeShift = null;
    if (currentMinutes >= morningStart && currentMinutes <= morningEnd) {
      activeShift = "morning";
    } else if (currentMinutes >= afternoonStart && currentMinutes <= afternoonEnd) {
      activeShift = "afternoon";
    }

    if (!activeShift) {
      const format12H = (str) => {
        const [hStr, mStr] = str.split(':');
        const h = parseInt(hStr, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const dh = h % 12 || 12;
        return `${dh}:${mStr} ${ampm}`;
      };
      const mStartStr = format12H(state.shiftConfig.morningStart);
      const mEndStr = format12H(state.shiftConfig.morningEnd);
      const aStartStr = format12H(state.shiftConfig.afternoonStart);
      const aEndStr = format12H(state.shiftConfig.afternoonEnd);

      toast("Check-in Closed", `Check-in is only available during morning shift (${mStartStr} - ${mEndStr}) or afternoon shift (${aStartStr} - ${aEndStr}).`);
      showModal("Check-In Closed", `Morning geofence check-in is strictly open from ${mStartStr} to ${mEndStr}.\nAfternoon geofence check-in is open from ${aStartStr} to ${aEndStr}.`);
      return;
    }

    if (getTodayRecord(student.id, activeShift)) {
      toast("Check-in Logged", `You have already marked your ${activeShift} attendance today.`);
      return;
    }

    const dateKey = getDateKey();
    if (!state.attendance[dateKey]) state.attendance[dateKey] = {};

    const existingRecord = state.attendance[dateKey][student.id] || {};
    
    const record = {
      studentId: student.id,
      name: student.name,
      rollNo: student.studentId,
      department: student.dept,
      year: student.year,
      morning: existingRecord.morning || "Absent",
      morningTimestamp: existingRecord.morningTimestamp || null,
      afternoon: existingRecord.afternoon || "Absent",
      afternoonTimestamp: existingRecord.afternoonTimestamp || null,
      source: "Biometric AI + Geolocator"
    };

    if (activeShift === "morning") {
      record.morning = "Present";
      record.morningTimestamp = now.toISOString();
      if (!existingRecord.afternoon) {
        record.afternoon = "Present"; // Default afternoon to Present if morning is Present
      }
    } else {
      record.afternoon = "Present";
      record.afternoonTimestamp = now.toISOString();
    }

    state.attendance[dateKey][student.id] = record;
    localStorage.setItem("studentAttendanceRecords", JSON.stringify(state.attendance));

    // Save attendance record via Public API Proxy Endpoint
    fetch('/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: student.id,
        studentName: student.name,
        classCode: student.year,
        morningStatus: record.morning,
        afternoonStatus: record.afternoon,
        dateKey: dateKey
      })
    }).catch(apiErr => console.warn("Public attendance POST error:", apiErr));

    elements.recognizedName.textContent = student.name;
    elements.recognizedTime.textContent = new Date(activeShift === "morning" ? record.morningTimestamp : record.afternoonTimestamp).toLocaleTimeString();
    renderAttendanceTable();
    updateStats();
    setScanStatus("Attendance Marked", `Check-in recorded for ${student.name} (${activeShift} shift).`);
    playSuccessTone();
    showModal("Check-In Complete", `Attendance logged successfully for ${student.name} (${student.studentId}) on the ${activeShift} shift.`);

    // Session lock: prevent further matching until camera restart
    state.scanLocked = true;
    console.log(`[ScanLock] Camera locked after successful check-in for ${student.id}`);
  } catch (err) {
    console.error("markAttendance error:", err);
    if (typeof Sentry !== 'undefined') Sentry.captureException(err);
    toast("Check-in Error", "An unexpected error occurred during attendance marking.");
  }
}

function getTodayRecord(studentId, shift = "morning") {
  const record = state.attendance[getDateKey()]?.[studentId];
  if (!record) return null;
  if (shift === "morning") {
    return record.morning === "Present" ? record : null;
  } else {
    return record.afternoon === "Present" && record.afternoonTimestamp ? record : null;
  }
}

function getDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function formatAttendanceBadgeHtml(status) {
  const statusClass = status ? status.toLowerCase() : 'absent';
  return `<span class="badge ${statusClass}">${escapeHtml(status)}</span>`;
}

function renderAttendanceTable() {
  if (!elements.attendanceTable) return;
  const search = elements.searchInput ? elements.searchInput.value.trim().toLowerCase() : "";
  const dateKey = elements.dateFilter ? elements.dateFilter.value || getDateKey() : getDateKey();
  const dayRecords = state.attendance[dateKey] || {};
  const list = getLocalStudentsList();
  
  const isAdminPage = window.location.pathname.includes('register.html');
  const activeClass = (isAdminPage 
    ? sessionStorage.getItem('adminClass') || localStorage.getItem('adminClass')
    : sessionStorage.getItem('studentClass')) || "";
  const cleanedClass = activeClass.trim().toLowerCase();

  // Filter list by active logged-in class
  let classList = list;
  if (cleanedClass) {
    classList = list.filter((student) => student.year.trim().toLowerCase() === cleanedClass);
  }

  const filtered = classList.filter((student) => 
    `${student.name} ${student.studentId} ${student.dept} ${student.year}`.toLowerCase().includes(search)
  );

  elements.attendanceTable.innerHTML = filtered.map((student) => {
    const record = dayRecords[student.id] || {};
    
    // Morning shift checking (Self geofenced check-in)
    const morningStatus = record.morning || "Absent";
    
    // Afternoon shift checking (Defaults to Present if morning checked in, or if afternoon checked in)
    let afternoonStatus = "Absent";
    if (morningStatus === "Present") {
      afternoonStatus = record.afternoon || "Present";
    } else if (record.afternoonTimestamp) {
      afternoonStatus = record.afternoon || "Present";
    }
    
    const timestamp = record.morningTimestamp ? new Date(record.morningTimestamp).toLocaleString() : "Awaiting check-in";
    
    const hasFaceDescriptor = !!state.descriptors[student.id];
    const faceBadge = hasFaceDescriptor ? '' : ' <span style="color:#e03131;font-size:0.65rem;font-weight:600">⚠ Face not registered</span>';
    let rowHtml = `
      <tr>
        <td>
          <div class="person-cell">
            <span class="avatar">${getInitials(student.name)}</span>
            <strong>${escapeHtml(student.name)}</strong>${faceBadge}
          </div>
        </td>
        <td>${escapeHtml(student.studentId)}</td>
        <td>${escapeHtml(student.dept)}</td>
        <td>${escapeHtml(student.year)}</td>
        <td>${formatAttendanceBadgeHtml(morningStatus)}</td>
    `;
    
    if (isAdminPage) {
      const isMorningAbsent = (morningStatus === "Absent");
      const hasAfternoonCheckIn = !!record.afternoonTimestamp;
      const canToggle = !isMorningAbsent || hasAfternoonCheckIn;
      rowHtml += `
        <td>
          <div style="display: flex; align-items: center; gap: 8px;">
            ${formatAttendanceBadgeHtml(afternoonStatus)}
            <button class="icon-btn" onclick="toggleAfternoonStatus('${student.id}')" type="button" style="padding: 2px 6px; font-size: 0.65rem; min-width: 50px;" ${canToggle ? '' : 'disabled title="Morning or Afternoon check-in required"'}>Toggle</button>
          </div>
        </td>
        <td>${timestamp}</td>
        <td>
          <div class="progress-track" aria-label="${student.percent}% attendance">
            <div class="progress-fill" style="--percent:${student.percent}%"></div>
          </div>
        </td>
        <td>
          <div class="actions-cell">
            <button class="icon-btn" onclick="viewStudentPhotos('${student.id}')" type="button" style="background: var(--accent); color: white;">Photos</button>
            <button class="icon-btn edit-btn" onclick="editStudent('${student.id}')" type="button">Edit</button>
            <button class="icon-btn delete-btn" onclick="deleteStudent('${student.id}')" type="button">Delete</button>
          </div>
        </td>
      `;
    } else {
      rowHtml += `
        <td>${formatAttendanceBadgeHtml(afternoonStatus)}</td>
      `;
    }
    
    rowHtml += `</tr>`;
    return rowHtml;
  }).join("");
}

function getInitials(name) {
  return name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();
}

function updateStats() {
  const presentAll = state.attendance[getDateKey()] || {};
  const list = getLocalStudentsList();
  
  const isAdminPage = window.location.pathname.includes('register.html');
  const activeClass = (isAdminPage 
    ? sessionStorage.getItem('adminClass') || localStorage.getItem('adminClass')
    : sessionStorage.getItem('studentClass')) || "";
  const cleanedClass = activeClass.trim().toLowerCase();

  // Filter list by active logged-in class
  let classList = list;
  if (cleanedClass) {
    classList = list.filter((student) => student.year.trim().toLowerCase() === cleanedClass);
  }

  // Count present from this class list (Morning geofenced check-ins)
  let present = 0;
  classList.forEach(student => {
    const record = presentAll[student.id];
    if (record && record.morning === "Present") {
      present++;
    }
  });

  const total = classList.length;
  const absent = Math.max(total - present, 0);
  const rate = total ? Math.round((present / total) * 100) : 0;

  if (elements.totalStudents) elements.totalStudents.textContent = total;
  if (elements.presentStudents) elements.presentStudents.textContent = present;
  if (elements.absentStudents) elements.absentStudents.textContent = absent;
  if (elements.attendanceRate) elements.attendanceRate.textContent = `${rate}%`;
}

// Quality check utilities for admin registration capture
function computeBlurScoreAdmin(canvas, ctx) {
  const w = canvas.width;
  const h = canvas.height;
  const imgData = ctx.getImageData(0, 0, w, h);
  const gray = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    gray[i] = 0.299 * imgData.data[i*4] + 0.587 * imgData.data[i*4+1] + 0.114 * imgData.data[i*4+2];
  }
  let sum = 0, sumSq = 0, count = 0;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const lap = -gray[(y-1)*w+x] - gray[y*w+(x-1)] + 4*gray[y*w+x] - gray[y*w+(x+1)] - gray[(y+1)*w+x];
      sum += lap; sumSq += lap * lap; count++;
    }
  }
  const mean = sum / count;
  return (sumSq / count) - (mean * mean);
}

function analyzeFrameQualityAdmin(canvas, ctx, detection) {
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;
  let totalBrightness = 0, sampleCount = 0;
  for (let i = 0; i < data.length; i += 16) {
    totalBrightness += 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2];
    sampleCount++;
  }
  const avgBrightness = totalBrightness / sampleCount;

  if (avgBrightness < FACE_THRESHOLDS.BRIGHTNESS_MIN) {
    return { valid: false, reason: "Too dark \u2014 move to better lighting." };
  }
  if (avgBrightness > FACE_THRESHOLDS.BRIGHTNESS_MAX) {
    return { valid: false, reason: "Too bright \u2014 reduce glare." };
  }

  const blurScore = computeBlurScoreAdmin(canvas, ctx);
  if (blurScore < FACE_THRESHOLDS.BLUR_VARIANCE_MIN) {
    return { valid: false, reason: "Image too blurry \u2014 hold still and try again." };
  }

  if (detection && detection.detection && detection.detection.box) {
    const faceRatio = detection.detection.box.width / canvas.width;
    if (faceRatio < FACE_THRESHOLDS.FACE_RATIO_MIN) {
      return { valid: false, reason: "Move closer to the camera." };
    }
    if (faceRatio > FACE_THRESHOLDS.FACE_RATIO_MAX) {
      return { valid: false, reason: "Move further back from the camera." };
    }
  }
  return { valid: true, brightness: avgBrightness, blur: blurScore };
}

async function captureFaceAngle() {
  if (!state.cameraActive) {
    await startCamera();
    return;
  }

  const regVideo = $("#regVideo");
  if (!regVideo || regVideo.paused || regVideo.ended) {
    toast("Camera preparing", "Webcam setup is in progress.");
    return;
  }

  const capBtn = $("#captureFaceBtn");
  if (capBtn) capBtn.disabled = true;

  const canvas = document.createElement("canvas");
  canvas.width = regVideo.videoWidth || 1280;
  canvas.height = regVideo.videoHeight || 720;
  const ctx = canvas.getContext("2d");

  setScanStatus("Analyzing angle...", "Sampling frames for optimal biometric clarity...");

  let bestDetection = null;
  let bestSnapshot = null;
  let bestScore = 0;
  let lastQualityReason = "";

  for (let attempt = 1; attempt <= FACE_THRESHOLDS.MULTI_FRAME_SAMPLES; attempt++) {
    ctx.drawImage(regVideo, 0, 0, canvas.width, canvas.height);
    const snapshot = canvas.toDataURL("image/jpeg", 0.85);
    const img = document.createElement("img");
    img.src = snapshot;
    await new Promise(resolve => img.onload = resolve);

    const detection = await faceapi.detectSingleFace(img, new faceapi.SsdMobilenetv1Options({ minConfidence: FACE_THRESHOLDS.MIN_CONFIDENCE }))
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (detection) {
      const confPct = (detection.detection.score * 100).toFixed(1);
      const quality = analyzeFrameQualityAdmin(canvas, ctx, detection);
      console.log(`[AdminCapture] Sample ${attempt}/${FACE_THRESHOLDS.MULTI_FRAME_SAMPLES}: Confidence ${confPct}%, Quality:`, quality);

      if (!quality.valid) {
        lastQualityReason = quality.reason;
      } else if (detection.detection.score > bestScore) {
        bestScore = detection.detection.score;
        bestDetection = detection;
        bestSnapshot = snapshot;
        break;
      }
    } else {
      console.log(`[AdminCapture] Sample ${attempt}/${FACE_THRESHOLDS.MULTI_FRAME_SAMPLES}: No face detected.`);
    }

    if (attempt < FACE_THRESHOLDS.MULTI_FRAME_SAMPLES) {
      await new Promise(res => setTimeout(res, FACE_THRESHOLDS.MULTI_FRAME_DELAY_MS));
    }
  }

  if (!bestDetection || !bestSnapshot) {
    if (capBtn) capBtn.disabled = false;
    if (lastQualityReason) {
      toast("Quality Check Failed", lastQualityReason, "warning");
      setScanStatus("Capture Rejected", lastQualityReason);
    } else {
      toast("Face Not Found", "Please align your face directly with the camera overlay and recapture.", "warning");
      setScanStatus("Capture Failed", "Ensure your face is clearly visible inside the box.");
    }
    return;
  }

  state.captureAngles = Math.min(state.captureAngles + 1, FACE_THRESHOLDS.REQUIRED_CAPTURES);
  if (!state.capturedSnapshots) state.capturedSnapshots = [];
  state.capturedSnapshots[state.captureAngles - 1] = bestSnapshot;

  if (!state.currentRegistrationDescriptors) state.currentRegistrationDescriptors = [];
  state.currentRegistrationDescriptors[state.captureAngles - 1] = Array.from(bestDetection.descriptor);

  const slot = $(`#thumbSlot${state.captureAngles}`);
  if (slot) {
    slot.innerHTML = `
      <span class="thumb-label">Angle ${state.captureAngles}</span>
      <img src="${bestSnapshot}" alt="Angle ${state.captureAngles}">
    `;
  }

  const angleInstructions = [
    "Angle 1: Look directly at camera",
    "Angle 2: Turn head slightly LEFT",
    "Angle 3: Turn head slightly RIGHT",
    "Angle 4: Tilt chin slightly UPWARD",
    "Angle 5: Tilt chin slightly DOWNWARD"
  ];

  elements.captureCount.textContent = state.captureAngles;
  $$(".capture-guide li").forEach((item, index) => item.classList.toggle("active", index === state.captureAngles));
  toast("Capture Successful", `Angle ${state.captureAngles} of ${FACE_THRESHOLDS.REQUIRED_CAPTURES} recorded. Confidence: ${(bestScore * 100).toFixed(1)}%`);
  setScanStatus("Biometrics extracted", `Angle ${state.captureAngles} ready.`);

  if (state.captureAngles >= FACE_THRESHOLDS.REQUIRED_CAPTURES) {
    $("#captureFaceBtn").classList.add("hidden");
    $("#approvalControls").classList.remove("hidden");
  } else {
    if (capBtn) capBtn.disabled = false;
    const nextInstruction = angleInstructions[state.captureAngles] || "";
    if (nextInstruction) setScanStatus("Next angle", nextInstruction);
  }
}

function approveCaptures() {
  $("#approvalControls").classList.add("hidden");
  $("#saveFaceBtn").disabled = false;
  toast("Angles Approved", "Registration details verified. Ready to save profile.");
}

function retryCaptures() {
  state.captureAngles = 0;
  state.capturedSnapshots = [];
  state.currentRegistrationDescriptors = [];
  elements.captureCount.textContent = "0";
  
  for (let i = 1; i <= FACE_THRESHOLDS.REQUIRED_CAPTURES; i++) {
    const slot = $(`#thumbSlot${i}`);
    if (slot) {
      slot.innerHTML = `
        <span class="thumb-label">Angle ${i}</span>
        <div class="thumb-placeholder">Awaiting capture</div>
      `;
    }
  }

  $$(".capture-guide li").forEach((item, index) => item.classList.toggle("active", index === 0));
  $("#approvalControls").classList.add("hidden");
  $("#captureFaceBtn").classList.remove("hidden");
  $("#saveFaceBtn").disabled = true;
}

async function saveRegisteredFace() {
  const name = $("#regName").value.trim();
  const studentId = $("#regStudentId").value.trim();
  const dept = $("#regDept").value;
  const year = $("#regYear").value;

  if (!name || !studentId) {
    toast("Fields Required", "Input full student credentials before saving.");
    return;
  }

  const id = state.editMode ? state.editStudentId : studentId.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  
  if (state.editMode) {
    if (id.startsWith('std-')) {
      const deletedDefaults = JSON.parse(localStorage.getItem("deletedDefaultStudents") || "[]");
      if (!deletedDefaults.includes(id)) {
        deletedDefaults.push(id);
        localStorage.setItem("deletedDefaultStudents", JSON.stringify(deletedDefaults));
      }
    }
    const custom = JSON.parse(localStorage.getItem("customStudentsList") || "[]");
    const existingIndex = custom.findIndex(s => s.id === id);
    const updatedRecord = { id, name, studentId, dept, year, percent: 100 };
    if (existingIndex > -1) {
      custom[existingIndex] = updatedRecord;
    } else {
      custom.push(updatedRecord);
    }
    localStorage.setItem("customStudentsList", JSON.stringify(custom));
  } else {
    const list = getLocalStudentsList();
    const existing = list.find((s) => s.id === id);
    if (existing) {
      toast("ID Taken", "Student ID already exists in registry.");
      return;
    }
    const custom = JSON.parse(localStorage.getItem("customStudentsList") || "[]");
    custom.push({ id, name, studentId, dept, year, percent: 100 });
    localStorage.setItem("customStudentsList", JSON.stringify(custom));
  }

  const regVideo = $("#regVideo");
  if (state.currentRegistrationDescriptors && state.currentRegistrationDescriptors.length > 0) {
    // Store all individual descriptors as array of arrays (no averaging)
    const allDescriptors = state.currentRegistrationDescriptors.filter(d => d !== null && d !== undefined);
    state.descriptors[id] = allDescriptors;
  } else if (!state.descriptors[id]) {
    // No face descriptor captured — warn admin instead of faking one
    console.warn(`[Registration] No face descriptor captured for ${id}. Student will not be matchable until face is registered.`);
    toast("⚠ Face Not Captured", `${name} was saved without biometric data. They must complete face registration to use check-in.`);
  }

  localStorage.setItem("studentFaceDescriptors", JSON.stringify(state.descriptors));
  
  const adminToken = sessionStorage.getItem('adminToken') || localStorage.getItem('adminToken');
  if (adminToken) {
    try {
      const descriptorSet = state.descriptors[id] || null;
      await fetch('/api/admin/students/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          students: [{
            id,
            name,
            studentId,
            dept,
            year,
            descriptor: Array.isArray(descriptorSet) && Array.isArray(descriptorSet[0]) ? descriptorSet[0] : descriptorSet,
            descriptors: descriptorSet,
            photos: state.capturedSnapshots || []
          }]
        })
      });
      toast("Cloud Sync", "Student registry updated via Admin Server Proxy.");
    } catch (err) {
      console.error("Admin proxy registration sync failed:", err);
    }
  }
  
  resetRegistrationForm();
  renderAttendanceTable();
  updateStats();
  showModal(state.editMode ? "Details Updated" : "Registration Complete", `Database record processed for ${name}.`);
}

// DEPRECATED: createSampleDescriptor generated fake non-facial descriptors
// that could match against real faces, causing misidentification.
// Kept for reference only — no longer called anywhere.
function createSampleDescriptor(seed) {
  console.warn('[DEPRECATED] createSampleDescriptor called — this should no longer be used.');
  return Array.from({ length: 128 }, (_, index) => {
    const code = seed.charCodeAt(index % seed.length) || 1;
    return ((code * (index + 3)) % 100) / 100;
  });
}

function hydrateDescriptors() {
  // Only real captured descriptors are kept in the matching pool.
  // Students without a descriptor are excluded — no fake data.
  const list = getLocalStudentsList();
  const unregistered = list.filter(s => !state.descriptors[s.id]);
  if (unregistered.length > 0) {
    console.log(`[Hydrate] ${unregistered.length} student(s) without face descriptor: ${unregistered.map(s => s.id).join(', ')}`);
  }
  // Clean up any legacy fake descriptors by removing entries for students
  // whose descriptors were generated by createSampleDescriptor
  // (We can't perfectly detect fakes, but we don't add new ones anymore)
  localStorage.setItem("studentFaceDescriptors", JSON.stringify(state.descriptors));
}

function exportCsv() {
  const startDateStr = elements.dateFilter ? (elements.dateFilter.value || getDateKey()) : getDateKey();
  const endDateElement = document.getElementById('exportEndDate');
  const endDateStr = endDateElement && endDateElement.value ? endDateElement.value : startDateStr;

  const dateKeys = [];
  if (startDateStr <= endDateStr) {
    let currentStr = startDateStr;
    while (currentStr <= endDateStr) {
      dateKeys.push(currentStr);
      let d = new Date(currentStr);
      d.setUTCDate(d.getUTCDate() + 1);
      currentStr = d.toISOString().slice(0, 10);
    }
  } else {
    dateKeys.push(startDateStr);
  }

  const rows = [
    [
      "Student Name",
      "Roll No / Student ID",
      "Department",
      "Class",
      "Total Working Days",
      "Days Present",
      "Standard Study Hours",
      "Hours Attended",
      "Attendance Percentage"
    ]
  ];

  const totalWorkingDays = dateKeys.length;
  const standardHoursPerDay = 6;
  const totalWorkingHours = totalWorkingDays * standardHoursPerDay;
  const list = getLocalStudentsList();
  const adminClass = (sessionStorage.getItem('adminClass') || localStorage.getItem('adminClass') || "").trim().toLowerCase();
  
  // Filter by admin class
  let classList = list;
  if (adminClass) {
    classList = list.filter((student) => student.year.trim().toLowerCase() === adminClass);
  }

  classList.forEach((student) => {
    let daysPresent = 0;

    dateKeys.forEach(dateKey => {
      const records = state.attendance[dateKey] || {};
      const record = records[student.id];
      if (record) {
        daysPresent++;
      }
    });

    const totalHoursPresent = daysPresent * standardHoursPerDay;
    const presentPercentage = totalWorkingDays > 0 ? ((daysPresent / totalWorkingDays) * 100).toFixed(2) + "%" : "0%";

    rows.push([
      student.name,
      student.studentId,
      student.dept,
      student.year,
      totalWorkingDays,
      daysPresent,
      totalWorkingHours,
      totalHoursPresent,
      presentPercentage
    ]);
  });

  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  
  if (startDateStr === endDateStr) {
    link.download = `student-attendance-${startDateStr}.csv`;
  } else {
    link.download = `student-attendance-${startDateStr}-to-${endDateStr}.csv`;
  }
  
  link.click();
  URL.revokeObjectURL(url);
  toast("CSV Export", "Student attendance datasheet generated successfully.");
}

function exportTodayCsv() {
  const dateKey = getDateKey();
  const presentAll = state.attendance[dateKey] || {};
  const list = getLocalStudentsList();
  
  const adminClass = (sessionStorage.getItem('adminClass') || localStorage.getItem('adminClass') || "").trim().toLowerCase();
  
  // Filter by admin class
  let classList = list;
  if (adminClass) {
    classList = list.filter((student) => student.year.trim().toLowerCase() === adminClass);
  }

  const rows = [
    [
      "student name",
      "roll no",
      "department",
      "fn",
      "an"
    ]
  ];

  classList.forEach((student) => {
    const record = presentAll[student.id] || {};
    
    // Morning shift checking
    const morningStatus = (record.morning || "Absent").toLowerCase();
    
    // Afternoon shift checking (Defaults to Present if morning checked in, or if afternoon checked in)
    let afternoonStatus = "absent";
    if (morningStatus === "present") {
      afternoonStatus = (record.afternoon || "Present").toLowerCase();
    } else if (record.afternoonTimestamp) {
      afternoonStatus = (record.afternoon || "Present").toLowerCase();
    }

    rows.push([
      student.name,
      student.studentId,
      student.dept,
      morningStatus,
      afternoonStatus
    ]);
  });

  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `today-attendance-${dateKey}.csv`;
  link.click();
  URL.revokeObjectURL(url);
  toast("CSV Export", "Today's attendance datasheet generated successfully.");
}

function exportAbsenteesCsv() {
  const dateKey = getDateKey();
  const presentAll = state.attendance[dateKey] || {};
  const list = getLocalStudentsList();
  
  const adminClass = (sessionStorage.getItem('adminClass') || localStorage.getItem('adminClass') || "").trim().toLowerCase();
  
  // Filter by admin class
  let classList = list;
  if (adminClass) {
    classList = list.filter((student) => student.year.trim().toLowerCase() === adminClass);
  }

  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();
  const formattedDate = `date:${dd}/${mm}/${yyyy}`;

  const rows = [
    ["absentes", formattedDate],
    ["name", "roll"]
  ];

  classList.forEach((student) => {
    const record = presentAll[student.id] || {};
    const morningStatus = record.morning || "Absent";
    
    // Check afternoon shift status (resolved to Absent if morning is Absent and they didn't check in during afternoon)
    let afternoonStatus = "Absent";
    if (morningStatus === "Present") {
      afternoonStatus = record.afternoon || "Present";
    } else if (record.afternoonTimestamp) {
      afternoonStatus = record.afternoon || "Present";
    }
    
    // An absentee is someone who is absent in both morning and afternoon (fully absent for the day)
    if (morningStatus === "Absent" && afternoonStatus === "Absent") {
      rows.push([student.name, student.studentId]);
    }
  });

  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `today-absentees-${dateKey}.csv`;
  link.click();
  URL.revokeObjectURL(url);
  toast("CSV Export", "Today's absentees list generated successfully.");
}

function setScanStatus(title, hint) {
  if (elements.scanStatus) elements.scanStatus.textContent = title;
  if (elements.scanHint) elements.scanHint.textContent = hint;
}

function setTopStatus(label, active) {
  if (elements.topStatus) {
    elements.topStatus.querySelector("strong").textContent = label;
    elements.topStatus.classList.toggle("online", active);
  }
}

function toast(title, message) {
  if (!elements.toastStack) return;
  const node = document.createElement("div");
  node.className = "toast";
  node.innerHTML = `<strong>${title}</strong><span>${message}</span>`;
  elements.toastStack.appendChild(node);
  setTimeout(() => node.remove(), 4000);
}

function showModal(title, text) {
  if (!elements.successModal) return;
  elements.modalTitle.textContent = title;
  elements.modalText.textContent = text;
  elements.successModal.classList.add("show");
  elements.successModal.setAttribute("aria-hidden", "false");
}

function closeModal() {
  if (!elements.successModal) return;
  elements.successModal.classList.remove("show");
  elements.successModal.setAttribute("aria-hidden", "true");
}

function playSuccessTone() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audio = new AudioContext();
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.frequency.value = 880;
    oscillator.type = "sine";
    gain.gain.setValueAtTime(0.001, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.05, audio.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.18);
    oscillator.connect(gain).connect(audio.destination);
    oscillator.start();
    oscillator.stop(audio.currentTime + 0.2);
  } catch (e) {
    // Silent fallback
  }
}

function activateCurrentNav() {
  const sections = $$("main section[id]");
  const current = sections.filter((section) => section.getBoundingClientRect().top < 120).at(-1);
  if (!current) return;
  $$(".nav-links a").forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${current.id}`);
  });
}

function initPwa() {
  // Task 2: Service worker registration
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js')
        .then(() => console.log('Service worker loaded.'))
        .catch((err) => console.log('Service worker failure:', err));
    });
  }

  // Task 2: Standalone mode bypass & install prompt modal logic
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  if (isStandalone) {
    console.log('App opened via standalone homescreen/desktop shortcut.');
    return;
  }

  let deferredPrompt;
  const banner = $('#pwaInstallBanner');
  const installBtn = $('#pwaInstallBtn');
  const closeBtn = $('#pwaCloseBtn');

  if (!banner) return;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const textNode = banner.querySelector('p');
    if (textNode) {
      textNode.textContent = isMobile 
        ? "Add this app to your Home Screen for quick mobile attendance scans."
        : "Install this app on your Desktop for a quick biometric gateway shortcut.";
    }
    
    banner.classList.remove('hidden');
  });

  if (installBtn) {
    installBtn.addEventListener('click', async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`PWA prompt selection outcome: ${outcome}`);
      deferredPrompt = null;
      banner.classList.add('hidden');
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      banner.classList.add('hidden');
    });
  }
}

function initSplashAndLogin() {
  const isRegisterPage = window.location.pathname.includes('register.html');
  const isLoginPage = window.location.pathname.includes('admin_login.html');
  
  // Admin pages bypass splash/login overlay completely
  if (isRegisterPage || isLoginPage) {
    const shell = $('#appShell');
    if (shell) shell.classList.remove('hidden');
    return;
  }

  const splash = $('#splashScreen');
  const loginScreen = $('#studentLoginScreen');
  const shell = $('#appShell');

  // Task 1: Splash screen fades out after 1.8 seconds
  setTimeout(() => {
    if (splash) {
      splash.classList.add('fade-out');
      setTimeout(() => {
        splash.style.display = 'none';
        
        // Task 2: Student validation check
        if (sessionStorage.getItem('isStudent') === 'true') {
          if (shell) shell.classList.remove('hidden');
        } else {
          if (loginScreen) loginScreen.classList.remove('hidden');
        }
      }, 500); // Wait for transition fade to complete
    } else {
      if (sessionStorage.getItem('isStudent') === 'true') {
        if (shell) shell.classList.remove('hidden');
      } else {
        if (loginScreen) loginScreen.classList.remove('hidden');
      }
    }
  }, 1800);

  // Task 2: Login validation
  const loginForm = $('#studentLoginForm');
  const classSelect = $('#studentClass');
  const passwordInput = $('#studentPassword');
  const loginError = $('#studentLoginError');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const selectedClass = classSelect.value.trim().toLowerCase();
      const pwd = passwordInput.value.trim();

      try {
        const res = await fetch('/api/student-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ classCode: selectedClass, password: pwd })
        });
        const data = await res.json();

        if (res.ok && data.success) {
          if (loginError) loginError.style.display = 'none';
          sessionStorage.setItem('isStudent', 'true');
          sessionStorage.setItem('studentClass', selectedClass);
          
          await syncRegistryFromCloud();
          renderAttendanceTable();
          updateStats();

          if (loginScreen) {
            loginScreen.classList.add('fade-out');
            setTimeout(() => {
              loginScreen.style.display = 'none';
              if (shell) shell.classList.remove('hidden');
              toast("Access granted", "Welcome to Student check-in portal.");
            }, 400);
          } else {
            if (shell) shell.classList.remove('hidden');
          }
        } else {
          if (loginError) {
            loginError.textContent = data.message || 'Incorrect password.';
            loginError.style.display = 'block';
          }
          passwordInput.value = '';
        }
      } catch (err) {
        if (loginError) {
          loginError.textContent = 'Server connection error. Please try again.';
          loginError.style.display = 'block';
        }
      }
    });
  }
}

window.addEventListener("resize", resizeCanvas);
// Polygon Coordinate / Active configurations helpers
function getClassesConfig() {
  return state.classesConfig || defaultClassesConfig;
}

function getActiveConfiguration(silent = false) {
  const configs = getClassesConfig();
  const isAdminPage = window.location.pathname.includes('register.html');
  const activeClass = (isAdminPage 
    ? sessionStorage.getItem('adminClass') || localStorage.getItem('adminClass')
    : sessionStorage.getItem('studentClass')) || "";
  const cleaned = activeClass.trim().toLowerCase();

  if (!cleaned) {
    if (!silent) {
      console.error('[Config] No class selected — cannot determine geofence.');
      toast("Configuration Error", "No class selected. Please log in again and select a class.");
    }
    state.insideCampus = false;
    return null;
  }

  const config = configs[cleaned];
  if (!config) {
    if (!silent) {
      console.error(`[Config] Class '${cleaned}' not found in configuration. Available: ${Object.keys(configs).join(', ')}`);
      toast("Configuration Error", `Class '${activeClass}' has no geofence configured. Check-in is blocked. Contact admin.`);
      if (typeof Sentry !== 'undefined') Sentry.captureMessage(`Missing class config: '${cleaned}'. Available: ${Object.keys(configs).join(', ')}`, 'error');
    }
    state.insideCampus = false;
    return null;
  }

  return config;
}

function isPointInPolygon(lat, lon, vs) {
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    let xi = vs[i][0], yi = vs[i][1];
    let xj = vs[j][0], yj = vs[j][1];
    let intersect = ((yi > lon) !== (yj > lon))
        && (lat < (xj - xi) * (lon - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

// Student Edit and Delete controllers
window.editStudent = function(id) {
  const list = getLocalStudentsList();
  const student = list.find(s => s.id === id);
  if (!student) return;

  state.editMode = true;
  state.editStudentId = id;

  $("#regName").value = student.name;
  
  const regId = $("#regStudentId");
  if (regId) {
    regId.value = student.studentId;
    regId.disabled = true;
  }
  
  $("#regDept").value = student.dept;
  $("#regYear").value = student.year;

  const saveBtn = $("#saveFaceBtn");
  if (saveBtn) {
    saveBtn.textContent = "Update Student";
    saveBtn.disabled = false;
  }

  const formSection = $(".registration-card");
  if (formSection) {
    formSection.scrollIntoView({ behavior: 'smooth' });
  }
  
  toast("Editing Student", `Modify details or re-capture face angles for ${student.name}.`);
};

window.deleteStudent = function(id) {
  const list = getLocalStudentsList();
  const student = list.find(s => s.id === id);
  if (!student) return;

  if (confirm(`Are you sure you want to permanently delete student ${student.name}?`)) {
    if (id.startsWith('std-')) {
      const deletedDefaults = JSON.parse(localStorage.getItem("deletedDefaultStudents") || "[]");
      if (!deletedDefaults.includes(id)) {
        deletedDefaults.push(id);
        localStorage.setItem("deletedDefaultStudents", JSON.stringify(deletedDefaults));
      }
    } else {
      const custom = JSON.parse(localStorage.getItem("customStudentsList") || "[]");
      const filtered = custom.filter(s => s.id !== id);
      localStorage.setItem("customStudentsList", JSON.stringify(filtered));
    }

    if (state.descriptors[id]) {
      delete state.descriptors[id];
      localStorage.setItem("studentFaceDescriptors", JSON.stringify(state.descriptors));
    }

    const adminToken = sessionStorage.getItem('adminToken') || localStorage.getItem('adminToken');
    if (adminToken) {
      fetch(`/api/admin/students/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      }).catch(err => console.error("Admin proxy delete student error:", err));
    }

    if (state.editMode && state.editStudentId === id) {
      resetRegistrationForm();
    }

    renderAttendanceTable();
    updateStats();
    toast("Student Deleted", `${student.name} removed from campus registry.`);
  }
};

function resetRegistrationForm() {
  state.editMode = false;
  state.editStudentId = null;

  $("#regName").value = "";
  const regId = $("#regStudentId");
  if (regId) {
    regId.value = "";
    regId.disabled = false;
  }
  
  const saveBtn = $("#saveFaceBtn");
  if (saveBtn) {
    saveBtn.textContent = "Save Student Face";
    saveBtn.disabled = true;
  }

  retryCaptures();
}

window.toggleAfternoonStatus = function(studentId) {
  const dateKey = getDateKey();
  if (!state.attendance[dateKey]) state.attendance[dateKey] = {};
  
  const record = state.attendance[dateKey][studentId];
  const morningStatus = record ? record.morning : "Absent";
  const hasAfternoonCheckIn = record && record.afternoonTimestamp;
  
  if (!record || (morningStatus !== "Present" && !hasAfternoonCheckIn)) {
    toast("Action Blocked", "Cannot toggle afternoon status for absent students.");
    return;
  }

  const current = record.afternoon || "Present";
  record.afternoon = (current === "Present") ? "Absent" : "Present";

  localStorage.setItem("studentAttendanceRecords", JSON.stringify(state.attendance));
  
  if (state.db) {
    state.db.collection("studentAttendance").doc(dateKey).collection("students").doc(studentId).set(state.attendance[dateKey][studentId]);
  }
  
  renderAttendanceTable();
  updateStats();
  toast("Shift Toggled", "Student afternoon attendance status updated.");
};

window.viewStudentPhotos = async function(id) {
  const adminToken = sessionStorage.getItem('adminToken') || localStorage.getItem('adminToken');
  if (!adminToken) {
    toast("Admin Login Required", "Please log in as admin to view student photos.");
    return;
  }
  toast("Loading Photos", "Retrieving face angle snapshots from cloud...");
  try {
    // Use the server-side API (works regardless of client-side Firebase SDK state)
    const res = await fetch(`/api/admin/students/${encodeURIComponent(id)}`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    if (res.ok) {
      const data = await res.json();
      const photos = data.student && data.student.photos ? data.student.photos : [];
      if (photos.length > 0) {
        showPhotoViewerModal(data.student.name || 'Student', photos);
      } else {
        toast("No Photos", "No facial snapshots exist for this student.");
      }
    } else if (res.status === 401) {
      toast("Session Expired", "Your admin session has expired. Please log in again.");
      setTimeout(() => { window.location.href = 'admin_login.html'; }, 2000);
    } else {
      toast("Load Failed", "Error fetching photos from server.");
    }
  } catch (err) {
    console.error('viewStudentPhotos error:', err);
    toast("Load Failed", "Network error while fetching student photos.");
  }
};

function showPhotoViewerModal(name, photos) {
  const modal = document.getElementById("photoViewerModal");
  const title = document.getElementById("photoModalTitle");
  const grid = document.getElementById("photoGrid");
  if (!modal || !grid) return;
  
  title.textContent = `${name}'s Face Angles`;
  grid.innerHTML = photos.map((src, i) => `
    <div style="flex: 1; text-align: center; border: 1px solid var(--line); border-radius: 6px; padding: 4px; background: var(--bg-2);">
      <small style="display: block; margin-bottom: 4px; color: var(--muted); font-size: 0.65rem;">Angle ${i + 1}</small>
      <img src="${src}" alt="Angle ${i + 1}" style="width: 100%; height: auto; border-radius: 4px; object-fit: cover;">
    </div>
  `).join("");
  
  modal.style.display = "flex";
}

window.closePhotoModal = function() {
  const modal = document.getElementById("photoViewerModal");
  if (modal) modal.style.display = "none";
};

// Self-Registration Link & Approval Queue Management
async function generateRegistrationLink() {
  const adminClass = (sessionStorage.getItem('adminClass') || localStorage.getItem('adminClass') || "d11").trim().toLowerCase();
  const token = typeof crypto !== 'undefined' && crypto.randomUUID 
    ? crypto.randomUUID() 
    : 'token-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);

  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000); // 24 Hours

  const adminToken = sessionStorage.getItem('adminToken') || localStorage.getItem('adminToken');

  try {
    let linkData = null;
    if (adminToken) {
      const res = await fetch('/api/admin/registration-links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ classCode: adminClass })
      });
      const data = await res.json();
      if (res.ok && data.success && data.linkData) {
        linkData = data.linkData;
      } else {
        toast("Database Error", data.message || "Failed to save registration link to cloud database.", "warning");
        return;
      }
    } else {
      const token = typeof crypto !== 'undefined' && crypto.randomUUID 
        ? crypto.randomUUID() 
        : 'token-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      const createdAt = new Date();
      const expiresAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);
      linkData = { token, class: adminClass, createdAt: createdAt.toISOString(), expiresAt: expiresAt.toISOString(), active: true };
    }

    const localLinks = JSON.parse(localStorage.getItem('registrationLinks') || "[]");
    localLinks.push(linkData);
    localStorage.setItem('registrationLinks', JSON.stringify(localLinks));

    const shareUrl = `${window.location.origin}/self-register.html?token=${linkData.token}`;
    
    const container = $("#latestGeneratedLinkContainer");
    const input = $("#generatedLinkInput");
    if (container && input) {
      input.value = shareUrl;
      container.style.display = "block";
    }

    toast("Link Generated", `24-hour self-registration link created for class ${adminClass.toUpperCase()}.`);
    renderActiveLinks();
  } catch (err) {
    console.error("Generate link error:", err);
    toast("Link Error", "Could not generate registration link.");
  }
}

function copyGeneratedLink() {
  const input = $("#generatedLinkInput");
  if (!input || !input.value) return;
  navigator.clipboard.writeText(input.value);
  toast("Copied", "Registration link copied to clipboard.");
}

function copyLinkUrl(url) {
  navigator.clipboard.writeText(url);
  toast("Copied", "Registration link copied to clipboard.");
}

async function revokeRegistrationLink(token) {
  const adminToken = sessionStorage.getItem('adminToken') || localStorage.getItem('adminToken');
  try {
    if (adminToken) {
      await fetch(`/api/admin/registration-links/${token}/revoke`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
    }
    const localLinks = JSON.parse(localStorage.getItem('registrationLinks') || "[]");
    const link = localLinks.find(l => l.token === token);
    if (link) link.active = false;
    localStorage.setItem('registrationLinks', JSON.stringify(localLinks));

    toast("Link Revoked", "The registration link has been invalidated.");
    renderActiveLinks();
  } catch (err) {
    console.error("Revoke link error:", err);
    toast("Revoke Error", "Failed to revoke registration link.");
  }
}


async function renderActiveLinks() {
  const container = $("#activeLinksContainer");
  if (!container) return;

  const adminClass = (sessionStorage.getItem('adminClass') || localStorage.getItem('adminClass') || "").trim().toLowerCase();
  let links = [];

  if (state.db) {
    try {
      let query = state.db.collection('registrationLinks').where('active', '==', true);
      if (adminClass) {
        query = query.where('class', '==', adminClass);
      }
      const snapshot = await query.get();
      snapshot.forEach(doc => links.push(doc.data()));
    } catch (err) {
      console.warn("Firestore fetch links failed, reading local:", err);
    }
  }

  if (links.length === 0) {
    const localLinks = JSON.parse(localStorage.getItem('registrationLinks') || "[]");
    const now = new Date();
    links = localLinks.filter(l => l.active && new Date(l.expiresAt) > now && (!adminClass || l.class === adminClass));
  }

  if (links.length === 0) {
    container.innerHTML = '<p style="font-size: 0.8rem; color: var(--muted);">No active self-registration links for this class.</p>';
    return;
  }

  container.innerHTML = links.map(l => {
    const shareUrl = `${window.location.origin}/self-register.html?token=${l.token}`;
    const expDate = new Date(l.expiresAt);
    const expires = expDate.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ', ' + expDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `
      <div style="background: var(--bg); border: 1px solid var(--line); padding: 8px 12px; border-radius: var(--radius-sm); margin-bottom: 8px; font-size: 0.8rem; display: flex; justify-content: space-between; align-items: center;">
        <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 65%;">
          <strong>Class ${escapeHtml(l.class.toUpperCase())}</strong> &bull; <span style="color: var(--muted)">Expires ${expires}</span><br>
          <span style="font-family: monospace; font-size: 0.75rem; color: var(--accent);">${escapeHtml(shareUrl)}</span>
        </div>
        <div style="display: flex; gap: 4px;">
          <button class="secondary-btn" onclick="copyLinkUrl('${escapeHtml(shareUrl)}')" type="button" style="padding: 2px 8px; font-size: 0.75rem;">Copy</button>
          <button class="icon-btn delete-btn" onclick="revokeRegistrationLink('${l.token}')" type="button" style="padding: 2px 8px; font-size: 0.75rem;">Revoke</button>
        </div>
      </div>
    `;
  }).join('');
}

async function renderPendingQueue() {
  const container = $("#pendingQueueContainer");
  if (!container) return;

  const adminClass = (sessionStorage.getItem('adminClass') || localStorage.getItem('adminClass') || "").trim().toLowerCase();
  const adminToken = sessionStorage.getItem('adminToken') || localStorage.getItem('adminToken');
  let pendingList = [];
  let fetchError = null;

  if (adminToken) {
    try {
      const res = await fetch(`/api/admin/pending-registrations?classCode=${adminClass}`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        pendingList = data.pending || [];
      } else if (res.status === 401) {
        fetchError = "Admin session expired or invalid. Please log in again.";
      } else {
        const errData = await res.json().catch(() => ({}));
        fetchError = errData.message || "Failed to fetch pending queue from server.";
      }
    } catch (err) {
      console.warn("Fetch pending queue proxy failed:", err);
      fetchError = "Server connection error.";
    }
  } else {
    fetchError = "Admin login required to view pending approval queue.";
  }

  // Fallback to client-side Firestore if state.db is active and adminToken is missing
  if (pendingList.length === 0 && state.db && !adminToken) {
    try {
      let query = state.db.collection('pendingRegistrations').where('status', '==', 'pending');
      if (adminClass) {
        query = query.where('class', '==', adminClass);
      }
      const snapshot = await query.get();
      snapshot.forEach(doc => pendingList.push({ docId: doc.id, ...doc.data() }));
      if (pendingList.length > 0) fetchError = null;
    } catch (dbErr) {
      console.warn("Client-side pending fetch fallback failed:", dbErr);
    }
  }

  if (fetchError && pendingList.length === 0) {
    container.innerHTML = `<div style="text-align: center; padding: 12px;"><p style="font-size: 0.8rem; color: var(--danger); margin-bottom: 6px;">⚠ ${escapeHtml(fetchError)}</p><a href="admin_login.html" class="secondary-btn" style="display: inline-block; padding: 4px 10px; font-size: 0.75rem; text-decoration: none;">Go to Admin Login</a></div>`;
    return;
  }

  if (pendingList.length === 0) {
    container.innerHTML = '<p style="font-size: 0.8rem; color: var(--muted); text-align: center; padding: 12px;">No pending self-registrations awaiting approval.</p>';
    return;
  }

  container.innerHTML = pendingList.map(p => {
    const photos = p.photos || [];
    const photoThumbs = photos.map((url, i) => `
      <img src="${url}" alt="Angle ${i+1}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px; border: 1px solid var(--line);">
    `).join('');

    return `
      <div style="background: var(--bg); border: 1px solid var(--line); padding: 12px; border-radius: var(--radius-sm);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
          <div>
            <strong style="font-size: 0.9rem; color: var(--text);">${escapeHtml(p.studentName)}</strong>
            <span style="font-size: 0.75rem; color: var(--muted); display: block;">ID: ${escapeHtml(p.rollNo || p.studentId)} | Dept: ${escapeHtml(p.dept)} | Class: ${escapeHtml((p.year || p.class || "").toUpperCase())}</span>
          </div>
          <span style="font-size: 0.7rem; color: var(--accent); background: rgba(16,172,132,0.1); padding: 2px 6px; border-radius: 4px;">Pending</span>
        </div>
        
        <div style="display: flex; gap: 6px; margin-bottom: 10px;">
          ${photoThumbs}
        </div>

        <div style="display: flex; gap: 8px;">
          <button class="primary-btn" onclick="approvePendingRegistration('${p.docId}')" type="button" style="flex: 1; padding: 4px 10px; font-size: 0.8rem;">Approve</button>
          <button class="secondary-btn" onclick="rejectPendingRegistration('${p.docId}')" type="button" style="flex: 1; padding: 4px 10px; font-size: 0.8rem; color: var(--danger); border-color: var(--danger);" onmouseover="this.style.background='rgba(224,49,49,0.1)'" onmouseout="this.style.background='transparent'">Reject</button>
        </div>
      </div>
    `;
  }).join('');
}

async function approvePendingRegistration(pendingId) {
  const adminToken = sessionStorage.getItem('adminToken') || localStorage.getItem('adminToken');
  if (!adminToken) {
    toast("Admin Session Required", "Please log in to approve registrations.");
    return;
  }

  try {
    const res = await fetch(`/api/admin/pending-registrations/${pendingId}/approve`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (res.ok && data.success) {
      toast("Registration Approved", `Facial profile activated for ${data.name || 'student'}.`);
      await syncRegistryFromCloud();
      renderPendingQueue();
    } else {
      toast("Approval Failed", data.message || "Could not approve submission.");
    }
  } catch (err) {
    console.error("Approve registration proxy error:", err);
    toast("Approval Error", "Failed to approve registration.");
  }
}

async function rejectPendingRegistration(pendingId) {
  const adminToken = sessionStorage.getItem('adminToken') || localStorage.getItem('adminToken');
  if (!adminToken) {
    toast("Admin Session Required", "Please log in to reject registrations.");
    return;
  }

  try {
    const res = await fetch(`/api/admin/pending-registrations/${pendingId}/reject`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    if (res.ok) {
      toast("Submission Rejected", "Pending self-registration deleted.");
      renderPendingQueue();
    }
  } catch (err) {
    console.error("Reject registration proxy error:", err);
    toast("Rejection Error", "Failed to reject registration.");
  }
}

// Bulk Roster Import (.xlsx / .csv)
function downloadRosterTemplate() {
  const headers = [["Name", "StudentID", "Department", "Class"]];
  const sampleData = [
    ["Sample Student 1", "25UAD901", "ADS", "d11"],
    ["Sample Student 2", "25UAD902", "ADS", "d11"]
  ];

  if (typeof XLSX !== 'undefined') {
    const ws = XLSX.utils.aoa_to_sheet([...headers, ...sampleData]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Student_Roster");
    XLSX.writeFile(wb, "Student_Roster_Template.xlsx");
    toast("Template Downloaded", "Student roster Excel template created.");
  } else {
    const csvContent = "data:text/csv;charset=utf-8," + 
      [...headers, ...sampleData].map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Student_Roster_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast("Template Downloaded", "Student roster CSV template created.");
  }
}

async function handleRosterFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;

  const errorBox = $("#bulkRosterErrorBox");
  const previewContainer = $("#bulkRosterPreviewContainer");
  const finalSummary = $("#bulkRosterFinalSummary");

  if (errorBox) errorBox.style.display = "none";
  if (previewContainer) previewContainer.style.display = "none";
  if (finalSummary) finalSummary.style.display = "none";

  const showFileError = (msg) => {
    if (errorBox) {
      errorBox.innerHTML = `<strong>⚠️ File Read Error</strong><br>${escapeHtml(msg)}`;
      errorBox.style.display = "block";
    }
    toast("File Error", msg, "danger");
  };

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      if (typeof XLSX === 'undefined') {
        showFileError("Excel parser library (SheetJS) is still loading. Please wait a moment and try again.");
        return;
      }

      const data = new Uint8Array(e.target.result);
      let workbook;
      try {
        workbook = XLSX.read(data, { type: 'array' });
      } catch (parseErr) {
        showFileError("Could not read this file — please make sure it's a valid Excel (.xlsx) or CSV file");
        return;
      }

      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) {
        showFileError("The uploaded workbook contains no sheets.");
        return;
      }

      const worksheet = workbook.Sheets[firstSheetName];
      const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });

      if (!rows || rows.length < 2) {
        showFileError("The file contains no data rows beyond headers.");
        return;
      }

      // Validate Header Row
      const headerRow = (rows[0] || []).map(h => String(h).trim().toLowerCase());

      const nameIdx = headerRow.findIndex(h => h === "name" || h === "student name");
      const studentIdIdx = headerRow.findIndex(h => h === "studentid" || h === "student id" || h === "roll no" || h === "rollno");
      const deptIdx = headerRow.findIndex(h => h === "department" || h === "dept");
      const classIdx = headerRow.findIndex(h => h === "class" || h === "year");

      if (nameIdx === -1 || studentIdIdx === -1 || deptIdx === -1 || classIdx === -1) {
        const foundHeadersStr = rows[0] && rows[0].length > 0 ? rows[0].join(", ") : "Empty Header Row";
        showFileError(`Header Validation Error:<br>Expected columns: <strong>Name, StudentID, Department, Class</strong><br>Found columns: <code>[${escapeHtml(foundHeadersStr)}]</code>`);
        return;
      }

      // Existing Roster for Duplicate Checking
      const existingList = getLocalStudentsList();
      const processedIdsInFile = new Set();

      const parsedRows = [];
      let validCount = 0;
      let skippedCount = 0;
      let missingCount = 0;
      let duplicateCount = 0;

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0 || row.every(cell => String(cell).trim() === "")) {
          continue; // Skip empty trailing rows
        }

        const name = String(row[nameIdx] || "").trim();
        const rawStudentId = String(row[studentIdIdx] || "").trim();
        const dept = String(row[deptIdx] || "").trim();
        const classCode = String(row[classIdx] || "").trim();

        // Required field validation
        if (!name || !rawStudentId || !dept || !classCode) {
          missingCount++;
          skippedCount++;
          parsedRows.push({
            rowNum: i + 1,
            name: name || "—",
            studentId: rawStudentId || "—",
            dept: dept || "—",
            classCode: classCode || "—",
            status: "skipped_missing",
            reason: "Missing required field(s)"
          });
          continue;
        }

        // Generate ID
        const cleanId = rawStudentId.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        const id = cleanId.startsWith("std-") ? cleanId : ("std-" + cleanId);

        // Check Duplicates against existing roster & current file
        const isDuplicateRoster = existingList.some(s => s.id === id || s.studentId.toLowerCase() === rawStudentId.toLowerCase());
        const isDuplicateFile = processedIdsInFile.has(id);

        if (isDuplicateRoster || isDuplicateFile) {
          duplicateCount++;
          skippedCount++;
          parsedRows.push({
            rowNum: i + 1,
            name,
            studentId: rawStudentId,
            dept,
            classCode,
            status: "skipped_duplicate",
            reason: isDuplicateRoster ? `Duplicate Student ID (${rawStudentId} exists in registry)` : `Duplicate Student ID (${rawStudentId} repeated in file)`
          });
          continue;
        }

        processedIdsInFile.add(id);
        validCount++;
        parsedRows.push({
          rowNum: i + 1,
          id,
          name,
          studentId: rawStudentId,
          dept,
          classCode,
          status: "valid",
          reason: "Ready for import"
        });
      }

      state.pendingBulkImport = {
        validRows: parsedRows.filter(r => r.status === "valid"),
        allRows: parsedRows,
        validCount,
        skippedCount,
        missingCount,
        duplicateCount
      };

      // Render Preview Table
      const summaryHeading = $("#bulkRosterSummaryHeading");
      if (summaryHeading) {
        summaryHeading.innerHTML = `<strong>${validCount} students ready to import</strong>. <span style="color: var(--muted);">${skippedCount} rows skipped (${missingCount} missing fields, ${duplicateCount} duplicates).</span>`;
      }

      const tbody = $("#bulkRosterPreviewBody");
      if (tbody) {
        tbody.innerHTML = parsedRows.map(r => {
          let badgeHtml = '';
          if (r.status === "valid") {
            badgeHtml = '<span class="badge present">Ready</span>';
          } else if (r.status === "skipped_missing") {
            badgeHtml = `<span class="badge" style="background: rgba(245,159,0,0.1); color: var(--warning);">Skipped: ${escapeHtml(r.reason)}</span>`;
          } else {
            badgeHtml = `<span class="badge absent">Skipped: ${escapeHtml(r.reason)}</span>`;
          }

          return `
            <tr style="border-bottom: 1px solid var(--line);">
              <td style="padding: 6px 8px; color: var(--muted);">${r.rowNum}</td>
              <td style="padding: 6px 8px;"><strong>${escapeHtml(r.name)}</strong></td>
              <td style="padding: 6px 8px;">${escapeHtml(r.studentId)}</td>
              <td style="padding: 6px 8px;">${escapeHtml(r.dept)}</td>
              <td style="padding: 6px 8px;">${escapeHtml(r.classCode)}</td>
              <td style="padding: 6px 8px;">${badgeHtml}</td>
            </tr>
          `;
        }).join('');
      }

      const confirmBtn = $("#confirmRosterImportBtn");
      if (confirmBtn) {
        confirmBtn.disabled = validCount === 0;
        confirmBtn.textContent = `Confirm Import (${validCount} Students)`;
      }

      if (previewContainer) previewContainer.style.display = "block";
      toast("File Parsed", `${validCount} valid students found in file.`);
    } catch (err) {
      console.error("Roster file read exception:", err);
      showFileError("Could not read this file — please make sure it's a valid Excel (.xlsx) or CSV file");
    }
  };

  reader.readAsArrayBuffer(file);
}

async function confirmRosterImport() {
  if (!state.pendingBulkImport || !state.pendingBulkImport.validRows || state.pendingBulkImport.validRows.length === 0) {
    toast("No Valid Rows", "No valid student records to import.");
    return;
  }

  const { validRows, missingCount, duplicateCount } = state.pendingBulkImport;
  const confirmBtn = $("#confirmRosterImportBtn");
  if (confirmBtn) {
    confirmBtn.disabled = true;
    confirmBtn.textContent = "Importing...";
  }

  try {
    const custom = JSON.parse(localStorage.getItem("customStudentsList") || "[]");

    for (const row of validRows) {
      const studentRecord = {
        id: row.id,
        name: row.name,
        studentId: row.studentId,
        dept: row.dept,
        year: row.classCode,
        percent: 100
      };

      // Add to customStudentsList
      custom.push(studentRecord);

      // Save to Firestore if connected (descriptor = null so "Face not registered" badge displays)
      if (state.db) {
        try {
          await state.db.collection("students").doc(row.id).set({
            id: row.id,
            name: row.name,
            studentId: row.studentId,
            dept: row.dept,
            year: row.classCode,
            descriptor: null,
            photos: []
          });
        } catch (dbErr) {
          console.warn(`Firestore save failed for ${row.id}:`, dbErr);
        }
      }
    }

    localStorage.setItem("customStudentsList", JSON.stringify(custom));

    // Show Final Summary
    const previewContainer = $("#bulkRosterPreviewContainer");
    const finalSummary = $("#bulkRosterFinalSummary");
    const summaryTitle = $("#finalSummaryTitle");
    const summaryDetails = $("#finalSummaryDetails");

    if (previewContainer) previewContainer.style.display = "none";
    if (finalSummary) {
      if (summaryTitle) {
        summaryTitle.textContent = `✅ ${validRows.length} students imported successfully. ${duplicateCount} skipped as duplicates. ${missingCount} skipped for missing data.`;
      }
      if (summaryDetails) {
        const skippedList = state.pendingBulkImport.allRows.filter(r => r.status !== "valid");
        if (skippedList.length > 0) {
          summaryDetails.innerHTML = `<strong>Skipped Rows Details:</strong><ul style="margin: 6px 0 0 16px; padding: 0;">` +
            skippedList.map(s => `<li>Row ${s.rowNum} (${escapeHtml(s.name)} - ${escapeHtml(s.studentId)}): ${escapeHtml(s.reason)}</li>`).join('') +
            `</ul>`;
        } else {
          summaryDetails.innerHTML = `All rows imported cleanly without errors.`;
        }
      }
      finalSummary.style.display = "block";
    }

    // Sync imported students via Admin Proxy API
    const adminToken = sessionStorage.getItem('adminToken') || localStorage.getItem('adminToken');
    if (adminToken) {
      const res = await fetch('/api/admin/students/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ students: validRows })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast("Database Sync Error", data.message || "Failed to save roster to cloud database.", "warning");
        if (confirmBtn) confirmBtn.disabled = false;
        return;
      }
    }

    toast("Import Complete", `${validRows.length} students added to roster.`);
    if (elements.attendanceTable) renderAttendanceTable();
    updateStats();
  } catch (err) {
    console.error("Confirm roster import error:", err);
    toast("Import Failed", "An error occurred while saving imported records.");
    if (confirmBtn) confirmBtn.disabled = false;
  }
}

// System Data Reset Helper (Preserves Geofence & Shift Configuration)
async function wipeAllStudentData() {
  // Clear targeted localStorage keys
  localStorage.removeItem("customStudentsList");
  localStorage.removeItem("studentFaceDescriptors");
  localStorage.removeItem("studentAttendanceRecords");
  localStorage.removeItem("deletedDefaultStudents");
  localStorage.removeItem("registrationLinks");
  localStorage.removeItem("matchDebugLog");

  // Clear in-memory state
  state.descriptors = {};
  state.attendance = {};
  state.matchLog = [];

  // Update UI
  if (elements.attendanceTable) renderAttendanceTable();
  if (elements.totalStudents) updateStats();
  if (window.location.pathname.includes('register.html')) {
    renderActiveLinks();
    renderPendingQueue();
  }
  toast("Data Reset", "All student profiles, attendance, and registration queues cleared.");
}

window.wipeAllStudentData = wipeAllStudentData;
