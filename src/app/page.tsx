"use client";

import { useState } from "react";

export default function Home() {
  const [credits, setCredits] = useState("");
  const [grade, setGrade] = useState("A+");
  const [subjects, setSubjects] = useState<any[]>([]);
  const [sgpa, setSgpa] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [message, setMessage] = useState("");

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

  return (
    <main
       style={{
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  minHeight: "100vh",
  padding: "30px",
  gap: "20px",
  backgroundColor: "#0f172a",
  color: "white",
}}
    >
      <div
  style={{
    backgroundColor: "#1e293b",
    padding: "25px",
    borderRadius: "16px",
    width: "400px",
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
  float SGPA = ? ;
</h1>

<p
  style={{
    textAlign: "center",
    color: "#94a3b8",
    marginTop: "0",
    marginBottom: "20px",
  }}
>
  JNTUH B.Tech SGPA Calculator
</p>

      <input
        type="number"
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
      </div>

      <p
  style={{
    marginTop: "20px",
    color: "#94a3b8",
    fontSize: "14px",
    textAlign: "center",
  }}
>
  Built by VIGNESH S
</p>
    </main>
  );
}