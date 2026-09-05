const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const contractRoutes = require('./routes/contractRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const timeOffRoutes = require('./routes/timeOffRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const salaryStructureRoutes = require('./routes/salaryStructureRoutes');
const salaryRuleRoutes = require('./routes/salaryRuleRoutes');
const payrunRoutes = require('./routes/payrunRoutes');
const payslipRoutes = require('./routes/payslipRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const departmentJobRoutes = require('./routes/departmentJobRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const companyRoutes = require('./routes/companyRoutes');
const auditRoutes = require('./routes/auditRoutes');

const cookieParser = require('cookie-parser');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', platform: 'PeoplePay360', timestamp: new Date() });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/working-schedules', scheduleRoutes);
app.use('/api/time-off', timeOffRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/salary-structures', salaryStructureRoutes);
app.use('/api/salary-rules', salaryRuleRoutes);
app.use('/api/payruns', payrunRoutes);
app.use('/api/payslips', payslipRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api', departmentJobRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/audit-logs', auditRoutes);

// Global Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(` PeoplePay360 Backend API Server Running `);
  console.log(` Port: ${PORT}                           `);
  console.log(` Database: PostgreSQL 18 (Port ${process.env.PGPORT || 5432}) `);
  console.log(`=========================================`);
});
