import { useState, useEffect } from 'react';
import Header from './components/Header';
import Overview from './components/Overview';
import NextBestAction from './components/NextBestAction';
import CaseList from './components/CaseList';
import InvestigationView from './components/InvestigationView';
import { fetchInvestigateAll } from './utils/api';
import './index.css';

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);
  const [caseStatuses, setCaseStatuses] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchInvestigateAll();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleInvestigate(caseItem) {
    setSelectedCase(caseItem);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleBack() {
    setSelectedCase(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleUpdateCaseStatus(paymentId, newStatus) {
    setCaseStatuses((prev) => ({
      ...prev,
      [paymentId]: newStatus,
    }));
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="loading-container">
          <div className="spinner" />
          <span className="loading-text">Agent analyzing revenue leakage & telemetry...</span>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="error-container">
          <span className="error-icon">!</span>
          <span className="error-message">{error}</span>
          <button className="btn-retry" onClick={loadData}>
            Try again
          </button>
        </div>
      </>
    );
  }

  const cases = data?.cases || [];
  const topCase = cases[0] || null;
  const otherCases = cases.slice(1);

  const inProgressCount = Object.values(caseStatuses).filter(
    (s) => s === 'recovery_initiated' || s === 'manual_review_requested'
  ).length;

  return (
    <>
      <Header />
      <main className="app-main">
        {selectedCase ? (
          <InvestigationView
            item={selectedCase}
            onBack={handleBack}
            status={caseStatuses[selectedCase.payment_id] || 'action_required'}
            onUpdateStatus={handleUpdateCaseStatus}
          />
        ) : (
          <>
            <Overview
              summary={data?.summary}
              inProgressCount={inProgressCount}
            />
            <NextBestAction
              topCase={topCase}
              onInvestigate={handleInvestigate}
              status={caseStatuses[topCase?.payment_id] || 'action_required'}
            />
            <CaseList
              cases={otherCases}
              onInvestigate={handleInvestigate}
              caseStatuses={caseStatuses}
            />
          </>
        )}
      </main>
    </>
  );
}

export default App;
