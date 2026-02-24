"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Download, FileText, Users, Eye, Filter, MessageSquare } from "lucide-react"

const PDF_SERVER_URL = 'http://localhost:3001'; // Change to your backend URL

// Mock data
const mockClasses = [
  { id: "1", name: "Primary 1A", level: "Primary 1", students: 25 },
  { id: "2", name: "Primary 2B", level: "Primary 2", students: 28 },
  { id: "3", name: "Primary 3A", level: "Primary 3", students: 30 },
  { id: "4", name: "Primary 4C", level: "Primary 4", students: 27 },
]

const mockStudents = [
  {
    id: "1",
    name: "Muganga Charles",
    studentNumber: "ST001",
    gender: "Male",
    class: "S.4",
    stream: "A",
    year: "2024",
    average: 85.2,
    grade: "A",
    overallGrade: "A",
    overallAchievement: "Excellent",
    averageScore: 85,
    rank: 2,
    numberOfStudents: 25,
    status: "Complete",
    profileImage: "https://firebasestorage.googleapis.com/v0/b/toa-site.appspot.com/o/prod%2FsiteImages%2F1758026849456_john_doe.jpeg?alt=media&token=d0bffeaf-de82-433f-80cd-84ce77de3286",
    subjects: [
      { name: "Mathematics", formative: { u1: 3, u2: 2.4, u3: null, u4: null, average: 2.7, total: 15 }, summative: { mt: 23, eot: 52, total: 60, mark: 78 }, grade: "B", teacherInitials: "AJ" },
      { name: "English Language", formative: { u1: 2, u2: 2.8, u3: null, u4: null, average: 2.4, total: 12 }, summative: { mt: 25, eot: 48, total: 54, mark: 72 }, grade: "B", teacherInitials: "TA" },
      { name: "Physics", formative: { u1: 2.4, u2: 2.4, u3: null, u4: null, average: 2.4, total: 14 }, summative: { mt: 24, eot: 65, total: 67, mark: 86 }, grade: "A", teacherInitials: "KP" },
      { name: "Biology", formative: { u1: 2.5, u2: null, u3: null, u4: null, average: 2.5, total: 13 }, summative: { mt: 28, eot: 70, total: 78, mark: 95 }, grade: "A*", teacherInitials: "SJ" },
      { name: "Chemistry", formative: { u1: 2.2, u2: 2.6, u3: null, u4: null, average: 2.4, total: 11 }, summative: { mt: 22, eot: 58, total: 65, mark: 81 }, grade: "A", teacherInitials: "OJ" },
      { name: "Geography", formative: { u1: 2.0, u2: 2.2, u3: null, u4: null, average: 2.1, total: 10 }, summative: { mt: 20, eot: 45, total: 55, mark: 70 }, grade: "B", teacherInitials: "AJ" },
      { name: "History and Political Education", formative: { u1: 2.8, u2: 2.9, u3: null, u4: null, average: 2.85, total: 14 }, summative: { mt: 26, eot: 62, total: 72, mark: 88 }, grade: "A", teacherInitials: "MK" },
      { name: "Kiswahili", formative: { u1: 2.3, u2: 2.5, u3: null, u4: null, average: 2.4, total: 12 }, summative: { mt: 24, eot: 55, total: 68, mark: 80 }, grade: "A", teacherInitials: "HK" },
      { name: "Entrepreneurship", formative: { u1: 2.9, u2: 2.8, u3: null, u4: null, average: 2.85, total: 15 }, summative: { mt: 28, eot: 68, total: 78, mark: 93 }, grade: "A*", teacherInitials: "LM" },
      { name: "Physical Education", formative: { u1: 3, u2: 3, u3: null, u4: null, average: 3.0, total: 15 }, summative: { mt: 30, eot: 70, total: 85, mark: 100 }, grade: "A*", teacherInitials: "RW" },
      { name: "Religious Education (CRE)", formative: { u1: 2.6, u2: 2.4, u3: null, u4: null, average: 2.5, total: 13 }, summative: { mt: 25, eot: 60, total: 70, mark: 85 }, grade: "A", teacherInitials: "PK" },
      { name: "Literature in English", formative: { u1: 2.2, u2: 2.8, u3: null, u4: null, average: 2.5, total: 13 }, summative: { mt: 23, eot: 52, total: 62, mark: 77 }, grade: "B", teacherInitials: "TA" },
      { name: "Art and Design", formative: { u1: 2.9, u2: 2.7, u3: null, u4: null, average: 2.8, total: 14 }, summative: { mt: 27, eot: 65, total: 76, mark: 90 }, grade: "A*", teacherInitials: "DM" },
    ],
    classTeacherComment: "he is good",
    headTeacherComment: "good but more effort is needed",
    nextTermFees: 300000,
    balance: 10000,
    termEndDate: "5/6/2023",
    nextTermStartDate: "28/05/2023",
    totalMarks: 1068,
    totalAverage: 82.2,
  },
  {
    id: "2",
    name: "Jane Smith",
    studentNumber: "ST002",
    gender: "Female",
    class: "S.4",
    stream: "A",
    year: "2024",
    average: 78.5,
    grade: "B",
    overallGrade: "B",
    overallAchievement: "Good",
    averageScore: 78,
    rank: 5,
    numberOfStudents: 25,
    status: "Pending",
    profileImage: "/images/students/jane-smith.jpg",
    subjects: [
      { name: "Mathematics", formative: { u1: 2.8, u2: 2.2, u3: null, u4: null, average: 2.5, total: 13 }, summative: { mt: 22, eot: 48, total: 58, mark: 75 }, grade: "B", teacherInitials: "AJ" },
      { name: "English Language", formative: { u1: 2.2, u2: 2.4, u3: null, u4: null, average: 2.3, total: 11 }, summative: { mt: 21, eot: 45, total: 52, mark: 68 }, grade: "C", teacherInitials: "TA" },
      { name: "Physics", formative: { u1: 2.1, u2: 2.3, u3: null, u4: null, average: 2.2, total: 12 }, summative: { mt: 20, eot: 50, total: 58, mark: 74 }, grade: "B", teacherInitials: "KP" },
      { name: "Biology", formative: { u1: 2.3, u2: 2.5, u3: null, u4: null, average: 2.4, total: 12 }, summative: { mt: 26, eot: 65, total: 75, mark: 88 }, grade: "A", teacherInitials: "SJ" },
      { name: "Chemistry", formative: { u1: 2.0, u2: 2.2, u3: null, u4: null, average: 2.1, total: 10 }, summative: { mt: 18, eot: 42, total: 50, mark: 65 }, grade: "C", teacherInitials: "OJ" },
      { name: "Geography", formative: { u1: 2.5, u2: 2.7, u3: null, u4: null, average: 2.6, total: 13 }, summative: { mt: 24, eot: 58, total: 68, mark: 82 }, grade: "A", teacherInitials: "AJ" },
      { name: "History and Political Education", formative: { u1: 2.2, u2: 2.4, u3: null, u4: null, average: 2.3, total: 11 }, summative: { mt: 22, eot: 50, total: 61, mark: 75 }, grade: "B", teacherInitials: "MK" },
      { name: "Kiswahili", formative: { u1: 2.6, u2: 2.8, u3: null, u4: null, average: 2.7, total: 14 }, summative: { mt: 25, eot: 60, total: 72, mark: 86 }, grade: "A", teacherInitials: "HK" },
      { name: "Entrepreneurship", formative: { u1: 2.4, u2: 2.6, u3: null, u4: null, average: 2.5, total: 12 }, summative: { mt: 23, eot: 55, total: 65, mark: 80 }, grade: "A", teacherInitials: "LM" },
      { name: "Physical Education", formative: { u1: 2.9, u2: 2.8, u3: null, u4: null, average: 2.85, total: 14 }, summative: { mt: 28, eot: 68, total: 82, mark: 96 }, grade: "A*", teacherInitials: "RW" },
      { name: "Religious Education (IRE)", formative: { u1: 2.3, u2: 2.1, u3: null, u4: null, average: 2.2, total: 11 }, summative: { mt: 21, eot: 47, total: 58, mark: 72 }, grade: "B", teacherInitials: "NK" },
      { name: "Foreign Languages (French)", formative: { u1: 2.1, u2: 2.3, u3: null, u4: null, average: 2.2, total: 11 }, summative: { mt: 19, eot: 44, total: 54, mark: 69 }, grade: "C", teacherInitials: "FM" },
      { name: "Information and Communication Technology", formative: { u1: 2.8, u2: 2.9, u3: null, u4: null, average: 2.85, total: 15 }, summative: { mt: 28, eot: 67, total: 80, mark: 95 }, grade: "A*", teacherInitials: "TK" },
    ],
    classTeacherComment: "Jane shows consistent effort in her studies. Keep up the good work.",
    headTeacherComment: "Jane demonstrates good academic potential. Continue working hard.",
    nextTermFees: 300000,
    balance: 15000,
    termEndDate: "5/6/2023",
    nextTermStartDate: "28/05/2023",
    totalMarks: 1030,
    totalAverage: 79.2,
  },
]

const schoolInfo = {
  name: "MARTAH HIGH SCHOOL ZZANA",
  motto: "EMPOWERING TO EXCEL",
  logo: "https://firebasestorage.googleapis.com/v0/b/toa-site.appspot.com/o/prod%2FsiteImages%2F1758026704031_marthahigh.png?alt=media&token=4b1dd408-42d2-49c9-abf5-3022f1d3a473",
  poBox: "P.O. Box 1234, Kampala, Uganda",
  phone: "Tel: +256 700 123 456",
  email: "Email: info@martahhigh.ug",
  website: "www.martahhigh.ug",
}

const gradingScale = [
  { grade: "A*", scoreRange: "90-100", descriptor: "Achieved MOST or ALL competencies in the subject exceptionally well. The Learner is outstanding in most or all areas of the subject." },
  { grade: "A", scoreRange: "80-89", descriptor: "Achieved MOST or ALL competencies in the subject exceedingly well. The Learner is excellent in most or all areas of the subject." },
  { grade: "B", scoreRange: "70-79", descriptor: "Achieved MOST but not all competencies well. The Learner is very good in a number of areas of the subject." },
  { grade: "C", scoreRange: "60-69", descriptor: "Achieved a good number of competencies in the subject" },
  { grade: "D", scoreRange: "50-59", descriptor: "Achieved a basic number of competencies in the subject" },
]

// Backend PDF Generation Functions

// Function to show toast notifications
const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  const toast = document.createElement('div');
  toast.innerHTML = message;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    z-index: 9999;
    font-family: system-ui;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  `;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    if (document.body.contains(toast)) {
      document.body.removeChild(toast);
    }
  }, type === 'error' ? 5000 : 3000);
};

// Function to generate HTML content for PDF
const generateReportHTML = (student: any) => {
  return `
    <div class="report-container">
      <!-- School Header -->
      <div class="header-section">
        <div class="header-content">
          <!-- School Logo -->
          <div class="logo-section">
            <img src="${schoolInfo.logo}" alt="School Logo" class="school-logo" />
          </div>
          
          <!-- School Info -->
          <div class="school-info">
            <h1 class="school-name">${schoolInfo.name}</h1>
            <p class="school-motto">${schoolInfo.motto}</p>
            <p class="contact-info">${schoolInfo.poBox}</p>
            <p class="contact-info">${schoolInfo.phone}</p>
            <p class="contact-info">${schoolInfo.email}</p>
          </div>
          
          <!-- Student Photo -->
          <div class="photo-section">
            <img src="${student.profileImage || ''}" alt="Student Photo" class="student-photo" />
          </div>
        </div>
      </div>

      <!-- Report Title -->
      <div class="report-title">
        END OF TERM REPORT CARD
      </div>

      <!-- Student Information -->
      <div class="student-details">
        <div class="detail-row">
          <div class="detail-item"><strong>Student No:</strong> ${student.studentNumber}</div>
          <div class="detail-item"><strong>Name:</strong> ${student.name}</div>
          <div class="detail-item"><strong>Gender:</strong> ${student.gender}</div>
        </div>
        <div class="detail-row">
          <div class="detail-item"><strong>Class:</strong> ${student.class}</div>
          <div class="detail-item"><strong>Stream:</strong> ${student.stream}</div>
          <div class="detail-item"><strong>Year:</strong> ${student.year}</div>
        </div>
      </div>

      <!-- Term Section -->
      <div class="term-section">
        TERM ONE
      </div>

      <!-- Academic Performance Table -->
      <div class="academic-section">
        <table class="marks-table">
          <thead>
            <tr class="header-row">
              <th rowspan="2" class="subject-col">SUBJECT</th>
              <th colspan="7" class="activities-header">Scores for End Of Chapter Activities of Integration</th>
              <th rowspan="2" class="small-col">EOT/80</th>
              <th rowspan="2" class="small-col">Total<br>(100%)</th>
              <th rowspan="2" class="small-col">Grade</th>
              <th rowspan="2" class="small-col">Descriptor</th>
              <th rowspan="2" class="small-col">Tr's<br>Initials</th>
            </tr>
            <tr class="sub-header-row">
              <th class="tiny-col">C1</th>
              <th class="tiny-col">C2</th>
              <th class="tiny-col">C3</th>
              <th class="tiny-col">C4</th>
              <th class="tiny-col">C5</th>
              <th class="tiny-col">Project/10</th>
              <th class="tiny-col">Score/20</th>
            </tr>
          </thead>
          <tbody>
            ${student.subjects.map((subject: any) => `
              <tr class="data-row">
                <td class="subject-name">${subject.name}</td>
                <td class="data-cell">${subject.formative.u1 || "-"}</td>
                <td class="data-cell">${subject.formative.u2 || "-"}</td>
                <td class="data-cell">${subject.formative.u3 || "-"}</td>
                <td class="data-cell">${subject.formative.u4 || "-"}</td>
                <td class="data-cell">${subject.formative.average || "-"}</td>
                <td class="data-cell">${subject.summative.mt || "-"}</td>
                <td class="data-cell">${subject.formative.total || "-"}</td>
                <td class="data-cell">${subject.summative.eot}</td>
                <td class="data-cell">${subject.summative.mark}</td>
                <td class="grade-cell">${subject.grade}</td>
                <td class="data-cell">-</td>
                <td class="data-cell">${subject.teacherInitials || "-"}</td>
              </tr>
            `).join("")}
            <tr class="total-row">
              <td class="subject-name">TOTAL</td>
              <td colspan="8"></td>
              <td class="data-cell">${student.totalMarks}</td>
              <td colspan="3"></td>
            </tr>
            <tr class="total-row">
              <td class="subject-name">AVERAGE</td>
              <td colspan="8"></td>
              <td class="data-cell">${student.totalAverage}</td>
              <td colspan="3"></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Summary Information -->
      <div class="summary-section">
        <!-- Overall Grade -->
        <table class="summary-table">
          <tr>
            <td class="summary-label">Overall Grade</td>
            <td class="summary-value">${student.overallGrade}</td>
            <td class="summary-label">Overall Achievement Descriptor</td>
            <td class="summary-value">${student.overallAchievement}</td>
          </tr>
        </table>

        <!-- Ranking -->
        <table class="summary-table">
          <tr>
            <td class="summary-label">Average Score out 100:</td>
            <td class="summary-value">${student.averageScore}</td>
            <td class="summary-label">Rank:</td>
            <td class="summary-value">${student.rank}</td>
            <td class="summary-label">Number of Students</td>
            <td class="summary-value">${student.numberOfStudents}</td>
          </tr>
        </table>

        <!-- Comments -->
        <table class="summary-table">
          <tr>
            <td class="summary-label">Class Teacher's<br>Comment</td>
            <td class="comment-cell">${student.classTeacherComment}</td>
            <td class="summary-label">Signature</td>
            <td class="signature-cell"></td>
          </tr>
          <tr>
            <td class="summary-label">Head Teacher's<br>Comment</td>
            <td class="comment-cell">${student.headTeacherComment}</td>
            <td class="summary-label">Signature</td>
            <td class="signature-cell"></td>
          </tr>
        </table>

        <!-- Fees -->
        <table class="summary-table">
          <tr>
            <td class="summary-label">Next term Fees:</td>
            <td class="summary-value">${student.nextTermFees.toLocaleString()}</td>
            <td class="summary-label">Balance:</td>
            <td class="summary-value">${student.balance.toLocaleString()}</td>
            <td class="summary-label">Total:</td>
            <td class="summary-value">Ugx ${(student.nextTermFees + student.balance).toLocaleString()}</td>
          </tr>
        </table>

        <!-- Term Dates -->
        <table class="summary-table">
          <tr>
            <td class="summary-label">This term has ended on:</td>
            <td class="summary-value">${student.termEndDate}</td>
            <td class="summary-label">Next term begins on:</td>
            <td class="summary-value">${student.nextTermStartDate}</td>
          </tr>
        </table>
      </div>

      <!-- Grade Rubric on new page -->
      <div class="page-break">
        <div class="rubric-section">
          <h3 class="rubric-title">Grade Rubric:</h3>
          <table class="rubric-table">
            <thead>
              <tr class="rubric-header">
                <th class="grade-col">GRADE</th>
                <th class="range-col">SCORE RANGE</th>
                <th class="descriptor-col">GRADE DESCRIPTOR</th>
              </tr>
            </thead>
            <tbody>
              ${gradingScale.map(scale => `
                <tr>
                  <td class="grade-cell">${scale.grade}</td>
                  <td class="range-cell">${scale.scoreRange}</td>
                  <td class="descriptor-cell">${scale.descriptor}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
          
          <!-- Footer -->
          <div class="footer">
            <p>Generated on ${new Date().toLocaleDateString()} | ${schoolInfo.website}</p>
          </div>
        </div>
      </div>
    </div>
  `;
};

// Function to generate PDF via backend
const generatePDFViaBackend = async (student: any) => {
  try {
    showToast('Generating PDF...', 'info');

    const htmlContent = generateReportHTML(student);
    
    const response = await fetch(`${PDF_SERVER_URL}/api/generate-pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        htmlContent,
        fileName: `${student.name}-Report-${student.year}.pdf`,
        options: {
          format: 'A4',
          printBackground: true,
          margin: {
            top: '20px',
            right: '20px',
            bottom: '20px',
            left: '20px'
          }
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    // Get the PDF blob and download it
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${student.name}-Report-${student.year}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    showToast('PDF generated successfully!', 'success');

  } catch (error: any) {
    console.error('PDF generation error:', error);
    let errorMessage = 'Failed to generate PDF. ';
    
    if (error.message.includes('fetch')) {
      errorMessage += 'Make sure the backend server is running.';
    } else {
      errorMessage += error.message;
    }
    
    showToast(errorMessage, 'error');
  }
};

// Bulk PDF generation
const handleBulkGenerateViaBackend = async (students: any[]) => {
  showToast(`Starting bulk generation for ${students.length} students...`, 'info');

  let successCount = 0;
  let failureCount = 0;

  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    
    try {
      showToast(`Generating PDF ${i + 1}/${students.length}: ${student.name}...`, 'info');
      await generatePDFViaBackend(student);
      successCount++;
      
      // Small delay between requests to avoid overwhelming the server
      if (i < students.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    } catch (error) {
      console.error(`Failed to generate PDF for ${student.name}:`, error);
      failureCount++;
    }
  }
  
  showToast(
    `Bulk generation completed! ${successCount} successful, ${failureCount} failed.`, 
    failureCount > 0 ? 'error' : 'success'
  );
};

// Component Interfaces

interface ReportPreviewModalProps {
  student: any
  isOpen: boolean
  onClose: () => void
  onGeneratePDF: () => void
  selectedTerm: string
  selectedYear: string
  selectedClass: string
}

interface CommentModalProps {
  student: any
  isOpen: boolean
  onClose: () => void
  onSave: (comments: { classTeacher: string; headTeacher: string; nextTermFees: number; balance: number }) => void
}

// Modal Components

function ReportPreviewModal({
  student,
  isOpen,
  onClose,
  onGeneratePDF,
  selectedTerm,
  selectedYear,
  selectedClass,
}: ReportPreviewModalProps) {
  if (!student) return null

  const className = mockClasses.find((c) => c.id === selectedClass)?.name || ""

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[1200px] h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Report Preview - {student.name}</DialogTitle>
        </DialogHeader>

        <div className="bg-white p-6 text-black" id="report-content">
          {/* School Header */}
          <div className="mb-6 border-b-2 border-gray-300 pb-4">
            <div className="flex items-start justify-between">
              {/* School Logo - Left */}
              <div className="w-32 h-32 flex-shrink-0">
                <img
                  src={schoolInfo.logo || "/placeholder.svg"}
                  alt="School Logo"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = "none"
                    const nextElement = target.nextElementSibling as HTMLElement
                    if (nextElement) nextElement.classList.remove("hidden")
                  }}
                />
                <div className="hidden w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-xs">LOGO</span>
                </div>
              </div>

              {/* School Info - Center */}
              <div className="flex-1 text-center mx-8">
                <h1 className="text-xl font-bold text-blue-800 mb-1">{schoolInfo.name}</h1>
                <p className="text-sm italic text-gray-700 mb-2">{schoolInfo.motto}</p>
                <p className="text-xs text-gray-600">{schoolInfo.poBox}</p>
                <p className="text-xs text-gray-600">{schoolInfo.phone}</p>
                <p className="text-xs text-gray-600">{schoolInfo.email}</p>
              </div>

              {/* Student Photo - Right */}
              <div className="w-32 h-32 flex-shrink-0">
                <img
                  src={student.profileImage || "/placeholder.svg"}
                  alt="Student Photo"
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = "none"
                    const nextElement = target.nextElementSibling as HTMLElement
                    if (nextElement) nextElement.classList.remove("hidden")
                  }}
                />
                <div className="hidden w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-xs">PHOTO</span>
                </div>
              </div>
            </div>
          </div>

          {/* Report Title */}
          <div className="text-center mb-6">
            <h2 className="text-lg font-bold border-b border-t border-gray-300 py-2">END OF TERM REPORT CARD</h2>
          </div>

          {/* Student Information Row */}
          <div className="mb-6">
            <div className="grid grid-cols-6 gap-4 text-sm border-b border-gray-300 pb-4">
              <div><strong>Student No:</strong> {student.studentNumber}</div>
              <div><strong>Name:</strong> {student.name}</div>
              <div><strong>Gender:</strong> {student.gender}</div>
              <div><strong>Class:</strong> {student.class}</div>
              <div><strong>Stream:</strong> {student.stream}</div>
              <div><strong>Year:</strong> {student.year}</div>
            </div>
          </div>

          {/* Academic Performance Table */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 bg-gray-100 p-2">ACADEMIC PERFORMANCE</h3>
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2 text-left" rowSpan={2}>SUBJECT</th>
                  <th className="border border-gray-300 p-2" colSpan={7}>
                    Scores for End Of Chapter Activities of Integration
                  </th>
                  <th className="border border-gray-300 p-2" rowSpan={2}>EOT/80</th>
                  <th className="border border-gray-300 p-2" rowSpan={2}>
                    Total<br /> (100%)
                  </th>
                  <th className="border border-gray-300 p-2" rowSpan={2}>Grade</th>
                  <th className="border border-gray-300 p-2" rowSpan={2}>Descriptor</th>
                  <th className="border border-gray-300 p-2" rowSpan={2}>Tr's<br />Initials</th>
                </tr>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 p-1">C1</th>
                  <th className="border border-gray-300 p-1">C2</th>
                  <th className="border border-gray-300 p-1">C3</th>
                  <th className="border border-gray-300 p-1">C4</th>
                  <th className="border border-gray-300 p-1">C5</th>
                  <th className="border border-gray-300 p-1">Project/10</th>
                  <th className="border border-gray-300 p-1">Score/20</th>
                </tr>
              </thead>

              <tbody>
                {student.subjects.map((subject: any, index: number) => (
                  <tr key={index}>
                    <td className="border border-gray-300 p-2 font-medium">{subject.name}</td>
                    <td className="border border-gray-300 p-1 text-center">{subject.formative.u1 || "-"}</td>
                    <td className="border border-gray-300 p-1 text-center">{subject.formative.u2 || "-"}</td>
                    <td className="border border-gray-300 p-1 text-center">{subject.formative.u3 || "-"}</td>
                    <td className="border border-gray-300 p-1 text-center">{subject.formative.u4 || "-"}</td>
                    <td className="border border-gray-300 p-1 text-center">{subject.formative.average || "-"}</td>
                    <td className="border border-gray-300 p-1 text-center">{subject.summative.mt || "-"}</td>
                    <td className="border border-gray-300 p-1 text-center">{subject.formative.total || "-"}</td>
                    <td className="border border-gray-300 p-1 text-center">{subject.summative.eot}</td>
                    <td className="border border-gray-300 p-1 text-center">{subject.summative.mark}</td>
                    <td className="border border-gray-300 p-1 text-center font-semibold">{subject.grade}</td>
                    <td className="border border-gray-300 p-1 text-center">-</td>
                    <td className="border border-gray-300 p-1 text-center">{subject.teacherInitials || "-"}</td>
                  </tr>
                ))}
                <tr className="bg-gray-100 font-semibold">
                  <td className="border border-gray-300 p-2">TOTAL</td>
                  <td className="border border-gray-300 p-1" colSpan={9}></td>
                  <td className="border border-gray-300 p-1 text-center">{student.totalMarks}</td>
                  <td className="border border-gray-300 p-1"></td>
                  <td className="border border-gray-300 p-1"></td>
                </tr>
                <tr className="bg-gray-100 font-semibold">
                  <td className="border border-gray-300 p-2">AVERAGE</td>
                  <td className="border border-gray-300 p-1" colSpan={9}></td>
                  <td className="border border-gray-300 p-1 text-center">{student.totalAverage}</td>
                  <td className="border border-gray-300 p-1"></td>
                  <td className="border border-gray-300 p-1"></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Bottom Section */}
          <div className="mb-6">
            {/* Overall Grade and Achievement */}
            <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-2 bg-gray-100 font-semibold w-32">Overall Grade</td>
                  <td className="border border-gray-300 p-2 text-center font-bold w-20">{student.overallGrade}</td>
                  <td className="border border-gray-300 p-2 bg-gray-100 font-semibold w-48">Overall Achievement Descriptor</td>
                  <td className="border border-gray-300 p-2 text-center">{student.overallAchievement}</td>
                </tr>
              </tbody>
            </table>

            {/* Average Score and Ranking */}
            <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-2 bg-gray-100 font-semibold">Average Score out 100:</td>
                  <td className="border border-gray-300 p-2 text-center font-bold w-24">{student.averageScore}</td>
                  <td className="border border-gray-300 p-2 bg-gray-100 font-semibold w-20">Rank:</td>
                  <td className="border border-gray-300 p-2 text-center w-16">{student.rank}</td>
                  <td className="border border-gray-300 p-2 bg-gray-100 font-semibold">Number of Students</td>
                  <td className="border border-gray-300 p-2 text-center w-16">{student.numberOfStudents}</td>
                </tr>
              </tbody>
            </table>

            {/* Comments Section */}
            <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-2 bg-gray-100 font-semibold w-48">
                    Class Teacher's Comment
                  </td>
                  <td className="border border-gray-300 p-2 text-left">{student.classTeacherComment}</td>
                  <td className="border border-gray-300 p-2 bg-gray-100 font-semibold w-20">Signature</td>
                  <td className="border border-gray-300 p-2 w-32"></td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2 bg-gray-100 font-semibold">
                    Head Teacher's Comment
                  </td>
                  <td className="border border-gray-300 p-2 text-left">{student.headTeacherComment}</td>
                  <td className="border border-gray-300 p-2 bg-gray-100 font-semibold">Signature</td>
                  <td className="border border-gray-300 p-2"></td>
                </tr>
              </tbody>
            </table>

            {/* Fees Information */}
            <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-2 bg-gray-100 font-semibold w-32">Next term Fees:</td>
                  <td className="border border-gray-300 p-2 text-center font-bold w-32">{student.nextTermFees.toLocaleString()}</td>
                  <td className="border border-gray-300 p-2 bg-gray-100 font-semibold w-24">Balance:</td>
                  <td className="border border-gray-300 p-2 text-center w-32">{student.balance.toLocaleString()}</td>
                  <td className="border border-gray-300 p-2 bg-gray-100 font-semibold w-20">Total:</td>
                  <td className="border border-gray-300 p-2 text-center font-bold">Ugx {(student.nextTermFees + student.balance).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>

            {/* Term Dates */}
            <table className="w-full border-collapse border border-gray-300 text-sm mb-6">
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-2 bg-gray-100 font-semibold w-48">This term has ended on:</td>
                  <td className="border border-gray-300 p-2 text-center w-32">{student.termEndDate}</td>
                  <td className="border border-gray-300 p-2 bg-gray-100 font-semibold w-48">Next term begins on:</td>
                  <td className="border border-gray-300 p-2 text-center">{student.nextTermStartDate}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Grade Rubric - forced to next page when printing */}
          <div className="mb-6 page-break">
            <h3 className="text-lg font-semibold mb-2">Grade Rubric:</h3>
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2 w-20">GRADE</th>
                  <th className="border border-gray-300 p-2 w-32">SCORE RANGE</th>
                  <th className="border border-gray-300 p-2">GRADE DESCRIPTOR</th>
                </tr>
              </thead>
              <tbody>
                {gradingScale.map((scale, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 p-2 text-center font-semibold">{scale.grade}</td>
                    <td className="border border-gray-300 p-2 text-center">{scale.scoreRange}</td>
                    <td className="border border-gray-300 p-2">{scale.descriptor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-500 border-t pt-4">
            <p>Generated on {new Date().toLocaleDateString()} | {schoolInfo.website}</p>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={onGeneratePDF}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function CommentModal({ student, isOpen, onClose, onSave }: CommentModalProps) {
  const [classTeacherComment, setClassTeacherComment] = useState(student?.classTeacherComment || "")
  const [headTeacherComment, setHeadTeacherComment] = useState(student?.headTeacherComment || "")
  const [nextTermFees, setNextTermFees] = useState(student?.nextTermFees || 300000)
  const [balance, setBalance] = useState(student?.balance || 0)

  const handleSave = () => {
    onSave({ classTeacher: classTeacherComment, headTeacher: headTeacherComment, nextTermFees, balance })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Comments & Fees - {student?.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Class Teacher Comment</Label>
            <Textarea value={classTeacherComment} onChange={(e) => setClassTeacherComment(e.target.value)} rows={3} />
          </div>

          <div className="space-y-2">
            <Label>Head Teacher Comment</Label>
            <Textarea value={headTeacherComment} onChange={(e) => setHeadTeacherComment(e.target.value)} rows={3} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Next Term Fees (UGX)</Label>
              <Input type="number" value={nextTermFees} onChange={(e) => setNextTermFees(Number(e.target.value))} />
            </div>

            <div className="space-y-2">
              <Label>Balance (UGX)</Label>
              <Input type="number" value={balance} onChange={(e) => setBalance(Number(e.target.value))} />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Main Component

function ReportsContent() {
  const { user } = useAuth()
  const [selectedClass, setSelectedClass] = useState("")
  const [selectedTerm, setSelectedTerm] = useState("")
  const [selectedYear, setSelectedYear] = useState("2024")
  const [previewStudent, setPreviewStudent] = useState<any>(null)
  const [commentStudent, setCommentStudent] = useState<any>(null)
  const [students, setStudents] = useState(mockStudents)

  const handleGenerateReport = (studentId: string) => {
    const student = students.find((s) => s.id === studentId)
    if (student) {
      generatePDFViaBackend(student)
    }
  }

  const handleBulkGenerate = () => {
    handleBulkGenerateViaBackend(students)
  }

  const handlePreview = (student: any) => setPreviewStudent(student)
  const handleEditComments = (student: any) => setCommentStudent(student)

  const handleSaveComments = (studentId: string, comments: any) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === studentId
          ? { 
              ...student, 
              classTeacherComment: comments.classTeacher, 
              headTeacherComment: comments.headTeacher, 
              nextTermFees: comments.nextTermFees, 
              balance: comments.balance 
            }
          : student
      )
    )
  }

  if (!user) return null
    const breadcrumbs = [
    { label: "Dashboard"},
    { label: "Report Generator" }
  ]
  return (
    <MainLayout userRole={user.role} userName={user.name} breadcrumbs={breadcrumbs}>
      <style jsx global>{`
        @media print {
          .page-break {
            page-break-before: always;
            break-before: page;
          }
        }
      `}</style>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Student Report Generator</h2>
            <p className="text-sm text-muted-foreground">
              Generate comprehensive PDF reports for students with academic assessments, teacher comments, and fees information
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Report Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Academic Year</label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2022">2022</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Term</label>
                <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                  <SelectTrigger><SelectValue placeholder="Select term" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="term1">Term 1</SelectItem>
                    <SelectItem value="term2">Term 2</SelectItem>
                    <SelectItem value="term3">Term 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Class</label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                  <SelectContent>
                    {mockClasses.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name} ({cls.students} students)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button onClick={handleBulkGenerate} disabled={!selectedClass || !selectedTerm} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Generate All Reports
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Students List */}
        {selectedClass && selectedTerm ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Students in {mockClasses.find((c) => c.id === selectedClass)?.name} - {selectedTerm.replace("term", "Term ")} {selectedYear}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {students.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={student.profileImage || "/placeholder.svg"} />
                        <AvatarFallback>
                          {student.name.split(" ").map((n: string) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{student.name}</h3>
                          <Badge variant="outline">{student.studentNumber}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Gender: {student.gender}</span>
                          <span>Average: {student.average}%</span>
                          <Badge variant={student.grade === "A*" || student.grade === "A" ? "default" : "secondary"}>
                            Grade {student.grade}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant={student.status === "Complete" ? "default" : "secondary"}>{student.status}</Badge>

                      <Button variant="outline" size="sm" onClick={() => handleEditComments(student)}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Comments
                      </Button>

                      <Button variant="outline" size="sm" onClick={() => handlePreview(student)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>

                      <Button size="sm" onClick={() => handleGenerateReport(student.id)}>
                        <FileText className="h-4 w-4 mr-2" />
                        Generate PDF
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Select Class and Term</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Choose an academic year, term, and class to view students and generate their comprehensive PDF reports with grades, comments, and fees information.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Report Preview Modal */}
      <ReportPreviewModal
        student={previewStudent}
        isOpen={!!previewStudent}
        onClose={() => setPreviewStudent(null)}
        onGeneratePDF={() => {
          if (previewStudent) {
            generatePDFViaBackend(previewStudent)
            setPreviewStudent(null)
          }
        }}
        selectedTerm={selectedTerm}
        selectedYear={selectedYear}
        selectedClass={selectedClass}
      />

      {/* Comments Modal */}
      <CommentModal
        student={commentStudent}
        isOpen={!!commentStudent}
        onClose={() => setCommentStudent(null)}
        onSave={(comments) => {
          if (commentStudent) handleSaveComments(commentStudent.id, comments)
        }}
      />
    </MainLayout>
  )
}

export default function ReportsPage() {
  return (
    <ProtectedRoute requiredPermissions={["reports.view"]}>
      <ReportsContent />
    </ProtectedRoute>
  )
}