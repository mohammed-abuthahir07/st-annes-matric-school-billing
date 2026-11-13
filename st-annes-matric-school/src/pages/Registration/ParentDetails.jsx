
import { useState } from 'react';
import {
  Users,
  UserRound,
  Phone,
  Mail,
  MapPin,
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  ShieldCheck
} from 'lucide-react';

import { focusFirstInvalid } from '../../utils/calculations';
import './ParentDetails.css';

const initialParent = {
  fatherName: '',
  fatherOccupation: '',
  motherName: '',
  motherOccupation: '',
  primaryMobile: '',
  alternateMobile: '',
  whatsappNumber: '',
  email: '',
  emergencyName: '',
  emergencyMobile: '',
  parentAddress: ''
};

function ParentDetails({
  onBack,
  onNext,
  parentData,
  studentData
}) {
  const [form, setForm] = useState({
    ...initialParent,
    ...parentData
  });

  const [errors, setErrors] = useState({});

  const phoneFields = ['primaryMobile', 'alternateMobile', 'whatsappNumber', 'emergencyMobile'];

  const updateField = (event) => {
    const { name } = event.target;
    let { value } = event.target;

    if (phoneFields.includes(name)) {
      value = value.replace(/\D/g, '').slice(0, 10);
    }

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: ''
    }));
  };

  const collectErrors = () => {
    const nextErrors = {};
    const mobilePattern = /^[6-9]\d{9}$/;

    if (!form.fatherName.trim()) {
      nextErrors.fatherName = "Father's name is required.";
    }

    if (!form.motherName.trim()) {
      nextErrors.motherName = "Mother's name is required.";
    }

    if (!mobilePattern.test(form.primaryMobile)) {
      nextErrors.primaryMobile = 'Enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.';
    }

    if (form.alternateMobile && !mobilePattern.test(form.alternateMobile)) {
      nextErrors.alternateMobile = 'Enter a valid 10-digit mobile number, or leave it blank.';
    }

    if (form.whatsappNumber && !mobilePattern.test(form.whatsappNumber)) {
      nextErrors.whatsappNumber = 'Enter a valid 10-digit WhatsApp number, or leave it blank.';
    }

    if (form.emergencyMobile && !mobilePattern.test(form.emergencyMobile)) {
      nextErrors.emergencyMobile = 'Enter a valid 10-digit mobile number, or leave it blank.';
    }

    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = 'Enter a valid email address, or leave it blank.';
    }

    if (!form.parentAddress.trim()) {
      nextErrors.parentAddress = 'Parent address is required.';
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
      fatherName: form.fatherName.trim(),
      fatherOccupation: form.fatherOccupation.trim(),
      motherName: form.motherName.trim(),
      motherOccupation: form.motherOccupation.trim(),
      email: form.email.trim(),
      emergencyName: form.emergencyName.trim(),
      parentAddress: form.parentAddress.trim()
    });
  };

  const goBack = () => onBack(form);

  return (
    <main className="parent-page">

      <header className="parent-header">
        <div className="parent-brand">
          <div className="parent-brand-icon">
            <Users size={25} />
          </div>

          <div>
            <strong>ST. ANNES MATRIC SCHOOL</strong>
            <span>ADMISSION REGISTRATION</span>
          </div>
        </div>

        <button type="button" className="parent-back-home" onClick={goBack}>
          <ArrowLeft size={17} />
          Previous Step
        </button>
      </header>

      <div className="parent-container">

        <div className="parent-heading">
          <span className="parent-step-label">
            ADMISSION PROCESS · STEP 02
          </span>

          <h1>Parent / Guardian Details</h1>

          <p>
            Please provide the parent or guardian information
            for the registered student.
          </p>
        </div>

        <div className="parent-student-info">
          <div className="student-avatar">
            <UserRound size={22} />
          </div>

          <div>
            <span>REGISTERING STUDENT</span>
            <h3>{studentData?.studentName || 'Student'}</h3>
            <p>
              {studentData?.applyingClass || 'Class not selected'}
              {' · '}
              {studentData?.academicYear || ''}
            </p>
          </div>

          <ShieldCheck className="student-verified" size={23} />
        </div>

        <form className="parent-card" onSubmit={handleContinue} autoComplete="off" noValidate>

          <div className="parent-section-heading">
            <div className="parent-section-icon">
              <UserRound size={21} />
            </div>

            <div>
              <h2>Father's Information</h2>
              <p>Enter father's personal details.</p>
            </div>
          </div>

          <div className="parent-grid">

            <div className="parent-field">
              <label htmlFor="fatherName">Father's Full Name <span aria-hidden="true">*</span></label>

              <input
                id="fatherName"
                name="fatherName"
                value={form.fatherName}
                onChange={updateField}
                maxLength={180}
                required
                placeholder="Enter father's full name"
                aria-invalid={Boolean(errors.fatherName)}
                aria-describedby={errors.fatherName ? 'fatherName-error' : undefined}
              />

              {errors.fatherName && (
                <small id="fatherName-error">{errors.fatherName}</small>
              )}
            </div>

            <div className="parent-field">
              <label htmlFor="fatherOccupation">Father's Occupation</label>

              <div className="parent-input-icon">
                <BriefcaseBusiness size={17} aria-hidden="true" />
                <input
                  id="fatherOccupation"
                  name="fatherOccupation"
                  value={form.fatherOccupation}
                  onChange={updateField}
                  maxLength={80}
                  placeholder="Enter occupation"
                />
              </div>
            </div>

          </div>

          <div className="parent-divider"></div>

          <div className="parent-section-heading">
            <div className="parent-section-icon">
              <Users size={21} />
            </div>

            <div>
              <h2>Mother's Information</h2>
              <p>Enter mother's personal details.</p>
            </div>
          </div>

          <div className="parent-grid">

            <div className="parent-field">
              <label htmlFor="motherName">Mother's Full Name <span aria-hidden="true">*</span></label>

              <input
                id="motherName"
                name="motherName"
                value={form.motherName}
                onChange={updateField}
                maxLength={180}
                required
                placeholder="Enter mother's full name"
                aria-invalid={Boolean(errors.motherName)}
                aria-describedby={errors.motherName ? 'motherName-error' : undefined}
              />

              {errors.motherName && (
                <small id="motherName-error">{errors.motherName}</small>
              )}
            </div>

            <div className="parent-field">
              <label htmlFor="motherOccupation">Mother's Occupation</label>

              <div className="parent-input-icon">
                <BriefcaseBusiness size={17} aria-hidden="true" />
                <input
                  id="motherOccupation"
                  name="motherOccupation"
                  value={form.motherOccupation}
                  onChange={updateField}
                  maxLength={80}
                  placeholder="Enter occupation"
                />
              </div>
            </div>

          </div>

          <div className="parent-divider"></div>

          <div className="parent-section-heading">
            <div className="parent-section-icon">
              <Phone size={21} />
            </div>

            <div>
              <h2>Contact Information</h2>
              <p>Provide the contact information of the family.</p>
            </div>
          </div>

          <div className="parent-grid">

            <div className="parent-field">
              <label htmlFor="primaryMobile">Primary Mobile Number <span aria-hidden="true">*</span></label>

              <input
                id="primaryMobile"
                type="tel"
                name="primaryMobile"
                value={form.primaryMobile}
                onChange={updateField}
                placeholder="10-digit mobile number"
                maxLength={10}
                inputMode="numeric"
                required
                aria-invalid={Boolean(errors.primaryMobile)}
                aria-describedby={errors.primaryMobile ? 'primaryMobile-error' : undefined}
              />

              {errors.primaryMobile && (
                <small id="primaryMobile-error">{errors.primaryMobile}</small>
              )}
            </div>

            <div className="parent-field">
              <label htmlFor="alternateMobile">Alternate Mobile Number</label>

              <input
                id="alternateMobile"
                type="tel"
                name="alternateMobile"
                value={form.alternateMobile}
                onChange={updateField}
                placeholder="Optional alternate number"
                maxLength={10}
                inputMode="numeric"
                aria-invalid={Boolean(errors.alternateMobile)}
                aria-describedby={errors.alternateMobile ? 'alternateMobile-error' : undefined}
              />

              {errors.alternateMobile && (
                <small id="alternateMobile-error">{errors.alternateMobile}</small>
              )}
            </div>

            <div className="parent-field">
              <label htmlFor="whatsappNumber">WhatsApp Number</label>

              <input
                id="whatsappNumber"
                type="tel"
                name="whatsappNumber"
                value={form.whatsappNumber}
                onChange={updateField}
                placeholder="Optional WhatsApp number"
                maxLength={10}
                inputMode="numeric"
                aria-invalid={Boolean(errors.whatsappNumber)}
                aria-describedby={errors.whatsappNumber ? 'whatsappNumber-error' : undefined}
              />

              {errors.whatsappNumber && (
                <small id="whatsappNumber-error">{errors.whatsappNumber}</small>
              )}
            </div>

            <div className="parent-field">
              <label htmlFor="email">Email Address</label>

              <div className="parent-input-icon">
                <Mail size={17} aria-hidden="true" />

                <input
                  id="email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={updateField}
                  maxLength={120}
                  placeholder="Optional email address"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
              </div>

              {errors.email && (
                <small id="email-error">{errors.email}</small>
              )}
            </div>

          </div>

          <div className="parent-divider"></div>

          <div className="parent-section-heading">
            <div className="parent-section-icon">
              <ShieldCheck size={21} />
            </div>

            <div>
              <h2>Emergency Contact</h2>
              <p>Provide an additional contact person if needed.</p>
            </div>
          </div>

          <div className="parent-grid">

            <div className="parent-field">
              <label htmlFor="emergencyName">Emergency Contact Name</label>

              <input
                id="emergencyName"
                name="emergencyName"
                value={form.emergencyName}
                onChange={updateField}
                maxLength={180}
                placeholder="Optional contact name"
              />
            </div>

            <div className="parent-field">
              <label htmlFor="emergencyMobile">Emergency Mobile Number</label>

              <input
                id="emergencyMobile"
                type="tel"
                name="emergencyMobile"
                value={form.emergencyMobile}
                onChange={updateField}
                placeholder="Optional mobile number"
                maxLength={10}
                inputMode="numeric"
                aria-invalid={Boolean(errors.emergencyMobile)}
                aria-describedby={errors.emergencyMobile ? 'emergencyMobile-error' : undefined}
              />

              {errors.emergencyMobile && (
                <small id="emergencyMobile-error">{errors.emergencyMobile}</small>
              )}
            </div>

          </div>

          <div className="parent-divider"></div>

          <div className="parent-section-heading">
            <div className="parent-section-icon">
              <MapPin size={21} />
            </div>

            <div>
              <h2>Parent Residential Address</h2>
              <p>Enter the current residential address.</p>
            </div>
          </div>

          <div className="parent-field">
            <label htmlFor="parentAddress">Complete Address <span aria-hidden="true">*</span></label>

            <textarea
              id="parentAddress"
              name="parentAddress"
              value={form.parentAddress}
              onChange={updateField}
              placeholder="Enter the parent residential address"
              rows={3}
              maxLength={600}
              required
              aria-invalid={Boolean(errors.parentAddress)}
              aria-describedby={errors.parentAddress ? 'parentAddress-error' : undefined}
            />

            {errors.parentAddress && (
              <small id="parentAddress-error">{errors.parentAddress}</small>
            )}
          </div>

          <div className="parent-footer">
            <button
              type="button"
              className="parent-previous-button"
              onClick={goBack}
            >
              <ArrowLeft size={17} />
              Previous
            </button>

            <button type="submit" className="parent-continue-button">
              Continue to Payment
              <ArrowRight size={17} />
            </button>
          </div>

        </form>

        <footer className="parent-page-footer">
          ST. ANNES MATRIC SCHOOL · ADMISSION & BILLING SYSTEM
        </footer>

      </div>
    </main>
  );
}

export default ParentDetails;
