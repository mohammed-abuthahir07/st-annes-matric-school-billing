import { SCHOOL } from './schoolInfo.js';
import {
  calculateBilling,
  formatInrPlain,
  formatLongDate,
} from './calculations.js';

const NAVY = [23, 59, 103];
const INK = [23, 32, 51];
const MUTED = [90, 104, 122];
const LINE = [214, 221, 230];
const PAPER = [246, 248, 251];

function displayText(value) {
  const text = String(value ?? '').trim();
  return text || '—';
}

export function createInvoiceIdentity(now = new Date()) {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const milliseconds = String(now.getMilliseconds()).padStart(3, '0');

  return {
    number: `ST-${year}${month}${day}-${hours}${minutes}${seconds}${milliseconds}`,
    date: `${year}-${month}-${day}`,
  };
}

export function buildInvoiceView({
  student = {},
  parent = {},
  payment = {},
  invoiceNumber,
  invoiceDate,
}) {
  const billing = calculateBilling(payment);
  const cityLine = [student.city, student.pincode]
    .map((part) => String(part ?? '').trim())
    .filter(Boolean)
    .join(' - ');
  const address = [String(student.address ?? '').trim(), cityLine]
    .filter(Boolean)
    .join(', ');

  const studentRows = [
    ['Student Name', displayText(student.studentName)],
    ['Date of Birth', formatLongDate(student.dob)],
    ['Gender', displayText(student.gender)],
    ['Applying Class', displayText(student.applyingClass)],
    ['Admission Type', displayText(student.admissionType)],
  ];

  if (String(student.previousSchool ?? '').trim()) {
    studentRows.push(['Previous School', student.previousSchool.trim()]);
  }

  studentRows.push(['Address', displayText(address)]);

  const parentRows = [
    ["Father's Name", displayText(parent.fatherName)],
    ["Mother's Name", displayText(parent.motherName)],
    ['Mobile Number', displayText(parent.primaryMobile)],
  ];

  if (String(parent.alternateMobile ?? '').trim()) {
    parentRows.push(['Alternate Mobile', parent.alternateMobile.trim()]);
  }

  if (String(parent.whatsappNumber ?? '').trim()) {
    parentRows.push(['WhatsApp Number', parent.whatsappNumber.trim()]);
  }

  parentRows.push(['Email', displayText(parent.email)]);
  parentRows.push(['Address', displayText(parent.parentAddress)]);

  if (
    String(parent.emergencyName ?? '').trim()
    || String(parent.emergencyMobile ?? '').trim()
  ) {
    const emergency = [parent.emergencyName, parent.emergencyMobile]
      .map((part) => String(part ?? '').trim())
      .filter(Boolean)
      .join(' | ');
    parentRows.push(['Emergency Contact', emergency]);
  }

  const received = billing.amountPaidPaise > 0;
  const paymentRows = [
    ['Payment Status', billing.paymentStatus],
    ['Payment Mode', received ? displayText(payment.paymentMode) : 'Not received'],
    ['Payment Date', received ? formatLongDate(payment.paymentDate) : '—'],
  ];

  if (received && String(payment.transactionReference ?? '').trim()) {
    paymentRows.push(['Transaction Reference', payment.transactionReference.trim()]);
  }

  if (String(payment.paymentNotes ?? '').trim()) {
    paymentRows.push(['Payment Notes', payment.paymentNotes.trim()]);
  }

  return {
    school: SCHOOL,
    invoiceNumber: invoiceNumber || '—',
    invoiceDate: invoiceDate || '',
    invoiceDateLabel: formatLongDate(invoiceDate),
    academicYear: displayText(student.academicYear),
    paymentStatus: billing.paymentStatus,
    studentName: displayText(student.studentName),
    studentRows,
    parentRows,
    paymentRows,
    fees: billing.feeBreakdown,
    totals: {
      subtotal: billing.subtotal,
      discount: billing.discount,
      totalPayable: billing.totalPayable,
      amountPaid: billing.amountPaid,
      balance: billing.balance,
    },
  };
}

export function invoiceFileName(view) {
  const safeName = String(view.studentName || 'Student')
    .replace(/[^a-z0-9]+/gi, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40) || 'Student';
  const safeNumber = String(view.invoiceNumber || 'invoice')
    .replace(/[^a-z0-9-]+/gi, '');

  return `ST_Annes_Invoice_${safeName}_${safeNumber}.pdf`;
}

function measureBlock(doc, width, rows) {
  let height = 8;

  rows.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    const labelLines = doc.splitTextToSize(String(label), width);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    const valueLines = doc.splitTextToSize(String(value), width);
    height += (labelLines.length * 3.6) + (valueLines.length * 4.3) + 2.6;
  });

  return height;
}

function drawRows(doc, x, y, width, title, rows, ensure) {
  let cursor = ensure(y, 12);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...NAVY);
  doc.text(title.toUpperCase(), x, cursor);
  cursor += 1.6;
  doc.setDrawColor(...NAVY);
  doc.setLineWidth(0.35);
  doc.line(x, cursor, x + width, cursor);
  cursor += 5;

  rows.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    const labelLines = doc.splitTextToSize(String(label), width);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    const valueLines = doc.splitTextToSize(String(value), width);
    const needed = (labelLines.length * 3.6) + (valueLines.length * 4.3) + 2.4;
    cursor = ensure(cursor, needed);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...MUTED);
    doc.text(labelLines, x, cursor);
    cursor += (labelLines.length * 3.6) + 0.5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...INK);
    doc.text(valueLines, x, cursor);
    cursor += (valueLines.length * 4.3) + 2.2;
  });

  return cursor;
}

function paintPageChrome(doc, invoiceNumber) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const pages = doc.getNumberOfPages();

  for (let page = 1; page <= pages; page += 1) {
    doc.setPage(page);

    if (page > 1) {
      doc.setFillColor(...NAVY);
      doc.rect(0, 0, pageWidth, 10, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text(SCHOOL.name, 14, 6.4);
      doc.setFont('helvetica', 'normal');
      doc.text(String(invoiceNumber), pageWidth - 14, 6.4, { align: 'right' });
    }

    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.2);
    doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(110, 120, 136);
    doc.text(
      'ST. ANNES MATRIC SCHOOL | Computer-generated admission invoice',
      14,
      pageHeight - 7,
    );
    doc.text(`Page ${page} of ${pages}`, pageWidth - 14, pageHeight - 7, {
      align: 'right',
    });
  }
}

export async function generateInvoicePdf(view) {
  const jsPDFModule = await import('jspdf');
  const autoTableModule = await import('jspdf-autotable');
  const jsPDFImport = jsPDFModule.default || jsPDFModule.jsPDF || jsPDFModule;
  const jsPDF = typeof jsPDFImport === 'function'
    ? jsPDFImport
    : jsPDFImport.jsPDF || jsPDFImport.default;
  const autoTableImport = autoTableModule.default || autoTableModule;
  const autoTable = typeof autoTableImport === 'function'
    ? autoTableImport
    : autoTableImport.default || autoTableImport.autoTable;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - (margin * 2);
  const footerLimit = pageHeight - 16;

  const ensure = (y, needed) => {
    if (y + needed <= footerLimit || y <= 18) return y;
    doc.addPage();
    return 18;
  };

  doc.setProperties({
    title: `${SCHOOL.name} invoice ${view.invoiceNumber}`,
    subject: view.studentName,
    author: SCHOOL.name,
    creator: `${SCHOOL.name} admission portal`,
    keywords: `${view.invoiceNumber}, ${view.paymentStatus}`,
  });

  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pageWidth, 34, 'F');
  doc.setFillColor(196, 164, 92);
  doc.rect(0, 34, pageWidth, 1.3, 'F');

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, 8, 16, 16, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...NAVY);
  doc.text('SA', margin + 8, 17.6, { align: 'center' });

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.text(SCHOOL.name, margin + 20, 13.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(SCHOOL.address, margin + 20, 19);
  doc.text(`Phone: ${SCHOOL.phone}`, margin + 20, 24);
  doc.text(`Email: ${SCHOOL.email}`, margin + 20, 28.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12.5);
  doc.text('ADMISSION INVOICE', pageWidth - margin, 14, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(String(view.invoiceNumber), pageWidth - margin, 20, { align: 'right' });
  doc.text(view.invoiceDateLabel, pageWidth - margin, 25, { align: 'right' });

  let y = 42;
  doc.setFillColor(...PAPER);
  doc.roundedRect(margin, y, contentWidth, 16, 1.4, 1.4, 'F');

  const meta = [
    ['Invoice number', view.invoiceNumber],
    ['Invoice date', view.invoiceDateLabel],
    ['Academic year', view.academicYear],
    ['Payment status', view.paymentStatus],
  ];

  meta.forEach((item, index) => {
    const x = margin + 4 + (index * (contentWidth / 4));
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...MUTED);
    doc.text(item[0].toUpperCase(), x, y + 6);
    doc.setFontSize(8.5);
    doc.setTextColor(...INK);
    doc.text(String(item[1] || '—'), x, y + 11.2, {
      maxWidth: (contentWidth / 4) - 7,
    });
  });

  y += 23;

  const columnGap = 8;
  const columnWidth = (contentWidth - columnGap) / 2;
  const leftHeight = measureBlock(doc, columnWidth, view.studentRows);
  const rightHeight = measureBlock(doc, columnWidth, view.parentRows);
  const blockHeight = Math.max(leftHeight, rightHeight);
  const fitsSideBySide = blockHeight <= 150 && blockHeight <= (pageHeight - 40);

  if (fitsSideBySide) {
    if (y + blockHeight > footerLimit) {
      doc.addPage();
      y = 18;
    }

    const leftEnd = drawRows(
      doc,
      margin,
      y,
      columnWidth,
      'Student details',
      view.studentRows,
      (cursor) => cursor,
    );
    const rightEnd = drawRows(
      doc,
      margin + columnWidth + columnGap,
      y,
      columnWidth,
      'Parent details',
      view.parentRows,
      (cursor) => cursor,
    );
    y = Math.max(leftEnd, rightEnd) + 6;
  } else {
    y = drawRows(doc, margin, y, contentWidth, 'Student details', view.studentRows, ensure);
    y += 3;
    y = drawRows(doc, margin, y, contentWidth, 'Parent details', view.parentRows, ensure);
    y += 5;
  }

  y = ensure(y, 14);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...NAVY);
  doc.text('FEE BREAKDOWN', margin, y);
  y += 3;

  autoTable(doc, {
    startY: y,
    margin: { top: 18, left: margin, right: margin, bottom: 16 },
    head: [['S.No', 'Fee description', 'Amount']],
    body: view.fees.map((fee, index) => [
      String(index + 1),
      fee.label,
      formatInrPlain(fee.amount),
    ]),
    theme: 'plain',
    showHead: 'everyPage',
    styles: {
      font: 'helvetica',
      fontSize: 9,
      textColor: INK,
      cellPadding: { top: 2.3, bottom: 2.3, left: 2, right: 2 },
      overflow: 'linebreak',
      valign: 'middle',
    },
    headStyles: {
      fillColor: NAVY,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 253],
    },
    columnStyles: {
      0: { cellWidth: 16, halign: 'center' },
      1: { cellWidth: contentWidth - 56 },
      2: { cellWidth: 40, halign: 'right' },
    },
  });

  y = (doc.lastAutoTable?.finalY || y) + 5;

  const totalRows = [
    ['Total Fees', formatInrPlain(view.totals.subtotal)],
    [
      'Discount',
      view.totals.discount > 0
        ? `- ${formatInrPlain(view.totals.discount)}`
        : formatInrPlain(0),
    ],
    ['Total Payable', formatInrPlain(view.totals.totalPayable)],
    ['Amount Received', formatInrPlain(view.totals.amountPaid)],
    ['Balance Due', formatInrPlain(view.totals.balance)],
  ];
  const boxWidth = 96;
  const boxHeight = 8 + (totalRows.length * 7);
  y = ensure(y, boxHeight + 2);
  const boxX = margin + contentWidth - boxWidth;

  doc.setFillColor(...PAPER);
  doc.roundedRect(boxX, y, boxWidth, boxHeight, 1.5, 1.5, 'F');

  totalRows.forEach((row, index) => {
    const rowY = y + 6.2 + (index * 7);
    const emphasize = index === 2 || index === totalRows.length - 1;
    doc.setFont('helvetica', emphasize ? 'bold' : 'normal');
    doc.setFontSize(emphasize ? 9.5 : 9);
    doc.setTextColor(...MUTED);
    doc.text(row[0], boxX + 4, rowY);
    doc.setTextColor(...(emphasize ? NAVY : INK));
    doc.text(row[1], boxX + boxWidth - 4, rowY, { align: 'right' });
  });

  y += boxHeight + 8;
  y = ensure(y, 16);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...NAVY);
  doc.text('PAYMENT INFORMATION', margin, y);
  y += 1.8;
  doc.setDrawColor(...NAVY);
  doc.setLineWidth(0.35);
  doc.line(margin, y, margin + contentWidth, y);
  y += 5.5;

  view.paymentRows.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    const labelText = `${label}: `;
    const labelWidth = doc.getTextWidth(labelText);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const valueLines = doc.splitTextToSize(
      String(value),
      Math.max(40, contentWidth - labelWidth),
    );

    valueLines.forEach((line, index) => {
      y = ensure(y, 5.2);

      if (index === 0) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(...MUTED);
        doc.text(labelText, margin, y);
      }

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...INK);
      doc.text(line, index === 0 ? margin + labelWidth : margin, y);
      y += 4.6;
    });

    y += 1.4;
  });

  y += 6;
  y = ensure(y, 28);
  const signatureWidth = 68;
  doc.setDrawColor(150, 162, 178);
  doc.setLineWidth(0.3);
  doc.line(margin, y + 14, margin + signatureWidth, y + 14);
  doc.line(pageWidth - margin - signatureWidth, y + 14, pageWidth - margin, y + 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text('Parent / Guardian', margin, y + 19);
  doc.text('Authorized Signature', pageWidth - margin - signatureWidth, y + 19);

  y += 28;
  y = ensure(y, 14);
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  const thanks = doc.splitTextToSize(
    'Thank you for choosing ST. ANNES MATRIC SCHOOL. This invoice was prepared at the school office for the current admission. Please keep the downloaded copy.',
    contentWidth,
  );
  doc.text(thanks, margin, y);

  paintPageChrome(doc, view.invoiceNumber);
  return doc;
}
