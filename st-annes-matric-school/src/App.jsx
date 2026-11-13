import { useState } from 'react';
import Landing from './pages/Landing/Landing';
import Registration from './pages/Registration/Registration';
import ParentDetails from './pages/Registration/ParentDetails';
import PaymentDetails from './pages/Billing/PaymentDetails';
import InvoicePreview from './pages/Billing/InvoicePreview';
import { createInvoiceIdentity } from './utils/invoiceUtils';

function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [studentData, setStudentData] = useState({});
  const [parentData, setParentData] = useState({});
  const [paymentData, setPaymentData] = useState({});
  const [invoice, setInvoice] = useState(null);
  const [notice, setNotice] = useState('');

  const clearWorkflow = () => {
    setStudentData({});
    setParentData({});
    setPaymentData({});
    setInvoice(null);
  };

  const startAdmission = () => {
    clearWorkflow();
    setInvoice(createInvoiceIdentity());
    setNotice('');
    setCurrentPage('student');
  };

  const finishAdmission = () => {
    clearWorkflow();
    setNotice('This admission is complete. Temporary details have been cleared from the screen. Keep the downloaded invoice as the office copy.');
    setCurrentPage('landing');
  };

  const leaveWorkflow = () => {
    clearWorkflow();
    setCurrentPage('landing');
  };

  return (
    <>
      {currentPage === 'landing' && (
        <Landing
          onStart={startAdmission}
          notice={notice}
          onDismissNotice={() => setNotice('')}
        />
      )}

      {currentPage === 'student' && (
        <Registration
          studentData={studentData}
          onBack={leaveWorkflow}
          onNext={(data) => {
            setStudentData(data);
            setCurrentPage('parent');
          }}
        />
      )}

      {currentPage === 'parent' && (
        <ParentDetails
          studentData={studentData}
          parentData={parentData}
          onBack={(data) => {
            setParentData(data);
            setCurrentPage('student');
          }}
          onNext={(data) => {
            setParentData(data);
            setCurrentPage('payment');
          }}
        />
      )}

      {currentPage === 'payment' && (
        <PaymentDetails
          studentData={studentData}
          paymentData={paymentData}
          onBack={(data) => {
            setPaymentData(data);
            setCurrentPage('parent');
          }}
          onNext={(data) => {
            setPaymentData(data);
            setCurrentPage('invoice');
          }}
        />
      )}

      {currentPage === 'invoice' && (
        <InvoicePreview
          studentData={studentData}
          parentData={parentData}
          paymentData={paymentData}
          invoiceNumber={invoice?.number || ''}
          invoiceDate={invoice?.date || ''}
          onBack={() => setCurrentPage('payment')}
          onFinish={finishAdmission}
        />
      )}
    </>
  );
}

export default App;
