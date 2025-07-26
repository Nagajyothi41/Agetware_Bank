# 💰 Bank Lending System – Agetware Assignment

This is a simple **Bank Lending System** built using a modern three-tier architecture. The system allows customers to take out loans, make EMI or lump-sum payments, and view their loan ledger and history.

---

## 📐 System Architecture

This project follows a **three-tier architecture**:

1. **Frontend (React.js SPA)** – Handles user interaction and sends requests to the backend API.
2. **Backend (Node.js + Express.js)** – Contains the business logic and exposes a RESTful API.
3. **Database (PostgreSQL or SQLite)** – Stores all customer, loan, and payment data in structured format.

---

## 🌐 RESTful API Endpoints

### 🔹 Create a Loan
- `POST /api/v1/loans`
- **Body:**
```json
{
  "customer_id": "string",
  "loan_amount": "number",
  "loan_period_years": "number",
  "interest_rate_yearly": "number"
}
