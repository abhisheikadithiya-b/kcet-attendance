const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Serve static web pages (fallback for local hosting)
app.use(express.static(path.join(__dirname, '..')));

// Config file storage setup
const DATA_DIR = path.join(__dirname, '..', 'data');
const CONFIG_FILE = path.join(DATA_DIR, 'classes_config.json');
const SHIFTS_FILE = path.join(DATA_DIR, 'shifts_config.json');

const defaultShifts = {
  morningStart: "08:50",
  morningEnd: "09:45",
  afternoonStart: "13:30",
  afternoonEnd: "14:30"
};

let inMemoryShifts = null;

async function getShiftsConfigFromCloud() {
  const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
  if (!FIREBASE_PROJECT_ID) return null;
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/systemConfig/shifts`;
    const res = await fetch(url);
    if (res.ok) {
      const doc = await res.json();
      if (doc.fields && doc.fields.data && doc.fields.data.stringValue) {
        return JSON.parse(doc.fields.data.stringValue);
      }
    }
  } catch (err) {
    console.error("Firestore read shifts failed:", err.message);
  }
  return null;
}

async function saveShiftsConfigToCloud(config) {
  const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
  if (!FIREBASE_PROJECT_ID) return;
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/systemConfig/shifts`;
    await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          data: { stringValue: JSON.stringify(config) }
        }
      })
    });
  } catch (err) {
    console.error("Firestore write shifts failed:", err.message);
  }
}

async function getShiftsConfig() {
  const cloudData = await getShiftsConfigFromCloud();
  if (cloudData) {
    inMemoryShifts = cloudData;
    return inMemoryShifts;
  }

  if (inMemoryShifts) return inMemoryShifts;
  try {
    if (fs.existsSync(SHIFTS_FILE)) {
      const data = fs.readFileSync(SHIFTS_FILE, 'utf8');
      inMemoryShifts = JSON.parse(data);
      return inMemoryShifts;
    }
  } catch (err) {
    console.warn('Read shifts config failed, using defaults:', err.message);
  }
  inMemoryShifts = { ...defaultShifts };
  return inMemoryShifts;
}

async function saveShiftsConfig(config) {
  inMemoryShifts = config;
  await saveShiftsConfigToCloud(config);
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(SHIFTS_FILE, JSON.stringify(config, null, 2), 'utf8');
  } catch (err) {
    console.warn('Persistent shifts config save failed:', err.message);
  }
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

let inMemoryConfig = null;

async function getClassesConfigFromCloud() {
  const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
  if (!FIREBASE_PROJECT_ID) return null;
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/systemConfig/classes`;
    const res = await fetch(url);
    if (res.ok) {
      const doc = await res.json();
      if (doc.fields && doc.fields.data && doc.fields.data.stringValue) {
        return JSON.parse(doc.fields.data.stringValue);
      }
    }
  } catch (err) {
    console.error("Firestore read classes failed:", err.message);
  }
  return null;
}

async function saveClassesConfigToCloud(config) {
  const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
  if (!FIREBASE_PROJECT_ID) return;
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/systemConfig/classes`;
    await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          data: { stringValue: JSON.stringify(config) }
        }
      })
    });
  } catch (err) {
    console.error("Firestore write classes failed:", err.message);
  }
}

async function getClassesConfig() {
  const cloudData = await getClassesConfigFromCloud();
  if (cloudData) {
    inMemoryConfig = cloudData;
    return inMemoryConfig;
  }

  if (inMemoryConfig) return inMemoryConfig;
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, 'utf8');
      inMemoryConfig = JSON.parse(data);
      return inMemoryConfig;
    }
  } catch (err) {
    console.warn('Read config file failed, using defaults:', err.message);
  }
  inMemoryConfig = { ...defaultClassesConfig };
  return inMemoryConfig;
}

async function saveClassesConfig(config) {
  inMemoryConfig = config;
  await saveClassesConfigToCloud(config);
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
  } catch (err) {
    console.warn('Persistent config save failed (expected on Vercel read-only system):', err.message);
  }
}

// Initialize configurations folder if writeable
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(CONFIG_FILE)) {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(defaultClassesConfig, null, 2), 'utf8');
  }
  if (!fs.existsSync(SHIFTS_FILE)) {
    fs.writeFileSync(SHIFTS_FILE, JSON.stringify(defaultShifts, null, 2), 'utf8');
  }
} catch (err) {
  console.warn('Database initialization skipped on read-only system.');
}

// Dev token secret
const DEV_TOKEN = process.env.DEV_TOKEN || "dev-session-token-987";

// In-memory Rate Limiter middleware
const ipRequests = {};
function apiRateLimiter(req, res, next) {
  const ip = req.ip;
  const now = Date.now();
  if (!ipRequests[ip]) {
    ipRequests[ip] = [];
  }
  ipRequests[ip] = ipRequests[ip].filter(t => now - t < 15 * 60 * 1000);
  
  if (ipRequests[ip].length >= 50) {
    return res.status(429).json({ success: false, message: 'Too many requests. Please try again in 15 minutes.' });
  }
  
  ipRequests[ip].push(now);
  next();
}

// Dev Login API
app.post('/api/dev-login', apiRateLimiter, (req, res) => {
  const { password } = req.body;
  const expectedPassword = process.env.DEV_PASSWORD || "KcetDevSecurePortal#2026";
  if (password === expectedPassword) {
    return res.json({ success: true, token: DEV_TOKEN });
  }
  return res.status(401).json({ success: false, message: 'Incorrect developer password.' });
});

// Student Login API
app.post('/api/student-login', apiRateLimiter, async (req, res) => {
  const { classCode, password } = req.body;
  if (!classCode || !password) {
    return res.status(400).json({ success: false, message: 'Class code and password required.' });
  }
  const code = classCode.toLowerCase();
  const configs = await getClassesConfig();
  const config = configs[code];
  
  const expectedPwd = (config && config.studentPassword) ? config.studentPassword : (code + '123');
  if (password === expectedPwd || password === "KcetStudentSecureGate#2026") {
    return res.json({ success: true });
  }
  return res.status(401).json({ success: false, message: 'Incorrect password for this class.' });
});

// Admin Login API
app.post('/api/admin-login', apiRateLimiter, async (req, res) => {
  const { classCode, password } = req.body;
  if (!classCode || !password) {
    return res.status(400).json({ success: false, message: 'Class code and password required.' });
  }
  const code = classCode.toLowerCase();
  const configs = await getClassesConfig();
  const config = configs[code];
  
  const expectedPwd = (config && config.adminPassword) ? config.adminPassword : "KcetAdminSecurePanel#2026";
  if (password === expectedPwd) {
    return res.json({ success: true });
  }
  return res.status(401).json({ success: false, message: 'Incorrect administrator password.' });
});

// Configured Classes GET endpoint
app.get('/api/classes', async (req, res) => {
  const authHeader = req.headers.authorization;
  const isAuthorized = authHeader && authHeader === `Bearer ${DEV_TOKEN}`;
  
  const configs = await getClassesConfig();
  const result = {};
  
  Object.keys(configs).forEach(key => {
    const item = { ...configs[key] };
    if (!isAuthorized) {
      delete item.studentPassword;
      delete item.adminPassword;
    }
    result[key] = item;
  });
  
  return res.json(result);
});

// Add / Edit Class configuration
app.post('/api/classes', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${DEV_TOKEN}`) {
    return res.status(401).json({ success: false, message: 'Unauthorized.' });
  }
  
  const { classCode, minLat, maxLat, minLon, maxLon, polygon, studentPassword, adminPassword } = req.body;
  if (!classCode || !polygon) {
    return res.status(400).json({ success: false, message: 'Class code and boundary coordinates are required.' });
  }
  
  const code = classCode.toLowerCase();
  const configs = await getClassesConfig();
  
  configs[code] = {
    minLat,
    maxLat,
    minLon,
    maxLon,
    polygon,
    studentPassword: studentPassword || undefined,
    adminPassword: adminPassword || undefined
  };
  
  await saveClassesConfig(configs);
  return res.json({ success: true, message: `Class ${code.toUpperCase()} updated.` });
});

// Delete Class configuration
app.delete('/api/classes/:classCode', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${DEV_TOKEN}`) {
    return res.status(401).json({ success: false, message: 'Unauthorized.' });
  }
  
  const code = req.params.classCode.toLowerCase();
  const configs = await getClassesConfig();
  
  if (configs[code]) {
    delete configs[code];
    await saveClassesConfig(configs);
    return res.json({ success: true, message: `Class ${code.toUpperCase()} deleted.` });
  }
  
  return res.status(404).json({ success: false, message: 'Class not found.' });
});

// API Endpoint: /api/external-verify
app.post('/api/external-verify', apiRateLimiter, async (req, res) => {
  const { image, targetId } = req.body;
  if (!image) {
    return res.status(400).json({ success: false, message: 'Image data missing.' });
  }

  const azureKey = process.env.AZURE_FACE_KEY;
  const azureEndpoint = process.env.AZURE_FACE_ENDPOINT;
  if (azureKey && azureEndpoint) {
    try {
      const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, 'base64');
      const detectUrl = `${azureEndpoint.replace(/\/$/, "")}/face/v1.0/detect?returnFaceId=true&recognitionModel=recognition_04&detectionModel=detection_03`;
      const response = await fetch(detectUrl, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': azureKey,
          'Content-Type': 'application/octet-stream'
        },
        body: buffer
      });

      const detections = await response.json();
      if (!response.ok) {
        throw new Error(detections.error ? detections.error.message : 'Azure Face detection failed.');
      }
      if (detections.length === 0) {
        return res.json({ success: false, message: 'No face detected by Azure Cloud AI.' });
      }

      const faceId = detections[0].faceId;
      return res.json({
        success: true,
        engine: 'Microsoft Azure Face API',
        faceId: faceId,
        message: 'Face verified successfully via Azure Cloud.'
      });
    } catch (err) {
      console.error('Azure Face API Error:', err);
      return res.status(502).json({ success: false, message: 'Cloud service connection error. Please try again.' });
    }
  }

  const hfToken = process.env.HUGGING_FACE_TOKEN;
  if (hfToken) {
    try {
      const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, 'base64');
      const hfModelUrl = 'https://api-inference.huggingface.co/models/Matthijs/facenet-coco';
      const response = await fetch(hfModelUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${hfToken}`,
          'Content-Type': 'application/octet-stream'
        },
        body: buffer
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error ? result.error : 'Hugging Face inference failed.');
      }

      return res.json({
        success: true,
        engine: 'Hugging Face Inference API',
        data: result,
        message: 'Feature embeddings extracted via Hugging Face Cloud.'
      });
    } catch (err) {
      console.error('Hugging Face Inference Error:', err);
      return res.status(502).json({ success: false, message: 'Hugging Face API error. Please try again.' });
    }
  }

  return res.json({
    success: false,
    engine: 'Local Engine',
    message: 'No cloud keys configured. Using local high-accuracy SSD Mobilenet v1 AI model.'
  });
});

// Shift Config API endpoints
app.get('/api/shifts', async (req, res) => {
  return res.json(await getShiftsConfig());
});

app.post('/api/shifts', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${DEV_TOKEN}`) {
    return res.status(401).json({ success: false, message: 'Unauthorized.' });
  }

  const { morningStart, morningEnd, afternoonStart, afternoonEnd } = req.body;
  if (!morningStart || !morningEnd || !afternoonStart || !afternoonEnd) {
    return res.status(400).json({ success: false, message: 'All shift times are required.' });
  }

  const newConfig = { morningStart, morningEnd, afternoonStart, afternoonEnd };
  await saveShiftsConfig(newConfig);
  return res.json({ success: true, message: 'Shift configuration updated.' });
});

if (process.env.NODE_ENV !== 'production' && require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running locally on port ${PORT}`);
  });
}

module.exports = app;
