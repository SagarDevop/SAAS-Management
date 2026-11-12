import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Generate Professional Monthly Labour Report PDF
export const generateMonthlyReportPDF = ({ businessName, reportMonth, summary, workerBreakdown }) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Deep Navy Header Box
  doc.setFillColor(23, 43, 77); // #172B4D
  doc.rect(0, 0, 210, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(businessName || 'SHREEDEV PAINT SERVICE', 14, 12);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`MONTHLY LABOUR EXPENSE & ATTENDANCE STATEMENT - ${reportMonth}`, 14, 20);

  // Summary Metrics Section
  doc.setTextColor(23, 43, 77);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('EXECUTIVE LABOUR SUMMARY', 14, 38);

  const summaryData = [
    [
      'Total Workers Registered', `${summary.totalWorkers || 0}`,
      'Total Attendance Units', `${summary.totalAttendanceUnits || 0}`
    ],
    [
      'Full Attendance Units', `${summary.fullAttendanceUnits || 0}`,
      'Half Attendance Units', `${summary.halfAttendanceUnits || 0}`
    ],
    [
      'Total Labour Earnings', `INR ${summary.totalLabourEarnings || 0}`,
      'Advances Given', `INR ${summary.totalAdvances || 0}`
    ],
    [
      'Bonuses Awarded', `INR ${summary.totalBonuses || 0}`,
      'Payments Disbursed', `INR ${summary.totalPayments || 0}`
    ],
    [
      'Net Outstanding Payable', `INR ${summary.totalOutstandingPayable || 0}`,
      'Report Generation Date', `${new Date().toLocaleDateString()}`
    ]
  ];

  autoTable(doc, {
    startY: 42,
    body: summaryData,
    theme: 'plain',
    styles: { fontSize: 8.5, cellPadding: 2, textColor: [23, 43, 77] },
    columnStyles: {
      0: { fontStyle: 'bold', width: 50 },
      1: { width: 45 },
      2: { fontStyle: 'bold', width: 50 },
      3: { width: 45 }
    }
  });

  // Worker Breakdown Table
  const breakdownStartY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('WORKER-WISE ATTENDANCE & LABOUR EARNINGS', 14, breakdownStartY);

  const tableRows = (workerBreakdown || []).map(w => [
    w.workerCustomId || '-',
    w.name,
    `${w.full || 0}`,
    `${w.half || 0}`,
    `${w.units || 0}`,
    `INR ${w.earned || 0}`
  ]);

  autoTable(doc, {
    startY: breakdownStartY + 4,
    head: [['Worker ID', 'Worker Name', 'Full Days', 'Half Slots', 'Units', 'Earned Wage']],
    body: tableRows.length > 0 ? tableRows : [['-', 'No attendance records logged for this month', '-', '-', '-', '-']],
    theme: 'grid',
    headStyles: {
      fillColor: [23, 43, 77],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: [30, 41, 59]
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250]
    }
  });

  // Footer note
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Confidential Internal Labour Report • ShreeDev Paint Service Management System', 14, pageHeight - 10);

  doc.save(`Labour_Report_${reportMonth.replace(/\s+/g, '_')}.pdf`);
};

// Generate Individual Worker Statement PDF (Excludes sensitive Aadhaar/bank data)
export const generateWorkerStatementPDF = ({ businessName, worker, summary, attendances, transactions, dateRange }) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Deep Navy Header Box
  doc.setFillColor(23, 43, 77);
  doc.rect(0, 0, 210, 26, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(businessName || 'SHREEDEV PAINT SERVICE', 14, 11);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`WORKER ACCOUNT & LEDGER STATEMENT`, 14, 18);

  // Worker Info Block
  doc.setTextColor(23, 43, 77);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.text('WORKER PARTICULARS', 14, 34);

  const infoData = [
    ['Worker Name:', worker.name, 'Worker ID:', worker.workerId],
    ['Mobile Number:', worker.mobile, 'Daily Wage Rate:', `INR ${worker.dailyWage}`],
    ['Total Units Logged:', `${summary.totalUnits || 0}`, 'Current Ledger Balance:', `INR ${worker.walletBalance}`],
    ['Statement Period:', dateRange || 'Full History', 'Generated On:', new Date().toLocaleDateString()]
  ];

  autoTable(doc, {
    startY: 37,
    body: infoData,
    theme: 'plain',
    styles: { fontSize: 8, cellPadding: 1.8, textColor: [23, 43, 77] },
    columnStyles: {
      0: { fontStyle: 'bold', width: 40 },
      1: { width: 55 },
      2: { fontStyle: 'bold', width: 40 },
      3: { width: 55 }
    }
  });

  // Recent Attendance History
  const attStartY = doc.lastAutoTable.finalY + 8;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('ATTENDANCE HISTORY (RECENT)', 14, attStartY);

  const attRows = (attendances || []).slice(0, 15).map(a => [
    a.date,
    a.fullAttendance ? 'Yes (1.0)' : 'No',
    a.halfAttendance ? 'Yes (0.5)' : 'No',
    `${a.attendanceUnits}`,
    `INR ${a.earnedAmount}`
  ]);

  autoTable(doc, {
    startY: attStartY + 3,
    head: [['Date', 'Full Day', 'Half Slot', 'Units', 'Earned']],
    body: attRows.length > 0 ? attRows : [['-', 'No recent attendance entries', '-', '-', '-']],
    theme: 'grid',
    headStyles: { fillColor: [23, 43, 77], fontSize: 7.5 },
    styles: { fontSize: 7.5, cellPadding: 2 }
  });

  // Financial Transaction Ledger
  const txStartY = doc.lastAutoTable.finalY + 8;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('FINANCIAL TRANSACTION LEDGER', 14, txStartY);

  const txRows = (transactions || []).slice(0, 20).map(t => [
    new Date(t.date).toLocaleDateString(),
    t.type,
    t.description,
    t.direction === 'credit' ? `+INR ${t.amount}` : `-INR ${t.amount}`,
    `INR ${t.balanceAfter}`
  ]);

  autoTable(doc, {
    startY: txStartY + 3,
    head: [['Date', 'Type', 'Description', 'Amount', 'Balance After']],
    body: txRows.length > 0 ? txRows : [['-', 'No transactions recorded', '-', '-', '-']],
    theme: 'grid',
    headStyles: { fillColor: [23, 43, 77], fontSize: 7.5 },
    styles: { fontSize: 7.5, cellPadding: 2 }
  });

  doc.save(`Statement_${worker.workerId}_${worker.name.replace(/\s+/g, '_')}.pdf`);
};

