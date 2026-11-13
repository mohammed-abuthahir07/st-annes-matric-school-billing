import { writeFileSync, mkdirSync } from 'node:fs';
import {
  calculateBilling,
  fromPaise,
  getBillingErrors,
  toPaise,
} from '../src/utils/calculations.js';
import {
  buildInvoiceView,
  createInvoiceIdentity,
  generateInvoicePdf,
} from '../src/utils/invoiceUtils.js';

const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function feeForm(overrides = {}) {
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
    paymentDate: '2026-11-13',
    transactionReference: '',
    paymentNotes: '',
    ...overrides,
  };
}

assert(toPaise('0.10') + toPaise('0.20') === 30, '0.10 + 0.20 should be 30 paise');
assert(fromPaise(30) === 0.3, '30 paise should be 0.30 rupees');

const floatSafe = calculateBilling(feeForm({
  admissionFee: '0.10',
  tuitionFee: '0.20',
}));
assert(floatSafe.subtotal === 0.3, `subtotal was ${floatSafe.subtotal}`);

const full = calculateBilling(feeForm({
  admissionFee: '1000',
  tuitionFee: '2500.50',
  termFee: '400',
  transportFee: '0',
  booksFee: '150.25',
  uniformFee: '75',
  otherCharges: '0',
  discount: '100.75',
  amountPaid: '4025',
  paymentMode: 'UPI',
  transactionReference: 'UPI123456',
}));
assert(full.subtotal === 4125.75, `full subtotal ${full.subtotal}`);
assert(full.totalPayable === 4025, `payable ${full.totalPayable}`);
assert(full.balance === 0, `balance ${full.balance}`);
assert(full.paymentStatus === 'Paid', full.paymentStatus);

const partial = calculateBilling(feeForm({
  admissionFee: '1000',
  amountPaid: '400',
  paymentMode: 'Cash',
}));
assert(partial.paymentStatus === 'Partially Paid', partial.paymentStatus);
assert(partial.balance === 600, `partial balance ${partial.balance}`);

const unpaid = calculateBilling(feeForm({ admissionFee: '800' }));
assert(unpaid.paymentStatus === 'Unpaid', unpaid.paymentStatus);
assert(unpaid.balance === 800, `unpaid balance ${unpaid.balance}`);

const zeroOptional = calculateBilling(feeForm({
  admissionFee: '500',
  tuitionFee: '0',
  transportFee: '0',
}));
assert(zeroOptional.subtotal === 500, 'zero optional fees should remain in the total');
assert(zeroOptional.feeBreakdown.length === 7, 'all fee rows should be present');
assert(getBillingErrors(feeForm({ admissionFee: '500' })).form === undefined, 'a positive fee should be accepted');

const discountTooHigh = getBillingErrors(feeForm({
  admissionFee: '100',
  discount: '150',
}));
assert(Boolean(discountTooHigh.discount), 'discount above fees should be rejected');

const overpaid = getBillingErrors(feeForm({
  admissionFee: '100',
  amountPaid: '101',
  paymentMode: 'Cash',
}));
assert(Boolean(overpaid.amountPaid), 'amount above payable should be rejected');

assert(Boolean(getBillingErrors(feeForm({ admissionFee: '-5' })).admissionFee), 'negative fees should be rejected');
assert(Boolean(getBillingErrors(feeForm({ admissionFee: '10.555' })).admissionFee), 'more than 2 decimals should be rejected');
assert(Boolean(getBillingErrors(feeForm()).form), 'all-zero fees should be rejected');
assert(
  Boolean(getBillingErrors(feeForm({ admissionFee: '100', amountPaid: '50' })).paymentMode),
  'a received amount needs a payment mode',
);

const longName = 'Aarav Krishnamurthy Venkatesan Subramaniam Pillai';
const longAddress = 'Door 18, East Car Street, Near the temple tank, Ponmeni extension, ward 12, beside the old water tank and the community hall';
const identity = createInvoiceIdentity(new Date('2026-11-13T10:15:30.250'));
const second = createInvoiceIdentity(new Date('2026-11-13T10:15:30.250'));
assert(identity.number === second.number, 'the same moment should create the same number');
assert(identity.number === 'ST-20261113-101530250', identity.number);

const scenarios = [
  {
    name: 'full',
    student: {
      studentName: 'Meera Nair',
      dob: '2016-04-12',
      gender: 'Female',
      applyingClass: 'Class 4',
      academicYear: '2026-2027',
      admissionType: 'New Admission',
      address: '12 Lake View Road',
      city: 'Madurai',
      pincode: '625016',
    },
    parent: {
      fatherName: 'Arun Nair',
      motherName: 'Lakshmi Nair',
      primaryMobile: '9876543210',
      email: 'parent@example.com',
      parentAddress: '12 Lake View Road, Madurai',
    },
    payment: feeForm({
      admissionFee: '1000',
      tuitionFee: '2500',
      termFee: '400',
      booksFee: '150',
      uniformFee: '75',
      discount: '125',
      amountPaid: '4000',
      paymentMode: 'UPI',
      transactionReference: 'UPI998877',
      paymentNotes: 'Paid at the office counter.',
    }),
  },
  {
    name: 'partial',
    student: { studentName: 'Partial Student', dob: '2015-01-02', gender: 'Male', applyingClass: 'Class 5', academicYear: '2026-2027', admissionType: 'New Admission', address: 'Short address', city: 'Madurai' },
    parent: { fatherName: 'Father Partial', motherName: 'Mother Partial', primaryMobile: '9123456780', parentAddress: 'Parent address' },
    payment: feeForm({ admissionFee: '2000', amountPaid: '500', paymentMode: 'Cash' }),
  },
  {
    name: 'unpaid',
    student: { studentName: 'Unpaid Student', dob: '2014-08-09', gender: 'Female', applyingClass: 'Class 6', academicYear: '2026-2027', admissionType: 'Transfer Admission', address: 'Address only' },
    parent: { fatherName: 'Father Unpaid', motherName: 'Mother Unpaid', primaryMobile: '9012345678', parentAddress: 'Parent address' },
    payment: feeForm({ tuitionFee: '1500' }),
  },
  {
    name: 'long',
    student: {
      studentName: longName,
      dob: '2012-02-02',
      gender: 'Male',
      applyingClass: 'Class 8',
      academicYear: '2026-2027',
      admissionType: 'Transfer Admission',
      previousSchool: 'A very long previous school name that should wrap inside the invoice',
      address: longAddress,
      city: 'Madurai',
      pincode: '625001',
    },
    parent: {
      fatherName: 'Father With A Long Family Name That Should Wrap Cleanly',
      motherName: 'Mother With A Long Family Name That Should Wrap Cleanly',
      primaryMobile: '9988776655',
      alternateMobile: '9876501234',
      parentAddress: `${longAddress}, additional landmark near the north gate and the school bus stop`,
    },
    payment: feeForm({
      admissionFee: '0',
      tuitionFee: '1000.50',
      termFee: '0',
      transportFee: '250',
      booksFee: '0',
      uniformFee: '0',
      otherCharges: '25.50',
      discount: '50',
      amountPaid: '700',
      paymentMode: 'Bank Transfer',
      transactionReference: 'NEFT-LONG-REFERENCE-2026-00091',
      paymentNotes: 'Collected in two parts at the counter. '.repeat(30),
    }),
  },
];

mkdirSync('scripts/output', { recursive: true });

for (const scenario of scenarios) {
  const view = buildInvoiceView({
    student: scenario.student,
    parent: scenario.parent,
    payment: scenario.payment,
    invoiceNumber: identity.number,
    invoiceDate: identity.date,
  });
  const previewTotal = view.totals.totalPayable;
  const billing = calculateBilling(scenario.payment);
  assert(previewTotal === billing.totalPayable, `${scenario.name} preview drifted from billing`);
  assert(view.invoiceNumber === identity.number, `${scenario.name} invoice number changed`);
  assert(view.fees.length === 7, `${scenario.name} fee rows missing`);

  const doc = await generateInvoicePdf(view);
  const pages = doc.getNumberOfPages();
  const output = doc.output();
  assert(pages >= 1, `${scenario.name} produced no pages`);
  assert(output.length > 2000, `${scenario.name} PDF was too small`);
  assert(output.includes(scenario.student.studentName), `${scenario.name} PDF metadata missed the student name`);
  assert(output.includes(identity.number), `${scenario.name} PDF metadata missed the invoice number`);
  writeFileSync(`scripts/output/${scenario.name}.pdf`, Buffer.from(doc.output('arraybuffer')));
  console.log(`${scenario.name}: ${pages} page(s), ${output.length} chars, status ${view.paymentStatus}, payable ${view.totals.totalPayable}, balance ${view.totals.balance}`);
}

const longDoc = await generateInvoicePdf(buildInvoiceView({
  student: scenarios[3].student,
  parent: scenarios[3].parent,
  payment: scenarios[3].payment,
  invoiceNumber: identity.number,
  invoiceDate: identity.date,
}));
assert(longDoc.getNumberOfPages() >= 2, `long invoice should continue to another page, got ${longDoc.getNumberOfPages()}`);

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('Billing and PDF checks passed.');
