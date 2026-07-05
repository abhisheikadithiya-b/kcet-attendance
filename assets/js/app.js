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
  faceModelsPath: "models",
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

const students = [
  {
    "id": "std-25uad001",
    "name": "ASHOK KUMAR A",
    "studentId": "25UAD001",
    "dept": "ADS",
    "year": "d11",
    "percent": 95
  },
  {
    "id": "std-25uad004",
    "name": "VAISHNAVI K V",
    "studentId": "25UAD004",
    "dept": "ADS",
    "year": "d11",
    "percent": 95
  },
  {
    "id": "std-25uad008",
    "name": "NISHANTH M",
    "studentId": "25UAD008",
    "dept": "ADS",
    "year": "d11",
    "percent": 95
  },
  {
    "id": "std-25uad009",
    "name": "KISHORE K",
    "studentId": "25UAD009",
    "dept": "ADS",
    "year": "d11",
    "percent": 95
  },
  {
    "id": "std-25uad015",
    "name": "DHARUN PANDI J",
    "studentId": "25UAD015",
    "dept": "ADS",
    "year": "d11",
    "percent": 95
  },
  {
    "id": "std-25uad016",
    "name": "MOHAMED SHARUK H",
    "studentId": "25UAD016",
    "dept": "ADS",
    "year": "d11",
    "percent": 95
  },
  {
    "id": "std-25uad017",
    "name": "VIJAYA VAHINI L",
    "studentId": "25UAD017",
    "dept": "ADS",
    "year": "d11",
    "percent": 95
  },
  {
    "id": "std-25uad019",
    "name": "RAGUL C",
    "studentId": "25UAD019",
    "dept": "ADS",
    "year": "d11",
    "percent": 95
  },
  {
    "id": "std-25uad020",
    "name": "ASHOKKUMAR S",
    "studentId": "25UAD020",
    "dept": "ADS",
    "year": "d11",
    "percent": 95
  },
  {
    "id": "std-25uad021",
    "name": "CHITRA J K",
    "studentId": "25UAD021",
    "dept": "ADS",
    "year": "d11",
    "percent": 95
  },
  {
    "id": "std-25uad022",
    "name": "MEENAKSHISUNDARAM S",
    "studentId": "25UAD022",
    "dept": "ADS",
    "year": "d11",
    "percent": 95
  },
  {
    "id": "std-25uad024",
    "name": "NAGANANDIKA DEVI J",
    "studentId": "25UAD024",
    "dept": "ADS",
    "year": "d11",
    "percent": 95
  },
  {
    "id": "std-25uad026",
    "name": "BENITTA YAZHINI.M",
    "studentId": "25UAD026",
    "dept": "ADS",
    "year": "d11",
    "percent": 95
  },
  {
    "id": "std-25uad029",
    "name": "NITHISWARAN M",
    "studentId": "25UAD029",
    "dept": "ADS",
    "year": "d11",
    "percent": 95
  },
  {
    "id": "std-25uad031",
    "name": "SRI AISHWARYA D",
    "studentId": "25UAD031",
    "dept": "ADS",
    "year": "d11",
    "percent": 95
  },
  {
    "id": "std-25uad032",
    "name": "ABHISHEIK ADITHIYA B",
    "studentId": "25UAD032",
    "dept": "ADS",
    "year": "d11",
    "percent": 95
  },
  {
    "id": "std-25uad034",
    "name": "MARIYA VINNARASI N",
    "studentId": "25UAD034",
    "dept": "ADS",
    "year": "d11",
    "percent": 95
  },
  {
    "id": "std-25uad037",
    "name": "BAVITHRA R",
    "studentId": "25UAD037",
    "dept": "ADS",
    "year": "d11",
    "percent": 95
  },
  {
    "id": "std-25uad039",
    "name": "NITHISHKUMAR S",
    "studentId": "25UAD039",
    "dept": "ADS",
    "year": "d11",
    "percent": 95
  },
  {
    "id": "std-25uad040",
    "name": "SATHARA KEERTHI A",
    "studentId": "25UAD040",
    "dept": "ADS",
    "year": "d11",
    "percent": 95
  },
  {
    "id": "std-25uad042",
    "name": "RAJKUMAR I",
    "studentId": "25UAD042",
    "dept": "ADS",
    "year": "d11",
    "percent": 95
  },
  {
    "id": "std-25uad043",
    "name": "SUMAN S",
    "studentId": "25UAD043",
    "dept": "ADS",
    "year": "d11",
    "percent": 95
  },
  {
    "id": "std-25uad044",
    "name": "VAISHNAVI S",
    "studentId": "25UAD044",
    "dept": "ADS",
    "year": "d11",
    "percent": 95
  },
  {
    "id": "std-25uad047",
    "name": "MARIYA DHARSHINI C",
    "studentId": "25UAD047",
    "dept": "ADS",
    "year": "d11",
    "percent": 95
  },
  {
    "id": "std-25uad049",
    "name": "SINDHUJA N",
    "studentId": "25UAD049",
    "dept": "ADS",
    "year": "d11",
    "percent": 95
  },
  {
    "id": "std-25uad051",
    "name": "ROHITH KANNA P",
    "studentId": "25UAD051",
    "dept": "ADS",
    "year": "d11",
    "percent": 95
  },
  {
    "id": "std-25uad053",
    "name": "PRIYADHARSHINI M",
    "studentId": "25UAD053",
    "dept": "ADS",
    "year": "d11",
    "percent": 95
  },
  {
    "id": "std-25uad057",
    "name": "THANGAROJA V",
    "studentId": "25UAD057",
    "dept": "ADS",
    "year": "d11",
    "percent": 95
  },
  {
    "id": "std-25uad058",
    "name": "RAGAVI R",
    "studentId": "25UAD058",
    "dept": "ADS",
    "year": "d11",
    "percent": 95
  },
  {
    "id": "std-25uad060",
    "name": "AKSHAYA G",
    "studentId": "25UAD060",
    "dept": "ADS",
    "year": "d11",
    "percent": 95
  },
  {
    "id": "std-25uad064",
    "name": "JAYASRI R",
    "studentId": "25UAD064",
    "dept": "ADS",
    "year": "d11",
    "percent": 95
  },
  {
    "id": "std-25uad066",
    "name": "SIMSON A",
    "studentId": "25UAD066",
    "dept": "ADS",
    "year": "d11",
    "percent": 95
  },
  {
    "id": "std-25uad067",
    "name": "HARIHARAN MUTHU M",
    "studentId": "25UAD067",
    "dept": "ADS",
    "year": "d11",
    "percent": 95
  },
  {
    "id": "std-25uad070",
    "name": "PADHMAVATHI P",
    "studentId": "25UAD070",
    "dept": "ADS",
    "year": "d11",
    "percent": 95
  },
  {
    "id": "std-25uad071",
    "name": "PREETHI SRI P",
    "studentId": "25UAD071",
    "dept": "ADS",
    "year": "d11",
    "percent": 95
  },
  {
    "id": "std-25uad072",
    "name": "KEERTHI NARAYANAN R",
    "studentId": "25UAD072",
    "dept": "ADS",
    "year": "d11",
    "percent": 95
  },
  {
    "id": "std-25uad073",
    "name": "MUFITHA.A",
    "studentId": "25UAD073",
    "dept": "ADS",
    "year": "d11",
    "percent": 95
  },
  {
    "id": "std-25uad078",
    "name": "MIRUTHULA A",
    "studentId": "25UAD078",
    "dept": "ADS",
    "year": "d11",
    "percent": 95
  },
  {
    "id": "std-25uad079",
    "name": "SHIVAPANDI M",
    "studentId": "25UAD079",
    "dept": "ADS",
    "year": "d11",
    "percent": 95
  },
  {
    "id": "std-25uad080",
    "name": "KAVYA K",
    "studentId": "25UAD080",
    "dept": "ADS",
    "year": "d11",
    "percent": 95
  },
  {
    "id": "std-25uad083",
    "name": "MATHIVATHANI I",
    "studentId": "25UAD083",
    "dept": "ADS",
    "year": "d11",
    "percent": 95
  },
  {
    "id": "std-25uad084",
    "name": "SHANTHINI S",
    "studentId": "25UAD084",
    "dept": "ADS",
    "year": "d11",
    "percent": 95
  },
  {
    "id": "std-25uad085",
    "name": "VIJAYADHARSHINI S",
    "studentId": "25UAD085",
    "dept": "ADS",
    "year": "d11",
    "percent": 95
  },
  {
    "id": "std-25uad087",
    "name": "AFREEN S A",
    "studentId": "25UAD087",
    "dept": "ADS",
    "year": "d11",
    "percent": 95
  },
  {
    "id": "std-25uad088",
    "name": "HARI BALAJI S",
    "studentId": "25UAD088",
    "dept": "ADS",
    "year": "d11",
    "percent": 95
  },
  {
    "id": "std-25uad089",
    "name": "GOMATHI SUBBULAKSHMI.S",
    "studentId": "25UAD089",
    "dept": "ADS",
    "year": "d11",
    "percent": 95
  },
  {
    "id": "std-25uad092",
    "name": "JAYAKUMAR S",
    "studentId": "25UAD092",
    "dept": "ADS",
    "year": "d11",
    "percent": 95
  },
  {
    "id": "std-25uad093",
    "name": "DHEEKSHA P",
    "studentId": "25UAD093",
    "dept": "ADS",
    "year": "d11",
    "percent": 95
  },
  {
    "id": "std-25uad096",
    "name": "KISHORE K",
    "studentId": "25UAD096",
    "dept": "ADS",
    "year": "d11",
    "percent": 95
  },
  {
    "id": "std-25uad099",
    "name": "THANGA SANTHIYA S R",
    "studentId": "25UAD099",
    "dept": "ADS",
    "year": "d11",
    "percent": 95
  },
  {
    "id": "std-25uad102",
    "name": "BALAGANESH D",
    "studentId": "25UAD102",
    "dept": "ADS",
    "year": "d11",
    "percent": 95
  },
  {
    "id": "std-25uad103",
    "name": "RUTHRAVEL S",
    "studentId": "25UAD103",
    "dept": "ADS",
    "year": "d11",
    "percent": 95
  },
  {
    "id": "std-25uad106",
    "name": "NITHYA SRI.S",
    "studentId": "25UAD106",
    "dept": "ADS",
    "year": "d11",
    "percent": 95
  },
  {
    "id": "std-25uad108",
    "name": "ANBUMANI S A",
    "studentId": "25UAD108",
    "dept": "ADS",
    "year": "d11",
    "percent": 95
  },
  {
    "id": "std-25uad109",
    "name": "VEERA LAKSHMI B",
    "studentId": "25UAD109",
    "dept": "ADS",
    "year": "d11",
    "percent": 95
  },
  {
    "id": "std-25uad111",
    "name": "SATTHI DEV M",
    "studentId": "25UAD111",
    "dept": "ADS",
    "year": "d11",
    "percent": 95
  },
  {
    "id": "std-25uad113",
    "name": "HEMA SREE K",
    "studentId": "25UAD113",
    "dept": "ADS",
    "year": "d11",
    "percent": 95
  },
  {
    "id": "std-25uad116",
    "name": "PRAJAPATHI.C.M",
    "studentId": "25UAD116",
    "dept": "ADS",
    "year": "d11",
    "percent": 95
  },
  {
    "id": "std-25uad119",
    "name": "KANISHKRAJADURAI J",
    "studentId": "25UAD119",
    "dept": "ADS",
    "year": "d11",
    "percent": 95
  },
  {
    "id": "std-25uad002",
    "name": "BAHIRATHAN JAYAKUMAR S",
    "studentId": "25UAD002",
    "dept": "ADS",
    "year": "d12",
    "percent": 95
  },
  {
    "id": "std-25uad003",
    "name": "ROHITH D R",
    "studentId": "25UAD003",
    "dept": "ADS",
    "year": "d12",
    "percent": 95
  },
  {
    "id": "std-25uad005",
    "name": "LATHIKA SHRI S",
    "studentId": "25UAD005",
    "dept": "ADS",
    "year": "d12",
    "percent": 95
  },
  {
    "id": "std-25uad006",
    "name": "THANGARAJ S",
    "studentId": "25UAD006",
    "dept": "ADS",
    "year": "d12",
    "percent": 95
  },
  {
    "id": "std-25uad007",
    "name": "ASHIKA P",
    "studentId": "25UAD007",
    "dept": "ADS",
    "year": "d12",
    "percent": 95
  },
  {
    "id": "std-25uad010",
    "name": "RAJALAKSHMI R",
    "studentId": "25UAD010",
    "dept": "ADS",
    "year": "d12",
    "percent": 95
  },
  {
    "id": "std-25uad011",
    "name": "DIVYA M",
    "studentId": "25UAD011",
    "dept": "ADS",
    "year": "d12",
    "percent": 95
  },
  {
    "id": "std-25uad012",
    "name": "LOGA SOWMIYA S",
    "studentId": "25UAD012",
    "dept": "ADS",
    "year": "d12",
    "percent": 95
  },
  {
    "id": "std-25uad013",
    "name": "DHANA VARSHINI S",
    "studentId": "25UAD013",
    "dept": "ADS",
    "year": "d12",
    "percent": 95
  },
  {
    "id": "std-25uad014",
    "name": "YOGA DHARSHINI G.S",
    "studentId": "25UAD014",
    "dept": "ADS",
    "year": "d12",
    "percent": 95
  },
  {
    "id": "std-25uad018",
    "name": "RAGHAVAKRISHNAN R",
    "studentId": "25UAD018",
    "dept": "ADS",
    "year": "d12",
    "percent": 95
  },
  {
    "id": "std-25uad023",
    "name": "JASMITTA C",
    "studentId": "25UAD023",
    "dept": "ADS",
    "year": "d12",
    "percent": 95
  },
  {
    "id": "std-25uad025",
    "name": "POOJA SRI S",
    "studentId": "25UAD025",
    "dept": "ADS",
    "year": "d12",
    "percent": 95
  },
  {
    "id": "std-25uad027",
    "name": "AKILAN M",
    "studentId": "25UAD027",
    "dept": "ADS",
    "year": "d12",
    "percent": 95
  },
  {
    "id": "std-25uad028",
    "name": "ASHIK MOHAMED N",
    "studentId": "25UAD028",
    "dept": "ADS",
    "year": "d12",
    "percent": 95
  },
  {
    "id": "std-25uad030",
    "name": "SABARIAYYAN P",
    "studentId": "25UAD030",
    "dept": "ADS",
    "year": "d12",
    "percent": 95
  },
  {
    "id": "std-25uad033",
    "name": "MADHANKUMAR S",
    "studentId": "25UAD033",
    "dept": "ADS",
    "year": "d12",
    "percent": 95
  },
  {
    "id": "std-25uad035",
    "name": "PRANESH MANICKAM V",
    "studentId": "25UAD035",
    "dept": "ADS",
    "year": "d12",
    "percent": 95
  },
  {
    "id": "std-25uad036",
    "name": "PRAVEEN M",
    "studentId": "25UAD036",
    "dept": "ADS",
    "year": "d12",
    "percent": 95
  },
  {
    "id": "std-25uad038",
    "name": "SRIHEMAVATHI S",
    "studentId": "25UAD038",
    "dept": "ADS",
    "year": "d12",
    "percent": 95
  },
  {
    "id": "std-25uad041",
    "name": "DHARSHAN M",
    "studentId": "25UAD041",
    "dept": "ADS",
    "year": "d12",
    "percent": 95
  },
  {
    "id": "std-25uad045",
    "name": "SAKTHESWARAN M",
    "studentId": "25UAD045",
    "dept": "ADS",
    "year": "d12",
    "percent": 95
  },
  {
    "id": "std-25uad046",
    "name": "ARCHANA M",
    "studentId": "25UAD046",
    "dept": "ADS",
    "year": "d12",
    "percent": 95
  },
  {
    "id": "std-25uad048",
    "name": "SAHANA.S",
    "studentId": "25UAD048",
    "dept": "ADS",
    "year": "d12",
    "percent": 95
  },
  {
    "id": "std-25uad050",
    "name": "VISHALINI J P",
    "studentId": "25UAD050",
    "dept": "ADS",
    "year": "d12",
    "percent": 95
  },
  {
    "id": "std-25uad052",
    "name": "SRI NARAYANI B",
    "studentId": "25UAD052",
    "dept": "ADS",
    "year": "d12",
    "percent": 95
  },
  {
    "id": "std-25uad054",
    "name": "MADHUMITHA S",
    "studentId": "25UAD054",
    "dept": "ADS",
    "year": "d12",
    "percent": 95
  },
  {
    "id": "std-25uad055",
    "name": "VETHIKA L",
    "studentId": "25UAD055",
    "dept": "ADS",
    "year": "d12",
    "percent": 95
  },
  {
    "id": "std-25uad056",
    "name": "RAJALAKSHMI R",
    "studentId": "25UAD056",
    "dept": "ADS",
    "year": "d12",
    "percent": 95
  },
  {
    "id": "std-25uad059",
    "name": "DEEPANKUMAR S",
    "studentId": "25UAD059",
    "dept": "ADS",
    "year": "d12",
    "percent": 95
  },
  {
    "id": "std-25uad061",
    "name": "NIVETHITHA S",
    "studentId": "25UAD061",
    "dept": "ADS",
    "year": "d12",
    "percent": 95
  },
  {
    "id": "std-25uad062",
    "name": "SANJAI K",
    "studentId": "25UAD062",
    "dept": "ADS",
    "year": "d12",
    "percent": 95
  },
  {
    "id": "std-25uad063",
    "name": "HARINI S",
    "studentId": "25UAD063",
    "dept": "ADS",
    "year": "d12",
    "percent": 95
  },
  {
    "id": "std-25uad065",
    "name": "MOHAMMED YASIR A",
    "studentId": "25UAD065",
    "dept": "ADS",
    "year": "d12",
    "percent": 95
  },
  {
    "id": "std-25uad068",
    "name": "PAVITHRA B",
    "studentId": "25UAD068",
    "dept": "ADS",
    "year": "d12",
    "percent": 95
  },
  {
    "id": "std-25uad069",
    "name": "SHALINI S",
    "studentId": "25UAD069",
    "dept": "ADS",
    "year": "d12",
    "percent": 95
  },
  {
    "id": "std-25uad074",
    "name": "KARTHIKEYA Y",
    "studentId": "25UAD074",
    "dept": "ADS",
    "year": "d12",
    "percent": 95
  },
  {
    "id": "std-25uad075",
    "name": "MUKESH PRASANNA.M",
    "studentId": "25UAD075",
    "dept": "ADS",
    "year": "d12",
    "percent": 95
  },
  {
    "id": "std-25uad076",
    "name": "THATCHINA MOORTHY.T",
    "studentId": "25UAD076",
    "dept": "ADS",
    "year": "d12",
    "percent": 95
  },
  {
    "id": "std-25uad077",
    "name": "HAJMATHUL HASHINA.A",
    "studentId": "25UAD077",
    "dept": "ADS",
    "year": "d12",
    "percent": 95
  },
  {
    "id": "std-25uad081",
    "name": "KIRUTHIGA P",
    "studentId": "25UAD081",
    "dept": "ADS",
    "year": "d12",
    "percent": 95
  },
  {
    "id": "std-25uad082",
    "name": "RESHMA S",
    "studentId": "25UAD082",
    "dept": "ADS",
    "year": "d12",
    "percent": 95
  },
  {
    "id": "std-25uad086",
    "name": "VAIRAMUTHU P",
    "studentId": "25UAD086",
    "dept": "ADS",
    "year": "d12",
    "percent": 95
  },
  {
    "id": "std-25uad090",
    "name": "NARAYANASAMY P",
    "studentId": "25UAD090",
    "dept": "ADS",
    "year": "d12",
    "percent": 95
  },
  {
    "id": "std-25uad091",
    "name": "ROHINI.T",
    "studentId": "25UAD091",
    "dept": "ADS",
    "year": "d12",
    "percent": 95
  },
  {
    "id": "std-25uad094",
    "name": "ABITHRA P",
    "studentId": "25UAD094",
    "dept": "ADS",
    "year": "d12",
    "percent": 95
  },
  {
    "id": "std-25uad095",
    "name": "SURYAPRAKASH S",
    "studentId": "25UAD095",
    "dept": "ADS",
    "year": "d12",
    "percent": 95
  },
  {
    "id": "std-25uad097",
    "name": "PRAVEEN.K",
    "studentId": "25UAD097",
    "dept": "ADS",
    "year": "d12",
    "percent": 95
  },
  {
    "id": "std-25uad098",
    "name": "RAKSHANA.S",
    "studentId": "25UAD098",
    "dept": "ADS",
    "year": "d12",
    "percent": 95
  },
  {
    "id": "std-25uad100",
    "name": "MONISHA M",
    "studentId": "25UAD100",
    "dept": "ADS",
    "year": "d12",
    "percent": 95
  },
  {
    "id": "std-25uad104",
    "name": "PONANANTHAN M",
    "studentId": "25UAD104",
    "dept": "ADS",
    "year": "d12",
    "percent": 95
  },
  {
    "id": "std-25uad105",
    "name": "MANASHA.M",
    "studentId": "25UAD105",
    "dept": "ADS",
    "year": "d12",
    "percent": 95
  },
  {
    "id": "std-25uad107",
    "name": "HARIS M",
    "studentId": "25UAD107",
    "dept": "ADS",
    "year": "d12",
    "percent": 95
  },
  {
    "id": "std-25uad110",
    "name": "SUMAIYAH M",
    "studentId": "25UAD110",
    "dept": "ADS",
    "year": "d12",
    "percent": 95
  },
  {
    "id": "std-25uad112",
    "name": "JEFFERSON J",
    "studentId": "25UAD112",
    "dept": "ADS",
    "year": "d12",
    "percent": 95
  },
  {
    "id": "std-25uad114",
    "name": "RAKAVI K",
    "studentId": "25UAD114",
    "dept": "ADS",
    "year": "d12",
    "percent": 95
  },
  {
    "id": "std-25uad115",
    "name": "HAASHINI A",
    "studentId": "25UAD115",
    "dept": "ADS",
    "year": "d12",
    "percent": 95
  },
  {
    "id": "std-25uad117",
    "name": "YOGESHWARI S",
    "studentId": "25UAD117",
    "dept": "ADS",
    "year": "d12",
    "percent": 95
  },
  {
    "id": "std-25uad120",
    "name": "HARSHINI C",
    "studentId": "25UAD120",
    "dept": "ADS",
    "year": "d12",
    "percent": 95
  }
];

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
  shiftConfig: null
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
  initFirebase();
  initMap();
  hydrateDescriptors();
  bindEvents();
  if (elements.attendanceTable) renderAttendanceTable();
  if (elements.totalStudents) updateStats();
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
    toast("Firebase connected", "Student attendance will sync with Firestore.");
  } catch (error) {
    toast("Firebase skipped", "Offline local storage mode enabled.");
  }
}

function initMap() {
  if (!$("#mapView") || !window.L) return;
  const config = getActiveConfiguration();
  const centerLat = (config.minLat + config.maxLat) / 2;
  const centerLon = (config.minLon + config.maxLon) / 2;
  
  state.map = L.map('mapView', { maxZoom: 20, zoomControl: false }).setView([centerLat, centerLon], 19);
  
  const isDark = document.body.classList.contains("dark-mode");
  const tileUrl = isDark 
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' 
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
    
  state.tileLayer = L.tileLayer(tileUrl, {
      maxZoom: 20,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  }).addTo(state.map);
  
  drawBoundaryOnMap();
}

function drawBoundaryOnMap() {
  if (!state.map) return;
  if (state.campusBoundaryLayer) state.map.removeLayer(state.campusBoundaryLayer);
  
  const config = getActiveConfiguration();
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

function verifyLocation() {
  if (!navigator.geolocation) {
    setCampusStatus(false, null, null, null, "Geolocation is not supported by your browser.");
    return;
  }

  elements.campusStatus.textContent = "Verifying GPS...";
  elements.gpsIndicator.style.background = "var(--warning)";

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      const config = getActiveConfiguration();
      const centerLat = (config.minLat + config.maxLat) / 2;
      const centerLon = (config.minLon + config.maxLon) / 2;
      const distance = getDistanceMeters(latitude, longitude, centerLat, centerLon);
      
      // Proximity buffer: Mark student inside if within polygon bounds OR within 30 meters of center
      const inside = config.polygon 
        ? (isPointInPolygon(latitude, longitude, config.polygon) || distance <= 30)
        : (latitude >= config.minLat && latitude <= config.maxLat && longitude >= config.minLon && longitude <= config.maxLon || distance <= 30);
      
      setCampusStatus(inside, latitude, longitude, distance);
      
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
    },
    () => setCampusStatus(false, null, null, null, "GPS access denied. Please enable location privileges."),
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );
}

function simulateLocation() {
  const config = getActiveConfiguration();
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
  const options = new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 });

  state.detectionTimer = setInterval(async () => {
    if (!state.cameraActive) return;

    resizeCanvas();

    // 1. Process main check-in screen
    if (elements.video && !elements.video.paused && !elements.video.ended) {
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
  }, 1800);
}

function drawFaceBox(ctx, box) {
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.strokeRect(box.x, box.y, box.width, box.height);
}

function matchStudent(descriptor) {
  const entries = Object.entries(state.descriptors);
  if (!entries.length) return null;

  let best = { id: null, distance: Infinity };
  entries.forEach(([id, savedDescriptor]) => {
    const distance = faceapi.euclideanDistance(descriptor, new Float32Array(savedDescriptor));
    if (distance < best.distance) best = { id, distance };
  });

  if (best.distance < 0.52) {
    const list = getLocalStudentsList();
    return list.find((s) => s.id === best.id);
  }
  return null;
}

function getLocalStudentsList() {
  const custom = JSON.parse(localStorage.getItem("customStudentsList") || "[]");
  const deletedIds = JSON.parse(localStorage.getItem("deletedDefaultStudents") || "[]");
  const activeDefaults = students.filter(s => !deletedIds.includes(s.id));
  return [...activeDefaults, ...custom];
}

async function markAttendance(student) {
  if (!state.insideCampus) {
    toast("GPS Required", "You must verify your location coordinates first.");
    return;
  }

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

  if (state.db) {
    await state.db.collection("studentAttendance").doc(dateKey).collection("students").doc(student.id).set(record);
  }

  elements.recognizedName.textContent = student.name;
  elements.recognizedTime.textContent = new Date(activeShift === "morning" ? record.morningTimestamp : record.afternoonTimestamp).toLocaleTimeString();
  renderAttendanceTable();
  updateStats();
  setScanStatus("Attendance Marked", `Check-in recorded for ${student.name} (${activeShift} shift).`);
  playSuccessTone();
  showModal("Check-In Complete", `Attendance logged successfully for ${student.name} (${student.studentId}) on the ${activeShift} shift.`);
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

function renderAttendanceTable() {
  if (!elements.attendanceTable) return;
  const search = elements.searchInput ? elements.searchInput.value.trim().toLowerCase() : "";
  const dateKey = elements.dateFilter ? elements.dateFilter.value || getDateKey() : getDateKey();
  const dayRecords = state.attendance[dateKey] || {};
  const list = getLocalStudentsList();
  
  const isAdminPage = window.location.pathname.includes('register.html');
  const activeClass = (isAdminPage 
    ? sessionStorage.getItem('adminClass') 
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
    const morningClass = morningStatus.toLowerCase();
    
    // Afternoon shift checking (Defaults to Present if morning checked in, or if afternoon checked in)
    let afternoonStatus = "Absent";
    if (morningStatus === "Present") {
      afternoonStatus = record.afternoon || "Present";
    } else if (record.afternoonTimestamp) {
      afternoonStatus = record.afternoon || "Present";
    }
    const afternoonClass = afternoonStatus.toLowerCase();
    
    const timestamp = record.morningTimestamp ? new Date(record.morningTimestamp).toLocaleString() : "Awaiting check-in";
    
    let rowHtml = `
      <tr>
        <td>
          <div class="person-cell">
            <span class="avatar">${getInitials(student.name)}</span>
            <strong>${escapeHtml(student.name)}</strong>
          </div>
        </td>
        <td>${escapeHtml(student.studentId)}</td>
        <td>${escapeHtml(student.dept)}</td>
        <td>${escapeHtml(student.year)}</td>
        <td><span class="badge ${morningClass}">${morningStatus}</span></td>
    `;
    
    if (isAdminPage) {
      const isMorningAbsent = (morningStatus === "Absent");
      const hasAfternoonCheckIn = !!record.afternoonTimestamp;
      const canToggle = !isMorningAbsent || hasAfternoonCheckIn;
      rowHtml += `
        <td>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="badge ${afternoonClass}">${afternoonStatus}</span>
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
            <button class="icon-btn edit-btn" onclick="editStudent('${student.id}')" type="button">Edit</button>
            <button class="icon-btn delete-btn" onclick="deleteStudent('${student.id}')" type="button">Delete</button>
          </div>
        </td>
      `;
    } else {
      rowHtml += `
        <td><span class="badge ${afternoonClass}">${afternoonStatus}</span></td>
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
    ? sessionStorage.getItem('adminClass') 
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

  const canvas = document.createElement("canvas");
  canvas.width = regVideo.videoWidth || 640;
  canvas.height = regVideo.videoHeight || 480;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(regVideo, 0, 0, canvas.width, canvas.height);
  const snapshot = canvas.toDataURL("image/jpeg");

  state.captureAngles = Math.min(state.captureAngles + 1, 3);
  
  if (!state.capturedSnapshots) state.capturedSnapshots = [];
  state.capturedSnapshots[state.captureAngles - 1] = snapshot;

  const slot = $(`#thumbSlot${state.captureAngles}`);
  if (slot) {
    slot.innerHTML = `
      <span class="thumb-label">Angle ${state.captureAngles}</span>
      <img src="${snapshot}" alt="Angle ${state.captureAngles}">
    `;
  }

  elements.captureCount.textContent = state.captureAngles;
  $$(".capture-guide li").forEach((item, index) => item.classList.toggle("active", index === state.captureAngles));
  toast("Capture Successful", `Angle ${state.captureAngles} of 3 recorded.`);

  if (state.captureAngles === 3) {
    $("#captureFaceBtn").classList.add("hidden");
    $("#approvalControls").classList.remove("hidden");
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
  elements.captureCount.textContent = "0";
  
  for (let i = 1; i <= 3; i++) {
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
  if (state.faceModelsReady && state.cameraActive && regVideo && state.captureAngles === 3) {
    const detection = await faceapi
      .detectSingleFace(regVideo, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
      .withFaceLandmarks()
      .withFaceDescriptor();
    if (detection) {
      state.descriptors[id] = Array.from(detection.descriptor);
    }
  } else if (!state.descriptors[id]) {
    state.descriptors[id] = createSampleDescriptor(id);
  }

  localStorage.setItem("studentFaceDescriptors", JSON.stringify(state.descriptors));
  
  resetRegistrationForm();
  renderAttendanceTable();
  updateStats();
  showModal(state.editMode ? "Details Updated" : "Registration Complete", `Database record processed for ${name}.`);
}

function createSampleDescriptor(seed) {
  return Array.from({ length: 128 }, (_, index) => {
    const code = seed.charCodeAt(index % seed.length) || 1;
    return ((code * (index + 3)) % 100) / 100;
  });
}

function hydrateDescriptors() {
  const list = getLocalStudentsList();
  list.forEach((student) => {
    if (!state.descriptors[student.id]) state.descriptors[student.id] = createSampleDescriptor(student.id);
  });
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
  const adminClass = (sessionStorage.getItem('adminClass') || "").trim().toLowerCase();
  
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
  
  const adminClass = (sessionStorage.getItem('adminClass') || "").trim().toLowerCase();
  
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
  
  const adminClass = (sessionStorage.getItem('adminClass') || "").trim().toLowerCase();
  
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

function getActiveConfiguration() {
  const configs = getClassesConfig();
  const isAdminPage = window.location.pathname.includes('register.html');
  const activeClass = (isAdminPage 
    ? sessionStorage.getItem('adminClass') 
    : sessionStorage.getItem('studentClass')) || "d11";
  const cleaned = activeClass.trim().toLowerCase();
  return configs[cleaned] || configs['d11'] || defaultClassesConfig['d11'];
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
