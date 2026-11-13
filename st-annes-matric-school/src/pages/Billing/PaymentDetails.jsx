import { useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Calculator,
  CreditCard,
  IndianRupee,
  Receipt,
  UserRound,
  Wallet,
} from 'lucide-react';
import {
  FEE_FIELDS,
  PAYMENT_MODES,
  calculateBilling,
  emptyPaymentForm,
  focusFirstInvalid,
  formatInr,
  getBillingErrors,
} from '../../utils/calculations';
import './PaymentDetails.css';

function PaymentDetails({ onBack, onNext, paymentData, studentData }) {
  const [form, setForm] = useState(() => ({
    ...emptyPaymentForm(),
    ...(paymentData || {}),
  }));
  const [errors, setErrors] = useState({});

  const totals = useMemo(() => calculateBilling(form), [form]);
  const statusLabel = totals.paymentStatus;

  const updateField = (name, value) => {
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: '',
      form: '',
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = getBillingErrors(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      focusFirstInvalid(nextErrors);
      return;
    }

    onNext({
      ...form,
      transactionReference: form.transactionReference.trim(),
      paymentNotes: form.paymentNotes.trim(),
    });
  };

  return (
    <main className="payment-page">
      <div className="payment-container">
        <div className="payment-topbar">
          <button
            type="button"
            className="payment-back-link"
            onClick={() => onBack(form)}
          >
            <ArrowLeft size={18} />
            Back to Parent Details
          </button>

          <span className="payment-step-label">
            STEP 3 OF 4 · PAYMENT DETAILS
          </span>
        </div>

        <div className="payment-heading">
          <div>
            <span className="payment-eyebrow">ADMISSION PROCESS</span>
            <h1>Fee & Payment Details</h1>
            <p>
              Enter the fees for this admission. Totals, discount, and balance update as you type.
            </p>
          </div>

          <div className="payment-heading-icon" aria-hidden="true">
            <Receipt size={27} />
          </div>
        </div>

        <div className="payment-progress" aria-label="Admission progress">
          <div className="progress-item completed">
            <span>1</span>
            Student
          </div>
          <div className="progress-line completed-line" />
          <div className="progress-item completed">
            <span>2</span>
            Parent
          </div>
          <div className="progress-line completed-line" />
          <div className="progress-item active">
            <span>3</span>
            Payment
          </div>
          <div className="progress-line" />
          <div className="progress-item">
            <span>4</span>
            Invoice
          </div>
        </div>

        {studentData?.studentName && (
          <div className="payment-student">
            <div className="payment-student-icon" aria-hidden="true">
              <UserRound size={18} />
            </div>
            <div>
              <span>Registering student</span>
              <strong>{studentData.studentName}</strong>
              <p>
                {studentData.applyingClass || 'Class not selected'}
                {' · '}
                {studentData.academicYear || ''}
              </p>
            </div>
          </div>
        )}

        {errors.form && (
          <div className="payment-error-banner" role="alert">{errors.form}</div>
        )}

        <form onSubmit={handleSubmit} autoComplete="off" noValidate>
          <section className="payment-card">
            <div className="payment-section-heading">
              <div className="section-icon" aria-hidden="true">
                <Calculator size={20} />
              </div>
              <div>
                <h2>Fee Breakdown</h2>
                <p>Enter the fee amounts for this student. Use zero when a fee does not apply.</p>
              </div>
            </div>

            <div className="fee-grid">
              {FEE_FIELDS.map((field) => (
                <div className="fee-field" key={field.key}>
                  <label htmlFor={field.key}>{field.label}</label>
                  <div className="rupee-input">
                    <span aria-hidden="true">₹</span>
                    <input
                      id={field.key}
                      type="number"
                      min="0"
                      step="0.01"
                      inputMode="decimal"
                      value={form[field.key]}
                      aria-invalid={Boolean(errors[field.key])}
                      aria-describedby={errors[field.key] ? `${field.key}-error` : undefined}
                      onChange={(event) => updateField(field.key, event.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  {errors[field.key] && (
                    <small id={`${field.key}-error`} className="field-error">
                      {errors[field.key]}
                    </small>
                  )}
                </div>
              ))}
            </div>

            <div className="discount-field">
              <div>
                <label htmlFor="discount">Discount Amount</label>
                <p>Enter the discount in rupees. It cannot be more than the total fees.</p>
              </div>
              <div className="rupee-input discount-input">
                <span aria-hidden="true">₹</span>
                <input
                  id="discount"
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  value={form.discount}
                  aria-invalid={Boolean(errors.discount || totals.discountTooHigh)}
                  aria-describedby={errors.discount ? 'discount-error' : undefined}
                  onChange={(event) => updateField('discount', event.target.value)}
                />
              </div>
            </div>
            {errors.discount && (
              <small id="discount-error" className="field-error">{errors.discount}</small>
            )}
            {!errors.discount && totals.discountTooHigh && (
              <small className="field-warning">
                Discount cannot exceed total fees of {formatInr(totals.subtotal)}.
              </small>
            )}
          </section>

          <section className="payment-card">
            <div className="payment-section-heading">
              <div className="section-icon" aria-hidden="true">
                <Wallet size={20} />
              </div>
              <div>
                <h2>Payment Information</h2>
                <p>Record the amount received. Leave it at zero if no payment is taken today.</p>
              </div>
            </div>

            <div className="payment-form-grid">
              <div className="fee-field">
                <label htmlFor="amountPaid">Amount Received (₹)</label>
                <div className="rupee-input">
                  <span aria-hidden="true">₹</span>
                  <input
                    id="amountPaid"
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    value={form.amountPaid}
                    aria-invalid={Boolean(errors.amountPaid || totals.receivedTooHigh)}
                    aria-describedby={errors.amountPaid ? 'amountPaid-error' : undefined}
                    onChange={(event) => updateField('amountPaid', event.target.value)}
                  />
                </div>
                {errors.amountPaid && (
                  <small id="amountPaid-error" className="field-error">{errors.amountPaid}</small>
                )}
                {!errors.amountPaid && totals.receivedTooHigh && (
                  <small className="field-warning">
                    Amount received cannot exceed total payable of {formatInr(totals.totalPayable)} (Over by {formatInr(totals.excess)}).
                  </small>
                )}
              </div>

              <div className="fee-field">
                <label htmlFor="paymentMode">Payment Mode</label>
                <select
                  id="paymentMode"
                  value={form.paymentMode}
                  aria-invalid={Boolean(errors.paymentMode)}
                  aria-describedby={errors.paymentMode ? 'paymentMode-error' : undefined}
                  onChange={(event) => updateField('paymentMode', event.target.value)}
                >
                  <option value="">Select payment mode</option>
                  {PAYMENT_MODES.map((mode) => (
                    <option key={mode} value={mode}>{mode}</option>
                  ))}
                </select>
                {errors.paymentMode && (
                  <small id="paymentMode-error" className="field-error">{errors.paymentMode}</small>
                )}
              </div>

              <div className="fee-field">
                <label htmlFor="paymentDate">Payment Date</label>
                <input
                  id="paymentDate"
                  type="date"
                  value={form.paymentDate}
                  aria-invalid={Boolean(errors.paymentDate)}
                  aria-describedby={errors.paymentDate ? 'paymentDate-error' : undefined}
                  onChange={(event) => updateField('paymentDate', event.target.value)}
                />
                {errors.paymentDate && (
                  <small id="paymentDate-error" className="field-error">{errors.paymentDate}</small>
                )}
              </div>

              <div className="fee-field">
                <label htmlFor="transactionReference">
                  Transaction Reference
                  <span className="optional-label"> (Optional)</span>
                </label>
                <input
                  id="transactionReference"
                  type="text"
                  maxLength={80}
                  value={form.transactionReference}
                  onChange={(event) => updateField('transactionReference', event.target.value)}
                  placeholder="UPI or bank reference, if available"
                />
              </div>
            </div>

            <div className="fee-field payment-notes-field">
              <label htmlFor="paymentNotes">Payment Notes (Optional)</label>
              <textarea
                id="paymentNotes"
                rows="3"
                maxLength={400}
                value={form.paymentNotes}
                onChange={(event) => updateField('paymentNotes', event.target.value)}
                placeholder="Any additional payment information"
              />
            </div>
          </section>

          <section className="payment-summary-card" aria-live="polite">
            <div className="summary-heading">
              <div>
                <span className="summary-eyebrow">INVOICE SUMMARY</span>
                <h2>Payment Summary</h2>
              </div>
              <IndianRupee size={25} aria-hidden="true" />
            </div>

            <div className="summary-row">
              <span>Total Fees</span>
              <strong>{formatInr(totals.subtotal)}</strong>
            </div>

            <div className="summary-row discount-summary">
              <span>Discount</span>
              <strong>- {formatInr(totals.discount)}</strong>
            </div>

            <div className="summary-row total-row">
              <span>Total Payable</span>
              <strong>{formatInr(totals.totalPayable)}</strong>
            </div>

            <div className="summary-row">
              <span>Amount Received</span>
              <strong>{formatInr(totals.amountPaid)}</strong>
            </div>

            <div className={`summary-balance ${totals.receivedTooHigh ? 'summary-balance-excess' : ''}`}>
              <div>
                <span>Balance Due</span>
                <small>Total payable minus amount received</small>
              </div>
              <strong>{formatInr(totals.balance)}</strong>
            </div>

            {totals.receivedTooHigh && (
              <div className="summary-excess-alert" role="alert">
                <AlertCircle size={20} aria-hidden="true" />
                <div>
                  <strong>Excess Amount: {formatInr(totals.excess)}</strong>
                  <p>
                    Amount received is {formatInr(totals.excess)} greater than total payable ({formatInr(totals.totalPayable)}).
                    Please correct amount received to match or be less than total payable.
                  </p>
                </div>
              </div>
            )}

            <div className="summary-status">
              <span>Payment Status</span>
              <span
                className={`status-pill ${
                  statusLabel === 'Paid'
                    ? 'status-paid'
                    : statusLabel === 'Partially Paid'
                      ? 'status-partial'
                      : statusLabel === 'Unpaid'
                        ? 'status-unpaid'
                        : 'status-review'
                }`}
              >
                {statusLabel}
              </span>
            </div>
          </section>

          <div className="payment-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() => onBack(form)}
            >
              <ArrowLeft size={17} />
              Previous
            </button>

            <button type="submit" className="primary-button">
              Continue to Invoice
              <ArrowRight size={18} />
            </button>
          </div>
        </form>

        <p className="payment-footer-note">
          <CreditCard size={15} />
          Check the fee amounts before the invoice is prepared.
        </p>
      </div>
    </main>
  );
}

export default PaymentDetails;
