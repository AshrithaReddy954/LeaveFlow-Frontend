
import { useState, useEffect } from "react";
import "./App.css";

const API_URL = "http://localhost:8080/api/leaves";

function App() {
  const [employee, setEmployee] = useState("Ashritha");
  const [leaveType, setLeaveType] = useState("Casual Leave");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");
  const [requests, setRequests] = useState([]);
  const [backendStatus, setBackendStatus] = useState("Checking backend...");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("http://localhost:8080/api/health")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Backend request failed");
        }
        return response.text();
      })
      .then((message) => setBackendStatus(message))
      .catch(() => setBackendStatus("Backend connection failed"));

    loadRequests();
  }, []);

  async function loadRequests() {
    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Could not load leave requests");
      }

      const data = await response.json();
      setRequests(data.reverse());
    } catch (error) {
      console.error("Error loading leave requests:", error);
    }
  }

  async function applyLeave(e) {
    e.preventDefault();

    if (toDate < fromDate) {
      alert("To date must be on or after the from date.");
      return;
    }

    setSubmitting(true);

    const leaveRequest = {
      employee,
      leaveType,
      fromDate,
      toDate,
      reason,
      status: "Pending",
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(leaveRequest),
      });

      if (!response.ok) {
        throw new Error("Failed to save leave request");
      }

      const savedRequest = await response.json();

      setRequests((previousRequests) => [
        savedRequest,
        ...previousRequests,
      ]);

      setFromDate("");
      setToDate("");
      setReason("");

      alert("Leave application saved successfully!");
    } catch (error) {
      console.error("Error submitting leave request:", error);
      alert(
        "Could not save the leave request. Please check that your backend is running."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const pending = requests.filter(
    (request) => request.status === "Pending"
  ).length;

  return (
    <div className="app">
      <p style={{ textAlign: "center", padding: "10px" }}>
        Backend Status: {backendStatus}
      </p>

      <aside className="sidebar">
        <h2 className="logo">LeaveFlow</h2>
        <p className="sidebar-label">WORKSPACE</p>
        <div className="nav-item active">▦ Dashboard</div>
        <div className="nav-item">▤ My Leave Requests</div>
        <div className="nav-item">◷ Leave Calendar</div>
        <div className="nav-item">⚙ Settings</div>

        <div className="sidebar-bottom">
          <div className="avatar">A</div>
          <div>
            <strong>{employee}</strong>
            <p>Employee</p>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <p className="eyebrow">EMPLOYEE PORTAL</p>
            <h1>Dashboard</h1>
          </div>
          <div className="profile">
            <span>🔔</span>
            <div className="avatar">A</div>
            <strong>{employee}</strong>
          </div>
        </header>

        <section className="welcome">
          <div>
            <p className="eyebrow light">YOUR WORKSPACE</p>
            <h2>Welcome back, {employee}! 👋</h2>
            <p>Manage your time off and keep your work-life balanced.</p>
          </div>
          <div className="welcome-icon">🌿</div>
        </section>

        <section className="stats">
          <div className="stat-card">
            <span className="stat-icon purple">☀</span>
            <p>Casual Leave</p>
            <h2>12 <small>days</small></h2>
            <span className="muted">Available balance</span>
          </div>

          <div className="stat-card">
            <span className="stat-icon green">♡</span>
            <p>Sick Leave</p>
            <h2>10 <small>days</small></h2>
            <span className="muted">Available balance</span>
          </div>

          <div className="stat-card">
            <span className="stat-icon orange">▣</span>
            <p>Earned Leave</p>
            <h2>15 <small>days</small></h2>
            <span className="muted">Available balance</span>
          </div>

          <div className="stat-card">
            <span className="stat-icon blue">◷</span>
            <p>Pending Requests</p>
            <h2>{pending} <small>requests</small></h2>
            <span className="muted">Awaiting approval</span>
          </div>
        </section>

        <section className="content-grid">
          <div className="panel form-panel">
            <div className="panel-heading">
              <div>
                <h2>Apply for Leave</h2>
                <p>Fill in the details to submit a request.</p>
              </div>
              <span className="heading-icon">＋</span>
            </div>

            <form onSubmit={applyLeave}>
              <label>Employee Name</label>
              <input
                value={employee}
                onChange={(e) => setEmployee(e.target.value)}
                required
              />

              <label>Leave Type</label>
              <select
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
              >
                <option>Casual Leave</option>
                <option>Sick Leave</option>
                <option>Earned Leave</option>
                <option>Unpaid Leave</option>
              </select>

              <div className="date-row">
                <div>
                  <label>From Date</label>
                  <input
                    type="date"
                    value={fromDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setFromDate(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label>To Date</label>
                  <input
                    type="date"
                    value={toDate}
                    min={fromDate || new Date().toISOString().split("T")[0]}
                    onChange={(e) => setToDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <label>Reason for Leave</label>
              <textarea
                placeholder="Briefly explain your reason..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows="3"
                required
              />

              <button
                className="submit-btn"
                type="submit"
                disabled={submitting}
              >
                {submitting ? "Saving..." : "Submit Leave Request →"}
              </button>
            </form>
          </div>

          <div className="panel requests-panel">
            <div className="panel-heading">
              <div>
                <h2>Recent Requests</h2>
                <p>Track your submitted leave applications.</p>
              </div>
              <span className="heading-icon">↗</span>
            </div>

            {requests.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <h3>No requests yet</h3>
                <p>Your submitted leave requests will appear here.</p>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>LEAVE TYPE</th>
                      <th>DATES</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>

                  <tbody>
                    {requests.map((request) => (
                      <tr key={request.id}>
                        <td>
                          <strong>{request.leaveType}</strong>
                          <small className="reason">{request.reason}</small>
                        </td>
                        <td>
                          {request.fromDate}
                          <small className="reason">
                            to {request.toDate}
                          </small>
                        </td>
                        <td>
                          <span className="status pending">
                            {request.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="tip">
              <span>💡</span>
              <div>
                <strong>Quick tip</strong>
                <p>
                  Submit leave requests early to help your manager plan ahead.
                </p>
              </div>
            </div>
          </div>
        </section>

        <footer>
          © 2026 LeaveFlow · Employee Leave Management System
        </footer>
      </main>
    </div>
  );
}

export default App;
