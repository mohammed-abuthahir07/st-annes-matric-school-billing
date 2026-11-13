
import { useState } from 'react';
import {
  GraduationCap,
  UserRound,
  Users,
  CreditCard,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2
} from 'lucide-react';
import { focusFirstInvalid, localIsoDate } from '../../utils/calculations';
import './Registration.css';

const initialStudent = {
  studentName: '',
  dob: '',
  gender: '',
  bloodGroup: '',
  applyingClass: '',
  academicYear: '2026-2027',
  admissionType: 'New Admission',
  previousSchool: '',
  address: '',
  city: '',
  pincode: ''
};

const today = localIsoDate();

function Registration({ onBack, onNext, studentData }) {
  const [form, setForm] = useState({
    ...initialStudent,
    ...studentData
  });

  const [errors, setErrors] = useState({});

  const updateField = (event) => {
    const { name } = event.target;
    let { value } = event.target;

    if (name === 'pincode') {
      value = value.replace(/\D/g, '').slice(0, 6);
    }

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: '',
      form: ''
    }));
  };

  const collectErrors = () => {
    const nextErrors = {};

    if (!form.studentName.trim()) {
      nextErrors.studentName = 'Student name is required.';
    }

    if (!form.dob) {
      nextErrors.dob = 'Date of birth is required.';
    } else if (form.dob > today) {
      nextErrors.dob = 'Date of birth cannot be in the future.';
    }

    if (!form.gender) {
      nextErrors.gender = 'Select a gender.';
    }

    if (!form.applyingClass) {
      nextErrors.applyingClass = 'Select the applying class.';
    }

    if (!form.academicYear) {
      nextErrors.academicYear = 'Academic year is required.';
    }

    if (!form.address.trim()) {
      nextErrors.address = 'Address is required.';
    }

    if (!form.city.trim()) {
      nextErrors.city = 'City is required.';
    }

    if (form.pincode && !/^\d{6}$/.test(form.pincode)) {
      nextErrors.pincode = 'Enter a valid 6-digit PIN code, or leave it blank.';
    }

    return nextErrors;
  };

  const handleContinue = (event) => {
    event.preventDefault();
    const nextErrors = collectErrors();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      focusFirstInvalid(nextErrors);
      return;
    }

    onNext({
      ...form,
      studentName: form.studentName.trim(),
      previousSchool: form.previousSchool.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      pincode: form.pincode.trim()
    });
  };

  return (
    <main className="registration-page">

      <header className="registration-header">
        <button type="button" className="back-home" onClick={onBack}>
          <ArrowLeft size={18} />
          Back to Home
        </button>

        <div className="registration-brand">
          <GraduationCap size={27} />
          <div>
            <strong>ST. ANNES MATRIC SCHOOL</strong>
            <span>ADMISSION REGISTRATION</span>
          </div>
        </div>

        <div className="header-tag">New Admission</div>
      </header>

      <div className="registration-container">

        <div className="registration-heading">
          <span className="step-label">ADMISSION PROCESS</span>

          <h1>Student Registration</h1>

          <p>
            Let's start by entering the student's personal
            and academic information.
          </p>
        </div>

        <div className="stepper" aria-label="Admission progress">

          <div className="stepper-item active">
            <div className="step-circle">
              <UserRound size={19} />
            </div>
            <span>Student Details</span>
          </div>

          <div className="step-line"></div>

          <div className="stepper-item">
            <div className="step-circle">
              <Users size={19} />
            </div>
            <span>Parent Details</span>
          </div>

          <div className="step-line"></div>

          <div className="stepper-item">
            <div className="step-circle">
              <CreditCard size={19} />
            </div>
            <span>Payment Details</span>
          </div>

          <div className="step-line"></div>

          <div className="stepper-item">
            <div className="step-circle">
              <CheckCircle2 size={19} />
            </div>
            <span>Invoice</span>
          </div>

        </div>

        <form className="registration-card" onSubmit={handleContinue} autoComplete="off" noValidate>

          <div className="form-section-heading">
            <div className="section-icon">
              <UserRound size={21} />
            </div>

            <div>
              <h2>Personal Information</h2>
              <p>Enter the student's basic information.</p>
            </div>
          </div>

          <div className="form-grid">

            <div className="form-field full-width">
              <label htmlFor="studentName">Student Full Name <span aria-hidden="true">*</span></label>
              <input
                id="studentName"
                name="studentName"
                value={form.studentName}
                onChange={updateField}
                placeholder="Enter the student's full name"
                maxLength={180}
                required
                aria-invalid={Boolean(errors.studentName)}
                aria-describedby={errors.studentName ? 'studentName-error' : undefined}
              />
              {errors.studentName && (
                <small id="studentName-error" className="field-error">{errors.studentName}</small>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="dob">Date of Birth <span aria-hidden="true">*</span></label>
              <div className="input-with-icon">
                <CalendarDays size={18} aria-hidden="true" />
                <input
                  id="dob"
                  type="date"
                  name="dob"
                  value={form.dob}
                  max={today}
                  onChange={updateField}
                  required
                  aria-invalid={Boolean(errors.dob)}
                  aria-describedby={errors.dob ? 'dob-error' : undefined}
                />
              </div>
              {errors.dob && (
                <small id="dob-error" className="field-error">{errors.dob}</small>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="gender">Gender <span aria-hidden="true">*</span></label>
              <select
                id="gender"
                name="gender"
                value={form.gender}
                onChange={updateField}
                required
                aria-invalid={Boolean(errors.gender)}
                aria-describedby={errors.gender ? 'gender-error' : undefined}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && (
                <small id="gender-error" className="field-error">{errors.gender}</small>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="bloodGroup">Blood Group</label>
              <select
                id="bloodGroup"
                name="bloodGroup"
                value={form.bloodGroup}
                onChange={updateField}
              >
                <option value="">Select Blood Group</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(
                  (group) => (
                    <option key={group} value={group}>{group}</option>
                  )
                )}
              </select>
            </div>

          </div>

          <div className="form-divider"></div>

          <div className="form-section-heading">
            <div className="section-icon">
              <GraduationCap size={21} />
            </div>

            <div>
              <h2>Admission Information</h2>
              <p>Enter the student's admission details.</p>
            </div>
          </div>

          <div className="form-grid">

            <div className="form-field">
              <label htmlFor="applyingClass">Applying for Class <span aria-hidden="true">*</span></label>
              <select
                id="applyingClass"
                name="applyingClass"
                value={form.applyingClass}
                onChange={updateField}
                required
                aria-invalid={Boolean(errors.applyingClass)}
                aria-describedby={errors.applyingClass ? 'applyingClass-error' : undefined}
              >
                <option value="">Select Class</option>
                {[
                  'Pre-KG', 'LKG', 'UKG',
                  'Class 1', 'Class 2', 'Class 3',
                  'Class 4', 'Class 5', 'Class 6',
                  'Class 7', 'Class 8', 'Class 9',
                  'Class 10', 'Class 11', 'Class 12'
                ].map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
              {errors.applyingClass && (
                <small id="applyingClass-error" className="field-error">{errors.applyingClass}</small>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="academicYear">Academic Year <span aria-hidden="true">*</span></label>
              <select
                id="academicYear"
                name="academicYear"
                value={form.academicYear}
                onChange={updateField}
                required
                aria-invalid={Boolean(errors.academicYear)}
                aria-describedby={errors.academicYear ? 'academicYear-error' : undefined}
              >
                <option value="2026-2027">2026 - 2027</option>
                <option value="2027-2028">2027 - 2028</option>
                <option value="2028-2029">2028 - 2029</option>
              </select>
              {errors.academicYear && (
                <small id="academicYear-error" className="field-error">{errors.academicYear}</small>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="admissionType">Admission Type</label>
              <select
                id="admissionType"
                name="admissionType"
                value={form.admissionType}
                onChange={updateField}
              >
                <option value="New Admission">New Admission</option>
                <option value="Transfer Admission">Transfer Admission</option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="previousSchool">Previous School</label>
              <input
                id="previousSchool"
                name="previousSchool"
                value={form.previousSchool}
                onChange={updateField}
                maxLength={180}
                placeholder="Enter the previous school name"
              />
            </div>

          </div>

          <div className="form-divider"></div>

          <div className="form-section-heading">
            <div className="section-icon">
              <GraduationCap size={21} />
            </div>

            <div>
              <h2>Residential Address</h2>
              <p>Enter the student's current residential address.</p>
            </div>
          </div>

          <div className="form-grid">

            <div className="form-field full-width">
              <label htmlFor="address">Full Address <span aria-hidden="true">*</span></label>
              <textarea
                id="address"
                name="address"
                value={form.address}
                onChange={updateField}
                placeholder="House number, street, area"
                rows={3}
                maxLength={600}
                required
                aria-invalid={Boolean(errors.address)}
                aria-describedby={errors.address ? 'address-error' : undefined}
              />
              {errors.address && (
                <small id="address-error" className="field-error">{errors.address}</small>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="city">City / Town <span aria-hidden="true">*</span></label>
              <input
                id="city"
                name="city"
                value={form.city}
                onChange={updateField}
                placeholder="Enter the city"
                maxLength={80}
                required
                aria-invalid={Boolean(errors.city)}
                aria-describedby={errors.city ? 'city-error' : undefined}
              />
              {errors.city && (
                <small id="city-error" className="field-error">{errors.city}</small>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="pincode">PIN Code</label>
              <input
                id="pincode"
                name="pincode"
                value={form.pincode}
                onChange={updateField}
                placeholder="6-digit PIN code"
                maxLength={6}
                inputMode="numeric"
                aria-invalid={Boolean(errors.pincode)}
                aria-describedby={errors.pincode ? 'pincode-error' : undefined}
              />
              {errors.pincode && (
                <small id="pincode-error" className="field-error">{errors.pincode}</small>
              )}
            </div>

          </div>

          <div className="form-footer">
            <div className="required-note">
              <span>*</span> Required fields
            </div>

            <button type="submit" className="continue-button">
              Continue to Parent Details
              <ArrowRight size={18} />
            </button>
          </div>

        </form>

        <p className="registration-footer">
          ST. ANNES MATRIC SCHOOL · ADMISSION & BILLING SYSTEM
        </p>

      </div>
    </main>
  );
}

export default Registration;
