"use client";

import jsPDF from "jspdf";

import { useState } from "react";

import Tesseract from "tesseract.js";

export default function Home() {
  const [credits, setCredits] = useState("");
  const [grade, setGrade] = useState("A+");
  const [subjects, setSubjects] = useState<any[]>([]);
  const [sgpa, setSgpa] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [message, setMessage] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState("");
  const [activeTab, setActiveTab] = useState("upload");
  const [loading, setLoading] = useState(false);
  const [subjectsFound, setSubjectsFound] = useState(0);
  const [extractedSubjects, setExtractedSubjects] = useState<any[]>([]);
  const [parsedSubjects, setParsedSubjects] = useState<any[]>([]);
  const [ocrSgpa, setOcrSgpa] = useState(0);

  const [studentName, setStudentName] = useState("");
  const [hallTicket, setHallTicket] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [fileInputKey, setFileInputKey] = useState(0);
  const [fileName, setFileName] = useState("");

  const resetAll = () => {
  setFileInputKey(prev => prev + 1);
  setFileName("");
  setCredits("");
  setGrade("A+");

  setSubjects([]);
  setSgpa(0);
  setShowResult(false);
  setMessage("");

  setImage(null);
  setOcrText("");

  setLoading(false);
  setSubjectsFound(0);

  setExtractedSubjects([]);
  setParsedSubjects([]);

  setOcrSgpa(0);

  setStudentName("");
  setHallTicket("");
  setFatherName("");
};


  const gradeMap: { [key: string]: number } = {
    O: 10,
    "A+": 9,
    A: 8,
    "B+": 7,
    B: 6,
    C: 5,
    F: 0,
  };

  const addSubject = () => {
     if (!credits || Number(credits) <= 0) {
  alert("Please enter valid credits");
  return;
}

    const newSubject = {
      credits: Number(credits),
      grade: grade,
      gradePoint: gradeMap[grade],
    };

    setSubjects([...subjects, newSubject]);

    setCredits("");
    setGrade("A+");
  };

  const deleteSubject = (indexToDelete: number) => {
    const updatedSubjects = subjects.filter(
      (_, index) => index !== indexToDelete
    );

    setSubjects(updatedSubjects);
  };

  const clearAllSubjects = () => {
  setSubjects([]);
  setSgpa(0);
  setMessage("");
  setShowResult(false);
};

  const calculateSGPA = () => {
    for (let i = 0; i < subjects.length; i++) {
      if (subjects[i].grade === "F") {
        setMessage("❌ Backlog Detected. SGPA Cannot Be Calculated.");
        setSgpa(0);
        return;
      }
    }

    let totalPoints = 0;
    let totalCredits = 0;

    for (let i = 0; i < subjects.length; i++) {
      totalPoints +=
        subjects[i].credits * subjects[i].gradePoint;

      totalCredits += subjects[i].credits;
    }

    const answer = totalPoints / totalCredits;

    setMessage("");
    setSgpa(answer);
    setShowResult(true);
  };

  const extractStudentDetails = (text: string) => {
const htnoMatch = text.match(/23[A-Z0-9]+/);

if (htnoMatch) {
setHallTicket(htnoMatch[0]);
}

const nameMatch = text.match(
/NAME:\s*['"]?([A-Z ]+)/i
);

if (nameMatch) {
setStudentName(nameMatch[1].trim());
}

 const fatherMatch = text.match(
/FATHER NAME:\s*([A-Z ]+)/i
);

if (fatherMatch) {

let father =
fatherMatch[1].trim();

father = father.replace(
"COLLEGE CODE",
""
).trim();

setFatherName(father);

}};


  const extractSubjects = (text: string) => {
  const lines = text.split("\n");

  const subjects = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

   if (
  /^[0-9]{3}/.test(line)
) {

  let fullRow = line;

  if (i > 0) {

  let prevLine = "";

  for (
    let j = i - 1;
    j >= 0;
    j--
  ) {

    if (
      lines[j].trim() !== ""
    ) {

      prevLine =
        lines[j].trim();

      break;
    }
  }

   if (
  prevLine &&
  !/^[0-9]{3}/.test(prevLine) &&
  !prevLine.toUpperCase().includes("SUBJECT CODE") &&
  line.split(" ").length < 8
) {

    const code =
      line.split(" ")[0];

    const rest =
      line.substring(
        code.length
      ).trim();

    fullRow =
      code +
      " " +
      prevLine +
      " " +
      rest;
  }
}
  
  subjects.push({
    row: fullRow,
  });
}}

  setExtractedSubjects(subjects);
  parseSubjects(subjects);
};

const parseSubjects = (subjects: any[]) => {
  const parsed = [];

  for (let i = 0; i < subjects.length; i++) {
    const row = subjects[i].row;

    const parts = row.split(" ");

     const credits = parts[parts.length - 1];

const validGrades = [
"O",
"A+",
"A",
"B+",
"B",
"C",
"F",
];

let grade = "";

 for (let j = 0; j < parts.length; j++) {

let word =
parts[j].toUpperCase();

if (word === "BE") {
  word = "B+";
}

if (word === "BT") {
  word = "B+";
}

if (word === "8+") {
  word = "B+";
}

if (word === "AX") {
  word = "A+";
}

if (word === "AX+") {
  word = "A+";
}

if (word === "0") {
  word = "O";
}

if (word === "°") {
  word = "O";
}

if (
  validGrades.includes(word)
) {
  grade = word;
}
}

const subjectName = parts.slice(1, parts.length - 5).join(" ");
if (
  row.toUpperCase().includes("SUBJECT CODE")
) {
  continue;
}
    parsed.push({
      subject: subjectName,
      grade: grade,
      credits: credits,
    });
  }

  setParsedSubjects(parsed);

  console.log(parsed);
  calculateOCRSGPA(parsed);
   
};

const calculateOCRSGPA = (subjects: any[]) => {
const gradeMap: { [key: string]: number } = {
O: 10,
"A+": 9,
A: 8,
"B+": 7,
B: 6,
C: 5,
F: 0,
};

let totalPoints = 0;
let totalCredits = 0;

for (let i = 0; i < subjects.length; i++) {
let grade = subjects[i].grade?.toUpperCase().trim();
if (grade === "0") {
  grade = "O";
}
let credit = Number(subjects[i].credits);
if (!gradeMap.hasOwnProperty(grade)) {
  continue;
}

totalPoints += credit * gradeMap[grade];
totalCredits += credit;

}

if (totalCredits === 0) {
setOcrSgpa(0);
return;
}

const sgpa = totalPoints / totalCredits;

setOcrSgpa(sgpa);
};

  const runOCR = async (imageUrl: string) => {
  setLoading(true);

  const result = await Tesseract.recognize(
    imageUrl,
    "eng"
  );

  setOcrText(result.data.text);

  extractStudentDetails(
  result.data.text
);

extractSubjects(result.data.text);

const text = result.data.text;

const matches =
  text.match(/A\+|A|B\+|B|C|O|F/g);

setSubjectsFound(
  matches ? matches.length : 0
);

  setLoading(false);
};

 const downloadPDF = () => {
  const doc = new jsPDF();
   doc.setFillColor(
  244,
  248,
  255
);

doc.rect(
  0,
  0,
  210,
  297,
  "F"
);

doc.setFillColor(30, 58, 138);

doc.rect(
  0,
  0,
  210,
  25,
  "F"
);

doc.setTextColor(
  255,
  255,
  255
);

doc.setFontSize(20);

doc.text(
  "RESULT REPORT",
  105,
  16,
  { align: "center" }
);

doc.setTextColor(
  0,
  0,
  0
);

  doc.setFontSize(12);

  doc.setDrawColor(
  200,
  200,
  200
);

doc.roundedRect(
  15,
  35,
  180,
  40,
  3,
  3
);

doc.setFontSize(14);

doc.text(
  "STUDENT DETAILS :",
  20,
  45
);

doc.setFontSize(11);

doc.text(
  `Name: ${studentName}`,
  20,
  55
);

doc.text(
  `HTNO: ${hallTicket}`,
  20,
  63
);

doc.text(
  `Father: ${fatherName}`,
  20,
  71
);

doc.setFontSize(15);

const tableHeight =
  parsedSubjects.length * 8 + 20;
   
  doc.setDrawColor(
  200,
  200,
  200
);

doc.roundedRect(
  15,
  100,
  180,
  tableHeight,
  3,
  3
);

doc.text(
  "SUBJECT DETAILS :",
  20,
  95
);

 

doc.setFillColor(
  37,
  99,
  235
);

doc.rect(
  15,
  102,
  180,
  10,
  "F"
);

 
doc.setTextColor(
  255,
  255,
  255
);

doc.setFontSize(11);
doc.text(
  "Subject",
  20,
  109
);

doc.text(
  "Grade",
  145,
  109
);

doc.text(
  "Credits",
  170,
  109
);

doc.setTextColor(
  0,
  0,
  0
);

 let y = 120;

doc.setFontSize(10);

for (let i = 0; i < parsedSubjects.length; i++) {

  doc.text(
    parsedSubjects[i].subject,
    20,
    y
  );

  doc.text(
    parsedSubjects[i].grade,
    145,
    y
  );

  doc.text(
    String(parsedSubjects[i].credits),
    170,
    y
  );

  y += 8;
}

doc.setFillColor(
  22,
  163,
  74
);

doc.roundedRect(
  50,
  y + 10,
  110,
  25,
  3,
  3,
  "F"
);

doc.setTextColor(
  255,
  255,
  255
);

doc.setFontSize(12);

doc.text(
  "FINAL SGPA :",
  105,
  y + 20,
  { align: "center" }
);
 
doc.setFontSize(18);

doc.text(
  ocrSgpa?.toFixed(2),
  105,
  y + 30,
  { align: "center" }
);

const now = new Date();

const generatedDate =
  now.toLocaleDateString() +
  " " +
  now.toLocaleTimeString();

  doc.setFontSize(9);

doc.setTextColor(
  100,
  100,
  100
);

doc.text(
  `Generated on: ${generatedDate}`,
  105,
  y + 50,
  { align: "center" }
);

doc.setDrawColor(
  200,
  200,
  200
);

doc.line(
  30,
  y + 58,
  180,
  y + 58
);

doc.setFontSize(10);

doc.text(
  "Generated by SGPA Calculator",
  105,
  y + 66,
  { align: "center" }
);

doc.setFontSize(7);

{/*doc.text(
  "VS in pdf footer",
  105,
  y + 74,
  { align: "center" }
);*/}

doc.setTextColor(
  0,
  0,
  0
);

  {/*doc.text(
    `SGPA: ${ocrSgpa?.toFixed(2)}`,
    20,
    80
  );*/}

  doc.save("SGPA_Report.pdf");
};

  return (
    <main
       style={{
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  minHeight: "100vh",
  padding: "4px",
  gap: "20px",
   backgroundColor: "#0f172a",
  color: "white",
}}
    >
      <div
  style={{
    backgroundColor: "#1e293b",
    padding: "4px",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "700px",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  }}
>

       <h1
  style={{
    textAlign: "center",
    fontSize: "32px",
    fontWeight: "bold",
    marginBottom: "5px",
  }}
>
  float SGPA = ❔ ;
</h1>

<p
  style={{
    textAlign: "center",
    color: "#94a3b8",
    marginTop: "0",
    marginBottom: "20px",
  }}
>
  The smartest way to COMPUTE your semester SGPA.
</p>

<div
  style={{
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
  }}
>
  <button
    onClick={() => setActiveTab("upload")}
    style={{
      flex: 1,
      backgroundColor:
        activeTab === "upload"
          ? "#2563eb"
          : "#475569",
      color: "white",
      border: "none",
      padding: "10px",
      borderRadius: "8px",
      cursor: "pointer",
      transition: "0.2s",
    }}
  >
    Upload Image Mode
  </button>

  <button
    onClick={() => setActiveTab("manual")}
    style={{
      flex: 1,
      backgroundColor:
        activeTab === "manual"
          ? "#2563eb"
          : "#475569",
      color: "white",
      border: "none",
      padding: "10px",
      borderRadius: "8px",
      cursor: "pointer",
      transition: "0.2s",
    }}
  >
    Manual Entry mode
  </button>
</div>

{activeTab === "upload" && (
  <>
  <h3>📤 Upload Image Mode: </h3>

    <input
  key={fileInputKey}
  id="file-upload"
  type="file"
  accept="image/*,.pdf"
  style={{ display: "none" }}
  onChange={(e) => {
    if (e.target.files && e.target.files[0]) {

      setFileName(
        e.target.files[0].name
      );

      const fileUrl =
        URL.createObjectURL(
          e.target.files[0]
        );

      setImage(fileUrl);

      runOCR(fileUrl);
    }
  }}
/>

 <label
  htmlFor="file-upload"
  style={{
    backgroundColor: "#386cde",
    color: "white",
    padding: "10px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    display: "inline-block",
    fontWeight: "bold",
    alignSelf: "flex-start",
    transition: "0.2s",
  }}
>
  📁 Upload Image
</label>

{fileName && (
  <p
    style={{
      color: "#94a3b8",
      marginTop: "10px",
    }}
  >
    Selected: {fileName}
  </p>
)}

 

{image && (
  <img
    src={image}
    alt="Preview"
    style={{
      width: "100%",
      maxHeight: "400px",
      objectFit: "contain",
    }}
  />
)}

  {/*} hided for not required , remove commenet line to enable this.
 {ocrText && (
  <div
    style={{
      backgroundColor: "#0f172a",
      border: "1px solid #334155",
      borderRadius: "10px",
      padding: "15px",
      marginTop: "10px",
    }}
  >
    <h3
      style={{
        color: "#22c55e",
        marginTop: 0,
      }}
    >
      ✅ OCR Completed
    </h3>

    <p>
      Text extracted successfully.
    </p>

    <p>
      Characters Found: {ocrText.length}
    </p>
  </div>
)}*/}


 {/*{ocrText && (
  
  
    <textarea
    value={ocrText}
    readOnly
    rows={15}
    style={{
      width: "100%",
      marginTop: "10px",
      backgroundColor: "#0f172a",
      color: "white",
      border: "1px solid #334155",
      borderRadius: "8px",
      padding: "10px",
    }}
  />
  
  
)}*/}
  

{ocrText && (
  <div
    style={{
      backgroundColor: "#0f172a",
      border: "1px solid #334155",
      borderRadius: "10px",
      padding: "15px",
      marginTop: "10px",
    }}
  >
    {/*

    <h3
      style={{
        color: "#60a5fa",
        marginTop: 0,
      }}
    >
      📋 OCR Analysis
    </h3>

    <p>
       <strong>name:</strong> detecting...
    </p>

    <p>
      <strong>Semester:</strong> Detecting...
    </p>

    <p>
      <strong>Subjects Found:</strong> {subjectsFound}
    </p>



    {extractedSubjects.length > 0 && (
  <div
    style={{
      backgroundColor: "#0f172a",
      border: "1px solid #334155",
      borderRadius: "10px",
      padding: "15px",
      marginTop: "10px",
    }}
  >
    */}

  {studentName && (
  <div
    style={{
      backgroundColor: "#0f172a",
      border: "1px solid #334155",
      borderRadius: "10px",
      padding: "15px",
      marginTop: "10px",
    }}
  >
      <h3
      style={{
         color: "#60a5fa"
      }}
    >
     👨‍🎓 Student Details:
    </h3>

     <p>
  <strong>Name:</strong>

  
  <input
    value={studentName}
    onChange={(e) =>
      setStudentName(
        e.target.value
      )
    }
    style={{
      marginLeft: "10px",
      padding: "4px",
      width: "250px",
      border: "1px solid #475569",
    }}
  />
</p>

  <p>
  <strong>HTNO:</strong>

  <input
    value={hallTicket}
    onChange={(e) =>
      setHallTicket(
        e.target.value
      )
    }
    style={{
      marginLeft: "10px",
      padding: "4px",
      width: "180px",
      borderRadius: "4px",
      border: "1px solid #475569",
       
        
      color: "white",
    }}
  />
</p>  

     <p>
  <strong>Father:</strong>

  <input
    value={fatherName}
    onChange={(e) =>
      setFatherName(
        e.target.value
      )
    }
    style={{
      marginLeft: "10px",
      padding: "4px",
      width: "250px",
      border: "1px solid #475569",
    }}
  />
</p>
  </div>
)}

{/*

    <h3
      style={{
        color: "#facc15",
        marginTop: 0,
      }}
    >
      📚 Extracted Subjects
    </h3>

    {extractedSubjects.map((subject, index) => (
      <p key={index}>
        {subject.row}
      </p>
    ))}
  </div>
)} 

*/}

{parsedSubjects.length > 0 && (
  <div
    style={{
       
      
      backgroundColor: "#0f172a",
      border: "1px solid #334155",
      borderRadius: "10px",
      padding: "19px",
      marginTop: "10px",
    }}
  >
       <h3
      style={{
         color: "#60a5fa"
      }}
    >
     📚 Parsed Subjects:({parsedSubjects.length})
    </h3>

<div
  style={{
    overflowX: "auto",
  }}
>
  <table
    style={{
      
      width: "100%",
      textAlign: "left",
    }}
  >
      <thead>
        <tr>
           
      <th>Subject</th>
      <th>Grade</th>
      <th>Credits</th>
      <th>Del-Sub</th>
  
        </tr>
      </thead>

   <tbody>
  {parsedSubjects.map((subject, index) => (
    <tr key={index}>
      <td>
  <input
    value={subject.subject}
    onChange={(e) => {
      const updated = [...parsedSubjects];

      updated[index].subject =
        e.target.value;

      setParsedSubjects(updated);
    }}
   style={{
  width: "100%",
  minWidth: "170px",
  padding: "4px",
  borderRadius: "4px",
  border: "1px solid #475569",
}}
  />
</td>
    
       

    <td>
   
   <select
value={subject.grade}
onChange={(e) => {
const updated = [...parsedSubjects];

 
updated[index].grade =
  e.target.value;
  subject.grade =
  subject.grade.toUpperCase();

setParsedSubjects(updated);

calculateOCRSGPA(updated);


}}
style={{
backgroundColor: "#1e293b",
color: "white",
border: "1px solid #475569",
borderRadius: "6px",
padding: "5px",
minWidth: "50px",
fontSize: "14px",
fontWeight: "bold",
}}

>

  <option value="O">O</option>
  <option value="A+">A+</option>
  <option value="A">A</option>
  <option value="B+">B+</option>
  <option value="B">B</option>
  <option value="C">C</option>
  <option value="F">F</option>
</select>


</td>

<td>
  <input
  type="number"
  min="0"
  max="20"
  step="0.5"
    value={subject.credits}
    onChange={(e) => {
      const updated = [...parsedSubjects];

      updated[index].credits =
        e.target.value;

      setParsedSubjects(updated);

      calculateOCRSGPA(updated);
    }}
    style={{
      width: "45px",
      padding: "4px",
    }}
  />

  {Number(subject.credits) > 5 && (
    <span
      style={{
        color: "#facc15",
        marginLeft: "8px",
        fontWeight: "bold",
      }}
    >
      ⚠
    </span>
  )}
</td>

<td>
  <button
    onClick={() => {
      const updated =
        parsedSubjects.filter(
          (_, i) => i !== index
        );

      setParsedSubjects(updated);

      calculateOCRSGPA(updated);
    }}
    style={{
      backgroundColor: "rgba(137, 92, 92, 0.25)",
      color: "white",
      border: "none",
      borderRadius: "6px",
      padding: "4px 6px",
      cursor: "pointer",
      transition: "0.2s",
    }}
  >
    🗑
  </button>
</td>


</tr>
)
)}
</tbody>
</table>
</div>
</div>
)}

<button
  onClick={() => {
    const updated = [
      ...parsedSubjects,
      {
        subject: "Enter Sub Name:",
        grade: "O",
        credits: "0",
      },
    ];

    setParsedSubjects(updated);

    calculateOCRSGPA(updated);
  }}
  style={{
     backgroundColor: "#2c2c2d",
    color: "white",
    border: "none",
     fontWeight: "bold",
padding: "10px 16px",
borderRadius: "8px",
    cursor: "pointer",
    marginTop: "10px",
    transition: "0.2s",
  }}
>
  ➕ Add Subject
</button>

  <div
  style={{
    backgroundColor: "#164704",
    borderRadius: "12px",
    padding: "20px",
    marginTop: "15px",
    textAlign: "center",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
  }}
>
  <h3
    style={{
      margin: "0",
      color: "white",
        fontSize: "18px",
    }}
  >
    🎯 SGPA
  </h3>

  <h1
    style={{
      margin: "10px 0 0 0",
      color: "white",
      fontSize: "42px",
      fontWeight: "bold",
    }}
  >
    {Number(ocrSgpa || 0).toFixed(2)}
  </h1>
</div>
<p
  style={{
    color: "#d1b761",
    fontWeight: "bold",
    marginTop: "10px",
    textAlign: "center",
  }}
>
  ⚠ Verify and edit all details before downloading the PDF.
</p>

  <button
  onClick={downloadPDF}
  style={{
    backgroundColor: "#5a1f1f",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "10px 15px",
    cursor: "pointer",
    marginTop: "10px",
    fontWeight: "bold",
    transition: "0.2s",
    boxShadow: "0 2px 6px rgba(0,0,0,0.3)"
  }}
>
  📄Download Result
</button>

 <button
  onClick={resetAll}
  style={{
    backgroundColor: "#11315b",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "10px 16px",
    cursor: "pointer",
    marginTop: "10px",
  }}
>
  🔄 Reset
</button>

  


 

  </div>
 
)}
  
 </>


)}

{activeTab === "manual" && (
  <>
          <input
        type="number"
        min="0"
        max="20"
        step="0.5"
        placeholder="Enter Credits"
        value={credits}
        onChange={(e) => setCredits(e.target.value)}
         style={{
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #475569",
  backgroundColor: "#0f172a",
  color: "white",
  fontSize: "16px",
}}
      />

       <select
  value={grade}
  onChange={(e) => setGrade(e.target.value)}
  style={{
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #475569",
    backgroundColor: "#0f172a",
    color: "white",
    fontSize: "16px",
  }}
>
        <option value="O">O</option>
        <option value="A+">A+</option>
        <option value="A">A</option>
        <option value="B+">B+</option>
        <option value="B">B</option>
        <option value="C">C</option>
        <option value="F">F</option>
      </select>


      <button
        onClick={addSubject}
        style={{
          backgroundColor: "#2563eb",
          color: "white",
          padding: "10px 20px",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        Add Subject
      </button>

      <button
        onClick={calculateSGPA}
        style={{
          backgroundColor: "#16a34a",
          color: "white",
          padding: "10px 20px",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        Calculate SGPA
      </button>

      <button
  onClick={clearAllSubjects}
  style={{
    backgroundColor: "#f59e0b",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  }}
>
  🗑 Clear All
</button>

 <div
  style={{
    backgroundColor: "#0f172a",
    border: "1px solid #334155",
    borderRadius: "12px",
    padding: "15px",
    textAlign: "center",
  }}
>
      <h3>
  Total Subjects: {subjects.length}
</h3>

<h3>
  Total Credits: {
    subjects.reduce(
      (sum, subject) => sum + subject.credits,
      0
    )
  }
</h3>
</div>
      <h2>📚 Added Subjects:</h2>

       <table
  style={{
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "center",
  }}
>
   <thead>
  <tr
    style={{
      backgroundColor: "#0f172a",
    }}
  >
    <th style={{ padding: "10px" }}>Credits</th>
    <th style={{ padding: "10px" }}>Grade</th>
    <th style={{ padding: "10px" }}>GP</th>
    <th style={{ padding: "10px" }}>Action</th>
  </tr>
</thead>

  <tbody>
    {subjects.map((subject, index) => (
      <tr key={index}
       style={{
    backgroundColor: "#243248",
  }}
      >
        <td>{subject.credits}</td>
        <td>{subject.grade}</td>
        <td>{subject.gradePoint}</td>

        <td>
          <button
            onClick={() => deleteSubject(index)}
            style={{
              backgroundColor: "#dc2626",
              color: "white",
              border: "none",
              borderRadius: "6px",
              padding: "5px 10px",
              cursor: "pointer",
            }}
          >
            Delete
          </button>
        </td>
      </tr>
    ))}
  </tbody>
</table>

       {showResult && (
  <div
    style={{
      backgroundColor: "#0f172a",
      border: "2px solid #16a34a",
      borderRadius: "12px",
      padding: "20px",
      textAlign: "center",
      marginTop: "10px",
    }}
  >
    <h3>🎯 Final SGPA</h3>

    <h1
      style={{
        color: "#22c55e",
        margin: 0,
      }}
    >
      {sgpa.toFixed(2)}
    </h1>
  </div>
)}

      <p
        style={{
          color: "red",
          fontWeight: "bold",
        }}
      >
        {message}
      </p>
      
  </>
)}


<div
  style={{
    backgroundColor: "#0f172a",
    border: "1px solid #334155",
    borderRadius: "10px",
    padding: "15px",
    marginTop: "20px",
    textAlign: "left",
  }}
>
  <h3
    style={{
      color: "#c6ae34",
      marginTop: 0,
    }}
  >
    ℹ User Guidence:
  </h3>

  <p>• Upload a clear and properly cropped marks memo/image.</p>

  <p>• ⚠ indicates unusual credit values/ cross check.</p>

  <p>• JNTU results image is preferable.</p>

  <p>• You can edit names, grades, credits and subjects.</p>

  <p>• Use Add and Delete button if any subject required/removable. </p>

  <p>• mail: vickyshanigaram98@gmail.com for enquiry/feedback/bugs.</p>
   
  <p>
    <strong>• SGPA Formula Used:</strong>
    <br />
      Σ(Credit × Grade Point) / Σ(Credits)
  </p>
</div>


      </div>

      <p
  style={{
    color: "#c5923f",
fontSize: "12px",
opacity: 0.7,
textAlign: "center",
marginTop: "20px",
  }}
>
  Built by VIGNESH S
</p>
    </main>
  );
}