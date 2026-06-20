# OUTR Acadlytics
### Student Performance Analysis & Reporting System
> O.U.A.T., Bhubaneswar, Odisha

---

## Tech Stack
| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript, Chart.js |
| Backend | Node.js, Express.js (MVC) |
| Database | MongoDB (Mongoose ODM) |
| Auth | JWT + bcryptjs |
| PDF Reports | PDFKit |
| Excel Import | xlsx |

---

## Project Structure
```
outr-acadlytics/
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js  # Login, register, me
│   │   ├── studentController.js # CRUD + Excel import
│   │   ├── markController.js  # Marks entry, bulk save
│   │   ├── analyticsController.js # All analytics APIs
│   │   └── reportController.js # PDF generation
│   ├── middleware/
│   │   ├── auth.js            # JWT protect + role guard
│   │   └── error.js           # Global error handler
│   ├── models/
│   │   ├── User.js            # Admin/Teacher with bcrypt
│   │   ├── Student.js         # Name + RegdNo
│   │   └── Mark.js            # All 6 subjects with auto-grade
│   ├── routes/
│   │   ├── auth.js
│   │   ├── students.js
│   │   ├── marks.js
│   │   ├── analytics.js
│   │   └── reports.js
│   ├── utils/
│   │   └── seed.js            # 87 students + realistic marks
│   ├── server.js              # Express app entry point
│   ├── .env                   # Environment variables
│   └── package.json
├── frontend/
│   └── index.html             # Full SPA frontend
├── render.yaml                # Render deployment config
├── vercel.json                # Vercel frontend config
└── README.md
```

---

## Setup Instructions

### 1. Clone / Download the project
```bash
cd outr-acadlytics/backend
```

### 2. Install dependencies (already done)
```bash
npm install
```

### 3. Configure Environment
Edit `backend/.env`:
```
PORT=5000
MONGO_URI=mongodb+srv://USER:PASS@cluster.mongodb.net/outr-acadlytics
JWT_SECRET=your_secret_key_minimum_32_characters
JWT_EXPIRE=7d
NODE_ENV=development
```

### 4. Run the seed script (imports all 87 students + marks)
```bash
npm run seed
```
Output:
```
✅ Connected to MongoDB
🗑  Cleared existing data
👤 Seeded 3 users
🎓 Seeded 87 students
📊 Seeded 522 mark records (6 subjects × 87 students)

📈 Student Tier Distribution:
   Top Performers : 18 students
   Average        : 47 students
   At-Risk        : 22 students

🔑 Login Credentials:
   admin   | admin@outr.ac.in          | Admin@123
   teacher | spanda@outr.ac.in         | Teacher@123
   teacher | rmishra@outr.ac.in        | Teacher@123
```

### 5. Start the backend server
```bash
npm run dev   # Development (with nodemon)
npm start     # Production
```

### 6. Open the frontend
Open `frontend/index.html` in your browser, OR serve it statically.

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Register a user |
| POST | /api/auth/login | Login (returns JWT) |
| GET | /api/auth/me | Get current user |

### Students
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/students | List students (search, pagination) |
| GET | /api/students/:id | Get one student |
| POST | /api/students | Add student (admin) |
| PUT | /api/students/:id | Edit student (admin) |
| DELETE | /api/students/:id | Delete student + marks (admin) |
| POST | /api/students/import | Upload Excel file (admin) |

### Marks
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/marks/student/:studentId | All marks for a student |
| POST | /api/marks | Upsert single mark |
| POST | /api/marks/bulk | Save all 6 subjects at once |
| PUT | /api/marks/:id | Update one mark record |
| DELETE | /api/marks/:id | Delete a mark |

### Analytics
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/analytics/overview | Dashboard stats |
| GET | /api/analytics/subject-wise | Per-subject averages, pass rate |
| GET | /api/analytics/top-performers | Top 10 students |
| GET | /api/analytics/at-risk | Students with score < 40 |
| GET | /api/analytics/internal-vs-endsem | Comparison by subject |
| GET | /api/analytics/grade-distribution | Grade breakdown |

### Reports
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/reports/student/:studentId | Download PDF report card |
| GET | /api/reports/class | Class summary JSON |

---

## Marks Structure
```
Subject total = 100 marks

Internal Assessment (40 marks):
  ├── Midterm Exam   : 20 marks
  ├── Assignment     : 10 marks
  └── Quiz+Attendance: 10 marks

End Semester Exam    : 60 marks

Grade:
  A → 90–100  (Outstanding)
  B → 75–89   (Good)
  C → 50–74   (Average)
  D → <50     (Fail)
```

---

## Subjects
`OOPS` · `EECO` · `DM` · `AAD` · `OS` · `DAI`

---

## Deployment

### Backend → Render.com
1. Push to GitHub
2. New Web Service on Render → connect repo
3. Build: `cd backend && npm install`
4. Start: `cd backend && npm start`
5. Add env vars: MONGO_URI, JWT_SECRET

### Frontend → Vercel / Netlify
1. Deploy `frontend/` folder
2. Update `API` constant in `index.html` to your Render URL:
```js
const API = 'https://your-app.onrender.com/api';
```

---

## Default Login Credentials
| Role | Email | Password |
|---|---|---|
| Admin | admin@outr.ac.in | Admin@123 |
| Teacher | spanda@outr.ac.in | Teacher@123 |
| Teacher | rmishra@outr.ac.in | Teacher@123 |
