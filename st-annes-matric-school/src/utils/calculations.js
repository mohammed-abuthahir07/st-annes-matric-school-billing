export const FEE_FIELDS = [
  { key: 'admissionFee', label: 'Admission Fee' },
  { key: 'tuitionFee', label: 'Tuition Fee' },
  { key: 'termFee', label: 'Term Fee' },
  { key: 'transportFee', label: 'Transport Fee' },
  { key: 'booksFee', label: 'Books Fee' },
  { key: 'uniformFee', label: 'Uniform Fee' },
  { key: 'otherCharges', label: 'Other Charges' },
];

export const PAYMENT_MODES = ['Cash', 'UPI', 'Bank Transfer'];

export function localIsoDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function emptyPaymentForm() {
  return {
    admissionFee: '0',
    tuitionFee: '0',
    termFee: '0',
    transportFee: '0',
    booksFee: '0',
    uniformFee: '0',
    otherCharges: '0',
    discount: '0',
    amountPaid: '0',
    paymentMode: '',
    paymentDate: localIsoDate(),
    transactionReference: '',
    paymentNotes: '',
  };
}

export function isValidMoney(value) {
  if (typeof value === 'number') {
    if (!Number.isFinite(value) || value < 0) return false;
    const rounded = Number(value.toFixed(2));
    return Math.abs(rounded - value) < 0.001;
  }

  return /^\d+(\.\d{1,2})?$/.test(String(value ?? '').trim());
}

export function toPaise(value) {
  if (!isValidMoney(value)) return Number.NaN;

  const text = typeof value === 'number'
    ? value.toFixed(2)
    : String(value).trim();
  const [whole, fraction = ''] = text.split('.');
  const cents = `${fraction}00`.slice(0, 2);

  return (Number(whole) * 100) + Number(cents);
}

export function fromPaise(paise) {
  const negative = paise < 0;
  const absolute = Math.abs(paise);
  const rupees = Math.trunc(absolute / 100);
  const fraction = String(absolute % 100).padStart(2, '0');
  const amount = Number(`${rupees}.${fraction}`);
  return negative ? -amount : amount;
}

export function formatInr(value) {
  const amount = Number.isFinite(value) ? value : 0;

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatInrPlain(value) {
  const amount = Number.isFinite(value) ? value : 0;
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));

  return amount < 0 ? `- INR ${formatted}` : `INR ${formatted}`;
}

export function formatLongDate(isoDate) {
  if (!isoDate) return '—';

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(isoDate));
  if (!match) return '—';

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    Number.isNaN(date.getTime())
    || date.getFullYear() !== year
    || date.getMonth() + 1 !== month
    || date.getDate() !== day
  ) {
    return '—';
  }

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function calculateBilling(form = {}) {
  const items = FEE_FIELDS.map((field) => {
    const paise = toPaise(form[field.key]);
    const valid = Number.isFinite(paise);

    return {
      key: field.key,
      label: field.label,
      paise: valid ? paise : 0,
      amount: valid ? fromPaise(paise) : 0,
      valid,
    };
  });

  const feesValid = items.every((item) => item.valid);
  const subtotalPaise = items.reduce((sum, item) => sum + item.paise, 0);
  const discountPaise = toPaise(form.discount);
  const discountValid = Number.isFinite(discountPaise);
  const safeDiscountPaise = discountValid ? discountPaise : 0;
  const amountPaidPaise = toPaise(form.amountPaid);
  const amountValid = Number.isFinite(amountPaidPaise);
  const safePaidPaise = amountValid ? amountPaidPaise : 0;

  const discountTooHigh = feesValid && discountValid && safeDiscountPaise > subtotalPaise;
  const totalPayablePaise = Math.max(0, subtotalPaise - safeDiscountPaise);

  const receivedTooHigh = feesValid
    && discountValid
    && amountValid
    && !discountTooHigh
    && safePaidPaise > totalPayablePaise;

  const balancePaise = Math.max(0, totalPayablePaise - safePaidPaise);
  const excessPaise = Math.max(0, safePaidPaise - totalPayablePaise);

  let paymentStatus = 'Unpaid';

  if (feesValid && discountValid && amountValid && !discountTooHigh && !receivedTooHigh) {
    if (safePaidPaise > 0 && balancePaise === 0) {
      paymentStatus = 'Paid';
    } else if (safePaidPaise > 0 && balancePaise > 0) {
      paymentStatus = 'Partially Paid';
    }
  } else if (receivedTooHigh) {
    paymentStatus = 'Exceeds Payable';
  } else if (discountTooHigh) {
    paymentStatus = 'Excess Discount';
  }

  return {
    items,
    feeBreakdown: items.map((item) => ({
      key: item.key,
      label: item.label,
      amount: item.amount,
    })),
    subtotal: fromPaise(subtotalPaise),
    discount: fromPaise(safeDiscountPaise),
    totalPayable: fromPaise(totalPayablePaise),
    amountPaid: fromPaise(safePaidPaise),
    balance: fromPaise(balancePaise),
    excess: fromPaise(excessPaise),
    rawBalance: fromPaise(totalPayablePaise - safePaidPaise),
    subtotalPaise,
    discountPaise: safeDiscountPaise,
    totalPayablePaise,
    amountPaidPaise: safePaidPaise,
    balancePaise,
    excessPaise,
    paymentStatus,
    feesValid,
    discountValid,
    amountValid,
    discountTooHigh,
    receivedTooHigh,
  };
}

export function getBillingErrors(form = {}) {
  const errors = {};
  const totals = calculateBilling(form);

  FEE_FIELDS.forEach((field) => {
    if (!isValidMoney(form[field.key])) {
      errors[field.key] = `${field.label} must be zero or more, with up to 2 decimal places.`;
    }
  });

  if (!isValidMoney(form.discount)) {
    errors.discount = 'Discount must be zero or more, with up to 2 decimal places.';
  } else if (totals.discountTooHigh) {
    errors.discount = `Discount cannot exceed total fees of ${formatInr(totals.subtotal)}.`;
  }

  if (!isValidMoney(form.amountPaid)) {
    errors.amountPaid = 'Amount received must be zero or more, with up to 2 decimal places.';
  } else if (totals.receivedTooHigh) {
    errors.amountPaid = `Amount received cannot exceed total payable of ${formatInr(totals.totalPayable)} (Exceeds by ${formatInr(totals.excess)}).`;
  }

  if (totals.feesValid && totals.subtotalPaise <= 0) {
    errors.form = 'Enter at least one fee amount greater than zero.';
  }

  const paidPaise = isValidMoney(form.amountPaid) ? toPaise(form.amountPaid) : 0;

  if (paidPaise > 0 && !form.paymentMode) {
    errors.paymentMode = 'Select a payment mode.';
  } else if (paidPaise > 0 && !PAYMENT_MODES.includes(form.paymentMode)) {
    errors.paymentMode = 'Select a valid payment mode.';
  }

  if (paidPaise > 0 && !form.paymentDate) {
    errors.paymentDate = 'Select the payment date.';
  }

  return errors;
}

export function focusFirstInvalid(errors) {
  const key = Object.keys(errors).find((name) => name !== 'form') || 'admissionFee';
  const field = document.getElementById(key);

  if (!field) return;

  field.scrollIntoView({ behavior: 'smooth', block: 'center' });
  field.focus({ preventScroll: true });
}
