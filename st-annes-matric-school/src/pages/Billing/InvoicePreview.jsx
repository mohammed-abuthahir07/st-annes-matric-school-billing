import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Download,
  FileText,
  GraduationCap,
  Printer,
} from 'lucide-react';
import { formatInr } from '../../utils/calculations';
import {
  buildInvoiceView,
  generateInvoicePdf,
  invoiceFileName,
} from '../../utils/invoiceUtils';
import './InvoicePreview.css';

function statusClass(status) {
  return String(status || 'unpaid').toLowerCase().replace(/\s+/g, '-');
}

function InvoicePreview({
  studentData = {},
  parentData = {},
  paymentData = {},
  invoiceNumber,
  invoiceDate,
  onBack,
  onFinish,
}) {
  const [pdfStatus, setPdfStatus] = useState('idle');
  const [pdfMessage, setPdfMessage] = useState('');
  const [confirmFinish, setConfirmFinish] = useState(false);

  const view = useMemo(
    () => buildInvoiceView({
      student: studentData,
      parent: parentData,
      payment: paymentData,
      invoiceNumber,
      invoiceDate,
    }),
    [studentData, parentData, paymentData, invoiceNumber, invoiceDate],
  );

  const downloadPdf = async () => {
    if (pdfStatus === 'loading') return;

    setPdfStatus('loading');
    setPdfMessage('Preparing your invoice...');

    await new Promise((resolve) => {
      window.setTimeout(resolve, 450);
    });

    try {
      const document = await generateInvoicePdf(view);
      document.save(invoiceFileName(view));
      setPdfStatus('success');
      setPdfMessage('Invoice downloaded successfully.');
      window.setTimeout(() => {
        setPdfStatus((current) => (current === 'success' ? 'idle' : current));
      }, 5000);
    } catch {
      setPdfStatus('error');
      setPdfMessage('The invoice could not be created. Please try again.');
    }
  };

  return (
    <main className="invoice-page">
      <div className="invoice-toolbar no-print">
        <div>
          <span className="invoice-eyebrow">ADMISSION PROCESS · STEP 04</span>
          <h1>Invoice Preview</h1>
          <p>Review the invoice, then download or print the office copy.</p>
        </div>

        <div className="invoice-toolbar-actions">
          <button type="button" className="invoice-print-button" onClick={() => window.print()}>
            <Printer size={17} />
            Print Invoice
          </button>

          <button
            type="button"
            className="invoice-download-button"
            onClick={downloadPdf}
            disabled={pdfStatus === 'loading'}
            aria-busy={pdfStatus === 'loading'}
          >
            {pdfStatus === 'loading' ? (
              <>
                <span className="spinner" aria-hidden="true" />
                Preparing...
              </>
            ) : (
              <>
                <Download size={17} />
                Download PDF
              </>
            )}
          </button>
        </div>
      </div>

      {pdfStatus !== 'idle' && (
        <div className={`pdf-status pdf-status-${pdfStatus} no-print`} role="status" aria-live="polite">
          {pdfStatus === 'loading' && <span className="spinner spinner-dark" aria-hidden="true" />}
          {pdfMessage}
        </div>
      )}

      <div className="invoice-paper-frame">
        <article className="invoice-paper" aria-label="Admission invoice">
          <header className="invoice-school-header">
            <div className="invoice-school-logo" aria-hidden="true">
              <GraduationCap size={30} />
            </div>

            <div className="invoice-school-copy">
              <h2>{view.school.name}</h2>
              <p>{view.school.address}</p>
              <p>Phone: {view.school.phone}</p>
              <p>Email: {view.school.email}</p>
            </div>

            <div className="invoice-title-block">
              <h2>ADMISSION INVOICE</h2>
              <span className={`invoice-status ${statusClass(view.paymentStatus)}`}>
                {view.paymentStatus}
              </span>
            </div>
          </header>

          <div className="invoice-meta">
            <div>
              <span>Invoice Number</span>
              <strong>{view.invoiceNumber}</strong>
            </div>
            <div>
              <span>Invoice Date</span>
              <strong>{view.invoiceDateLabel}</strong>
            </div>
            <div>
              <span>Academic Year</span>
              <strong>{view.academicYear}</strong>
            </div>
          </div>

          <div className="invoice-parties">
            <section>
              <h3>Student Details</h3>
              {view.studentRows.map(([label, value]) => (
                <p key={label}>
                  <strong>{label}:</strong> {value}
                </p>
              ))}
            </section>

            <section>
              <h3>Parent Details</h3>
              {view.parentRows.map(([label, value]) => (
                <p key={label}>
                  <strong>{label}:</strong> {value}
                </p>
              ))}
            </section>
          </div>

          <div className="invoice-table-heading">
            <FileText size={18} aria-hidden="true" />
            Fee Breakdown
          </div>

          <div className="invoice-table-scroll">
            <table className="invoice-fee-table">
              <thead>
                <tr>
                  <th scope="col">S.No</th>
                  <th scope="col">Fee Description</th>
                  <th scope="col">Amount</th>
                </tr>
              </thead>
              <tbody>
                {view.fees.map((fee, index) => (
                  <tr key={fee.key}>
                    <td>{index + 1}</td>
                    <td>{fee.label}</td>
                    <td>{formatInr(fee.amount)}</td>
                  </tr>
                ))}
                <tr className="invoice-subtotal">
                  <td colSpan="2">Total Fees</td>
                  <td>{formatInr(view.totals.subtotal)}</td>
                </tr>
                <tr>
                  <td colSpan="2">Discount</td>
                  <td>
                    {view.totals.discount > 0
                      ? `- ${formatInr(view.totals.discount)}`
                      : formatInr(0)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="invoice-total-panel">
            <div>
              <span>Total Payable</span>
              <strong>{formatInr(view.totals.totalPayable)}</strong>
            </div>
            <div>
              <span>Amount Received</span>
              <strong>{formatInr(view.totals.amountPaid)}</strong>
            </div>
            <div className="invoice-balance">
              <span>Balance Due</span>
              <strong>{formatInr(view.totals.balance)}</strong>
            </div>
          </div>

          <section className="invoice-payment-info">
            <h3>Payment Information</h3>
            {view.paymentRows.map(([label, value]) => (
              <p key={label}>
                <strong>{label}:</strong> {value}
              </p>
            ))}
          </section>

          <footer className="invoice-footer">
            <div>
              <strong>Thank you</strong>
              <p>Thank you for choosing ST. ANNES MATRIC SCHOOL.</p>
              <p>Please keep this invoice as the office copy.</p>
            </div>
            <div className="invoice-signature-row">
              <div className="invoice-signature">
                <span>Parent / Guardian</span>
              </div>
              <div className="invoice-signature">
                <span>Authorized Signature</span>
              </div>
            </div>
          </footer>

          <div className="invoice-computer-note">
            {view.school.name} | Computer-generated admission invoice | {view.invoiceNumber}
          </div>
        </article>
      </div>

      <div className="invoice-bottom-actions no-print">
        <button type="button" className="invoice-back-button" onClick={onBack}>
          <ArrowLeft size={17} />
          Back to Payment
        </button>

        {!confirmFinish ? (
          <button
            type="button"
            className="invoice-finish-button"
            onClick={() => setConfirmFinish(true)}
          >
            Finish Admission
          </button>
        ) : (
          <div className="finish-confirm" role="alertdialog" aria-labelledby="finish-title">
            <p id="finish-title">
              Finish this admission and clear the details from this screen? Download or print the invoice first if the office needs a copy.
            </p>
            <div className="finish-confirm-actions">
              <button type="button" className="invoice-back-button" onClick={() => setConfirmFinish(false)}>
                Stay on Invoice
              </button>
              <button type="button" className="invoice-finish-button" onClick={onFinish}>
                Finish and Clear
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default InvoicePreview;
