import { useEffect, useState } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  ChevronDown,
  ClipboardList,
  FileText,
  GraduationCap,
  Mail,
  MapPin,
  Menu,
  Phone,
  Receipt,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
import schoolPhoto from '../../assets/school.webp';
import { SCHOOL } from '../../utils/schoolInfo';
import './Landing.css';

const navItems = [
  { id: 'about', label: 'About' },
  { id: 'registration', label: 'Registration' },
  { id: 'parents', label: 'Parents' },
  { id: 'fees', label: 'Fees' },
  { id: 'invoice', label: 'Invoice' },
  { id: 'process', label: 'Process' },
  { id: 'faq', label: 'FAQ' },
];

const faqs = [
  {
    question: 'Does this portal save student records?',
    answer: 'No. Student, parent, and payment details stay on this screen only while the admission is in progress. Refreshing or closing the browser clears them. The downloaded invoice is the copy to keep.',
  },
  {
    question: 'Who enters the information?',
    answer: 'School office staff enter the details when a parent visits. Parents do not need an account or a separate login for this screen.',
  },
  {
    question: 'Can I correct a detail after moving ahead?',
    answer: 'Yes. Use Previous to return to student, parent, or payment details. The information already entered in this admission stays filled in until you finish or start again.',
  },
  {
    question: 'What happens when an admission is finished?',
    answer: 'Finishing clears the temporary details from the screen so the next family starts from a blank form. Download or print the invoice before finishing if the office needs a copy.',
  },
  {
    question: 'Will the invoice number change if I preview it again?',
    answer: 'No. One invoice number is created for the current admission. The preview, download, and print all use that same number until the admission is finished or a new one is started.',
  },
  {
    question: 'Are the fee amounts fixed?',
    answer: 'No. Staff enter the admission, tuition, term, transport, books, uniform, and other charges for the student in front of them. The screen calculates the total, discount, amount received, and balance.',
  },
  {
    question: 'What do the payment statuses mean?',
    answer: 'Paid means the balance is zero and a payment was received. Partially Paid means some amount was received and a balance remains. Unpaid means no amount was received.',
  },
  {
    question: 'What should I do if a phone number or email is not confirmed yet?',
    answer: 'The phone and email shown for the school are placeholders until the office updates them. Parent email, alternate mobile, and WhatsApp can be left blank when they are not available.',
  },
];

function Landing({ onStart, notice, onDismissNotice }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    const nodes = document.querySelectorAll('.reveal');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      nodes.forEach((node) => node.classList.add('is-visible'));
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -40px 0px' });

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMenuOpen(false);
  };

  return (
    <div className="landing-page">
      <a className="skip-link" href="#main-content">Skip to content</a>

      <header className="landing-nav">
        <a className="school-brand" href="#top" onClick={(event) => { event.preventDefault(); scrollToSection('top'); }}>
          <span className="school-logo" aria-hidden="true">
            <GraduationCap size={28} />
          </span>
          <span>
            <strong>ST. ANNES</strong>
            <small>MATRIC SCHOOL</small>
          </span>
        </a>

        <nav className={`landing-links ${menuOpen ? 'is-open' : ''}`} aria-label="Landing page" id="landing-menu">
          {navItems.map((item) => (
            <button key={item.id} type="button" onClick={() => scrollToSection(item.id)}>
              {item.label}
            </button>
          ))}
          <button type="button" className="nav-start" onClick={onStart}>
            Start New Admission
          </button>
        </nav>

        <div className="nav-tools">
          <span className="nav-status">
            <span className="status-dot" aria-hidden="true" />
            School Office Portal
          </span>
          <button
            type="button"
            className="menu-toggle"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="landing-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {notice && (
        <div className="landing-notice" role="status">
          <p>{notice}</p>
          <button type="button" onClick={onDismissNotice}>Dismiss</button>
        </div>
      )}

      <main id="main-content">
        <section className="hero" id="top">
          <div className="hero-media">
            <div className="hero-zoom">
              <img
                src={schoolPhoto}
                alt="School campus entrance, showing the gate and school building"
                loading="eager"
                fetchPriority="high"
                decoding="async"
                width="1280"
                height="720"
              />
            </div>
            <div className="hero-overlay" />
          </div>

          <div className="hero-copy">
            <p className="hero-badge">
              <ShieldCheck size={16} aria-hidden="true" />
              School administration portal
            </p>
            <h1>
              Welcome to
              <span>ST. ANNES MATRIC SCHOOL</span>
            </h1>
            <p className="hero-lead">
              A calm desk for the school office: register a student, record parent details, enter the fees, and prepare a print-ready admission invoice while the family is here.
            </p>
            <button type="button" className="hero-button" onClick={onStart}>
              Start New Admission
              <ArrowRight size={18} aria-hidden="true" />
            </button>
            <p className="hero-note">
              <ShieldCheck size={16} aria-hidden="true" />
              Details stay on this screen for the current admission only. The downloaded invoice is the copy to keep.
            </p>
          </div>
        </section>

        <section className="landing-section intro-section" id="introduction">
          <div className="section-inner reveal">
            <p className="eyebrow">Admission registration</p>
            <h2>Prepared at the counter, one family at a time</h2>
            <p className="section-lead">
              This screen guides office staff through a new admission. There is no saved list of students and no invoice history. Each visit starts clean, and the PDF given to the parent is the record that leaves the desk.
            </p>
            <div className="intro-grid">
              <article className="info-card">
                <ClipboardList aria-hidden="true" />
                <h3>Student registration</h3>
                <p>Name, date of birth, class, academic year, and address are collected before anything is billed.</p>
              </article>
              <article className="info-card">
                <Users aria-hidden="true" />
                <h3>Parent details</h3>
                <p>Father, mother, mobile number, and address are recorded, with room for optional contact details.</p>
              </article>
              <article className="info-card">
                <Receipt aria-hidden="true" />
                <h3>Fees and invoice</h3>
                <p>Staff enter the amounts for this student. The invoice uses those same figures.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="landing-section about-section" id="about">
          <div className="section-inner split reveal">
            <div>
              <p className="eyebrow">About the office portal</p>
              <h2>A working desk for admission day</h2>
              <p className="section-lead">
                The portal is for staff who sit with parents and complete the admission paperwork. It keeps the steps in order and shows the balance before an invoice is issued.
              </p>
              <p className="section-lead">
                It does not replace the school’s permanent records. When the admission is finished, the screen is cleared so the next parent begins with an empty form.
              </p>
            </div>
            <div className="about-points">
              <article>
                <BadgeCheck aria-hidden="true" />
                <div>
                  <h3>Guided steps</h3>
                  <p>Student, parent, payment, then invoice. You can move back without losing what was typed.</p>
                </div>
              </article>
              <article>
                <ShieldCheck aria-hidden="true" />
                <div>
                  <h3>Temporary by design</h3>
                  <p>Nothing is written to browser storage. Closing the page ends the admission on screen.</p>
                </div>
              </article>
              <article>
                <FileText aria-hidden="true" />
                <div>
                  <h3>An office copy</h3>
                  <p>Download or print the A4 invoice before finishing. That file carries the details forward.</p>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="landing-section" id="registration">
          <div className="section-inner reveal">
            <p className="eyebrow">Student registration</p>
            <h2>Start with the student</h2>
            <p className="section-lead">
              The first step asks for the information the office needs before a class is confirmed on the invoice.
            </p>
            <ul className="detail-list">
              <li>Student name, date of birth, and gender</li>
              <li>Applying class, academic year, and admission type</li>
              <li>Residential address and city</li>
              <li>PIN code, when it is available</li>
              <li>Blood group and previous school, when they are known</li>
            </ul>
          </div>
        </section>

        <section className="landing-section tinted" id="parents">
          <div className="section-inner reveal">
            <p className="eyebrow">Parent information</p>
            <h2>Record who to contact</h2>
            <p className="section-lead">
              Parent details are entered next, while the family is at the desk. Required fields are marked. Optional numbers can be skipped.
            </p>
            <div className="intro-grid">
              <article className="info-card">
                <h3>Required</h3>
                <p>Father’s name, mother’s name, primary mobile number, and parent address.</p>
              </article>
              <article className="info-card">
                <h3>Optional contact</h3>
                <p>Alternate mobile, WhatsApp number, email, and an emergency contact.</p>
              </article>
              <article className="info-card">
                <h3>Checked before you continue</h3>
                <p>Mobile numbers must be 10 digits. An email, if entered, must look like an email address.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="landing-section" id="fees">
          <div className="section-inner reveal">
            <p className="eyebrow">Fee management and billing</p>
            <h2>Enter the amounts for this admission</h2>
            <p className="section-lead">
              Fee values are typed by staff. The screen does not impose a fixed fee chart. Use zero for a charge that does not apply.
            </p>
            <div className="fee-layout">
              <ul className="detail-list">
                <li>Admission fee, tuition fee, and term fee</li>
                <li>Transport, books, uniform, and other charges</li>
                <li>Discount, kept within the total fees</li>
                <li>Amount received, kept within the total payable</li>
                <li>Balance due and payment status, updated automatically</li>
              </ul>
              <aside className="fee-note">
                <Receipt aria-hidden="true" />
                <p>Paid, Partially Paid, and Unpaid are worked out from the amount received and the balance. A payment mode and date are asked for only when money is received.</p>
              </aside>
            </div>
          </div>
        </section>

        <section className="landing-section tinted" id="invoice">
          <div className="section-inner split reveal">
            <div>
              <p className="eyebrow">Professional invoice</p>
              <h2>Review it, then download or print</h2>
              <p className="section-lead">
                The preview shows the same student, parent, fee, and payment details that go into the PDF. The file is an A4 portrait invoice prepared for the parent and the office file.
              </p>
              <p className="section-lead">
                Downloading shows a short preparing state, then confirms when the file is ready. Printing hides the navigation and action buttons so the page is the invoice itself.
              </p>
            </div>
            <article className="invoice-sample" aria-hidden="true">
              <div className="sample-head">
                <GraduationCap size={22} />
                <div>
                  <strong>ST. ANNES MATRIC SCHOOL</strong>
                  <span>Admission invoice</span>
                </div>
              </div>
              <div className="sample-row"><span>Total fees</span><span>Entered by staff</span></div>
              <div className="sample-row"><span>Discount</span><span>If applicable</span></div>
              <div className="sample-row sample-total"><span>Balance due</span><span>Calculated</span></div>
              <p>A4 · Preview, download, and print share one invoice number</p>
            </article>
          </div>
        </section>

        <section className="landing-section" id="process">
          <div className="section-inner reveal">
            <p className="eyebrow">How registration works</p>
            <h2>Five steps, then a clear desk</h2>
            <ol className="process-grid">
              <li>
                <span>01</span>
                <h3>Start</h3>
                <p>Open a new admission. Any previous temporary details are cleared.</p>
              </li>
              <li>
                <span>02</span>
                <h3>Student</h3>
                <p>Enter the student’s personal, class, and address details.</p>
              </li>
              <li>
                <span>03</span>
                <h3>Parent</h3>
                <p>Add the parent or guardian contact information.</p>
              </li>
              <li>
                <span>04</span>
                <h3>Payment</h3>
                <p>Enter fees, discount, and the amount received today.</p>
              </li>
              <li>
                <span>05</span>
                <h3>Invoice</h3>
                <p>Download or print, then finish so the screen is cleared.</p>
              </li>
            </ol>
          </div>
        </section>

        <section className="landing-section tinted" id="why">
          <div className="section-inner reveal">
            <p className="eyebrow">Why use this screen</p>
            <h2>Made for the person at the desk</h2>
            <div className="why-grid">
              <article>
                <h3>The totals stay in step</h3>
                <p>Total fees, discount, payable amount, amount received, and balance are calculated from the figures just entered.</p>
              </article>
              <article>
                <h3>The invoice matches the form</h3>
                <p>Preview and PDF read from the same admission, including the invoice number.</p>
              </article>
              <article>
                <h3>Nothing is kept afterward</h3>
                <p>There is no student list to manage on this computer and no stored invoice history.</p>
              </article>
              <article>
                <h3>It fits the counter</h3>
                <p>The same steps work on a phone, tablet, laptop, or desktop without a sideways page.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="landing-section" id="faq">
          <div className="section-inner faq-layout reveal">
            <div>
              <p className="eyebrow">Questions</p>
              <h2>Before the next family sits down</h2>
              <p className="section-lead">
                Short answers for office staff using the registration screen.
              </p>
            </div>
            <div className="faq-list">
              {faqs.map((item, index) => {
                const open = openFaq === index;
                const panelId = `faq-panel-${index}`;
                return (
                  <article key={item.question} className={open ? 'faq-item is-open' : 'faq-item'}>
                    <h3>
                      <button
                        type="button"
                        id={`${panelId}-label`}
                        aria-expanded={open}
                        aria-controls={panelId}
                        onClick={() => setOpenFaq(open ? -1 : index)}
                      >
                        {item.question}
                        <ChevronDown size={18} aria-hidden="true" />
                      </button>
                    </h3>
                    <div
                      id={panelId}
                      role="region"
                      aria-labelledby={`${panelId}-label`}
                      className="faq-answer"
                    >
                      <p>{item.answer}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="closing-band">
          <div className="section-inner reveal">
            <h2>Ready for the next admission</h2>
            <p>Start a blank registration. The invoice number for that visit is created when you begin.</p>
            <button type="button" className="hero-button" onClick={onStart}>
              Start New Admission
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="footer-grid">
          <div>
            <strong>{SCHOOL.name}</strong>
            <p>School office admission and billing screen.</p>
          </div>
          <div>
            <p><MapPin size={16} aria-hidden="true" /> {SCHOOL.address}</p>
            <p><Phone size={16} aria-hidden="true" /> {SCHOOL.phone}</p>
            <p><Mail size={16} aria-hidden="true" /> {SCHOOL.email}</p>
            <p>Office hours: {SCHOOL.hours}</p>
          </div>
          <div>
            <p>Phone, email, and office hours shown here are placeholders until the school updates them.</p>
            <button type="button" onClick={() => scrollToSection('top')}>Back to top</button>
          </div>
        </div>
        <p className="footer-copy">© {new Date().getFullYear()} {SCHOOL.name}. All rights reserved. Campus photograph used on the welcome section.</p>
      </footer>
    </div>
  );
}

export default Landing;
