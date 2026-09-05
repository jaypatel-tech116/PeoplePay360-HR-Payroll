/**
 * PeoplePay360 - Admin Portal Mock Data
 * Strictly aligned with PostgreSQL database schema in server/src/config/schema.sql
 * and matches all 16 Admin screens from reference images.
 */

// 1. Dashboard Overview Metrics & Trends
export const MOCK_DASHBOARD_DATA = {
  kpis: {
    totalEmployees: { value: 48, trend: "↑ 12%", subtext: "vs last month" },
    onLeaveToday: { value: 4, trend: "↓ 8%", subtext: "vs last week" },
    activeContracts: { value: 45, trend: "↑ 3%", subtext: "of total employees" },
    totalPayroll: { value: "₹ 24,08,560", period: "Aug 2025" },
  },
  monthlyEmployeeTrend: [
    { month: "Jan", count: 18 },
    { month: "Feb", count: 22 },
    { month: "Mar", count: 26 },
    { month: "Apr", count: 30 },
    { month: "May", count: 32 },
    { month: "Jun", count: 36 },
    { month: "Jul", count: 42 },
    { month: "Aug", count: 48 },
  ],
  leaveRequestsSummary: {
    total: 12,
    pending: 3,
    approved: 7,
    rejected: 2,
  },
  recentActivities: [
    { id: 1, activity: "Employee created", user: "Admin", module: "Employees", date: "26 Aug 2025, 10:24 AM" },
    { id: 2, activity: "Leave approved", user: "HR Manager", module: "Leaves", date: "26 Aug 2025, 09:15 AM" },
    { id: 3, activity: "Payroll processed", user: "HR Payroll", module: "Payroll", date: "27 Aug 2025, 06:30 PM" },
    { id: 4, activity: "Department added", user: "Admin", module: "Departments", date: "25 Aug 2025, 04:12 PM" },
    { id: 5, activity: "Salary structure updated", user: "Admin", module: "Payroll", date: "25 Aug 2025, 02:45 PM" },
  ],
};

// 2. Employees (public.employees)
export const MOCK_EMPLOYEES = [
  {
    id: 1,
    code: "EMP001",
    name: "Rahul Sharma",
    avatar: "RS",
    department: "Engineering",
    jobTitle: "Software Developer",
    employmentType: "Full Time",
    status: "Active",
    email: "rahul@company.com",
    phone: "+91 98765 43210",
    dateOfBirth: "12 Jan 1995",
    gender: "Male",
    address: "Bangalore, Karnataka, India",
    joiningDate: "01 Sep 2023",
    manager: "Aditya Verma",
    workLocation: "Bangalore Office",
    nationalId: "XXXX1234",
    bankAccount: "HDFC **** 4321",
    panNumber: "ABCDE1234F",
    uanNumber: "100012345678",
    recentActivity: [
      { action: "Payroll processed Aug 2025", date: "27 Aug 2025", type: "payroll" },
      { action: "Leave approved 2 days", date: "26 Aug 2025", type: "leave" },
      { action: "Attendance updated", date: "26 Aug 2025", type: "attendance" },
      { action: "Contract renewed", date: "01 Aug 2025", type: "contract" },
    ],
  },
  {
    id: 2,
    code: "EMP002",
    name: "Priya Mehta",
    avatar: "PM",
    department: "HR",
    jobTitle: "HR Manager",
    employmentType: "Full Time",
    status: "Active",
    email: "priya@company.com",
    phone: "+91 98765 43211",
    dateOfBirth: "24 Apr 1994",
    gender: "Female",
    address: "Mumbai, Maharashtra, India",
    joiningDate: "15 Jun 2022",
    manager: "Admin User",
    workLocation: "Mumbai Office",
    nationalId: "XXXX5678",
    bankAccount: "ICICI **** 8765",
    panNumber: "BCDEF2345G",
    uanNumber: "100023456789",
  },
  {
    id: 3,
    code: "EMP003",
    name: "Vikram Rao",
    avatar: "VR",
    department: "Sales",
    jobTitle: "Sales Executive",
    employmentType: "Full Time",
    status: "Active",
    email: "vikram@company.com",
    phone: "+91 98765 43212",
    dateOfBirth: "18 Aug 1992",
    gender: "Male",
    address: "Delhi NCR, India",
    joiningDate: "10 Jan 2023",
    manager: "Sales Director",
    workLocation: "Delhi Office",
    nationalId: "XXXX9012",
    bankAccount: "SBI **** 1234",
    panNumber: "CDEFG3456H",
    uanNumber: "100034567890",
  },
  {
    id: 4,
    code: "EMP004",
    name: "Sneha Iyer",
    avatar: "SI",
    department: "Product",
    jobTitle: "UI/UX Designer",
    employmentType: "Full Time",
    status: "Active",
    email: "sneha@company.com",
    phone: "+91 98765 43213",
    dateOfBirth: "05 Nov 1996",
    gender: "Female",
    address: "Chennai, Tamil Nadu, India",
    joiningDate: "01 Mar 2024",
    manager: "Product VP",
    workLocation: "Bangalore Office",
    nationalId: "XXXX3456",
    bankAccount: "Axis **** 6543",
    panNumber: "DEFGH4567I",
    uanNumber: "100045678901",
  },
  {
    id: 5,
    code: "EMP005",
    name: "Aditya Gupta",
    avatar: "AG",
    department: "Engineering",
    jobTitle: "DevOps Engineer",
    employmentType: "Full Time",
    status: "Active",
    email: "aditya@company.com",
    phone: "+91 98765 43214",
    dateOfBirth: "14 Jul 1993",
    gender: "Male",
    address: "Pune, Maharashtra, India",
    joiningDate: "20 Feb 2024",
    manager: "Engineering VP",
    workLocation: "Bangalore Office",
    nationalId: "XXXX7890",
    bankAccount: "HDFC **** 7890",
    panNumber: "EFGHI5678J",
    uanNumber: "100056789012",
  },
  {
    id: 6,
    code: "EMP006",
    name: "Neha Patel",
    avatar: "NP",
    department: "HR",
    jobTitle: "HR Executive",
    employmentType: "Full Time",
    status: "Active",
    email: "neha@company.com",
    phone: "+91 98765 43215",
    dateOfBirth: "30 Sep 1997",
    gender: "Female",
    address: "Ahmedabad, Gujarat, India",
    joiningDate: "15 Sep 2023",
    manager: "Priya Mehta",
    workLocation: "Mumbai Office",
    nationalId: "XXXX2345",
    bankAccount: "Kotak **** 4321",
    panNumber: "FGHIJ6789K",
    uanNumber: "100067890123",
  },
  {
    id: 7,
    code: "EMP007",
    name: "Rohan Desai",
    avatar: "RD",
    department: "Marketing",
    jobTitle: "Marketing Specialist",
    employmentType: "Full Time",
    status: "Inactive",
    email: "rohan@company.com",
    phone: "+91 98765 43216",
    dateOfBirth: "02 Dec 1991",
    gender: "Male",
    address: "Bangalore, Karnataka, India",
    joiningDate: "01 Oct 2022",
    manager: "Marketing VP",
    workLocation: "Bangalore Office",
    nationalId: "XXXX6789",
    bankAccount: "ICICI **** 9012",
    panNumber: "GHIJK7890L",
    uanNumber: "100078901234",
  },
  {
    id: 8,
    code: "EMP008",
    name: "Meera Nair",
    avatar: "MN",
    department: "Finance",
    jobTitle: "Accountant",
    employmentType: "Full Time",
    status: "Active",
    email: "meera@company.com",
    phone: "+91 98765 43217",
    dateOfBirth: "22 Mar 1994",
    gender: "Female",
    address: "Kochi, Kerala, India",
    joiningDate: "15 Jan 2024",
    manager: "Finance VP",
    workLocation: "Bangalore Office",
    nationalId: "XXXX0123",
    bankAccount: "Federal **** 5678",
    panNumber: "HIJKL8901M",
    uanNumber: "100089012345",
  },
];

// 3. Departments (public.departments)
export const MOCK_DEPARTMENTS = [
  { id: 1, name: "Engineering", description: "Product development team", employeeCount: 12, status: "Active" },
  { id: 2, name: "HR", description: "Human resources management", employeeCount: 5, status: "Active" },
  { id: 3, name: "Sales", description: "Sales and business development", employeeCount: 8, status: "Active" },
  { id: 4, name: "Marketing", description: "Marketing and communications", employeeCount: 6, status: "Active" },
  { id: 5, name: "Product", description: "Product design and management", employeeCount: 7, status: "Active" },
  { id: 6, name: "Finance", description: "Finance and accounting", employeeCount: 4, status: "Active" },
  { id: 7, name: "Operations", description: "Operations and support", employeeCount: 3, status: "Active" },
  { id: 8, name: "IT", description: "IT infrastructure and support", employeeCount: 3, status: "Active" },
];

// 4. Contracts (public.contracts)
export const MOCK_CONTRACTS = [
  { id: 1, code: "EMP001", name: "Rahul Sharma", dept: "Engineering", type: "Permanent", start: "01 Jan 2023", end: "-", status: "Active" },
  { id: 2, code: "EMP002", name: "Priya Mehta", dept: "HR", type: "Permanent", start: "15 Aug 2023", end: "-", status: "Active" },
  { id: 3, code: "EMP003", name: "Vikram Rao", dept: "Sales", type: "Fixed Term", start: "01 Jun 2023", end: "31 May 2025", status: "Active" },
  { id: 4, code: "EMP004", name: "Sneha Iyer", dept: "Product", type: "Permanent", start: "01 Aug 2023", end: "-", status: "Active" },
  { id: 5, code: "EMP005", name: "Aditya Gupta", dept: "Engineering", type: "Probation", start: "01 Jul 2025", end: "31 Dec 2025", status: "Active" },
  { id: 6, code: "EMP006", name: "Neha Patel", dept: "HR", type: "Fixed Term", start: "01 Sep 2023", end: "31 Aug 2026", status: "Active" },
  { id: 7, code: "EMP007", name: "Rohan Desai", dept: "Marketing", type: "Permanent", start: "01 Mar 2023", end: "-", status: "Active" },
  { id: 8, code: "EMP008", name: "Meera Nair", dept: "Finance", type: "Contract", start: "01 Jan 2024", end: "31 Dec 2024", status: "Expired" },
];

// 5. Working Schedules (public.working_schedules)
export const MOCK_WORKING_SCHEDULES = [
  { id: 1, name: "Standard (9-6)", hours: "9:00 AM - 6:00 PM", days: "Mon - Fri", description: "Default full time schedule", status: "Active" },
  { id: 2, name: "Flexible", hours: "10:00 AM - 7:00 PM", days: "Mon - Fri", description: "Flexible working hours", status: "Active" },
  { id: 3, name: "Part Time", hours: "9:00 AM - 1:00 PM", days: "Mon - Fri", description: "Part time schedule", status: "Active" },
  { id: 4, name: "Shift A", hours: "6:00 AM - 2:00 PM", days: "Mon - Sat", description: "Morning shift", status: "Active" },
  { id: 5, name: "Shift B", hours: "2:00 PM - 10:00 PM", days: "Mon - Sat", description: "Evening shift", status: "Active" },
  { id: 6, name: "Shift C", hours: "10:00 PM - 6:00 AM", days: "Mon - Sat", description: "Night shift", status: "Active" },
];

// 6. Attendance (public.attendance)
export const MOCK_ATTENDANCE = {
  kpis: {
    present: { count: 38, pct: "79%" },
    absent: { count: 6, pct: "13%" },
    halfDay: { count: 2, pct: "4%" },
    onLeave: { count: 2, pct: "4%" },
  },
  records: [
    { id: 1, date: "26 Aug 2025", code: "EMP001", name: "Rahul Sharma", in: "09:00 AM", out: "06:05 PM", hours: "9.08", status: "Present" },
    { id: 2, date: "26 Aug 2025", code: "EMP002", name: "Priya Mehta", in: "09:15 AM", out: "06:00 PM", hours: "8.75", status: "Present" },
    { id: 3, date: "26 Aug 2025", code: "EMP003", name: "Vikram Rao", in: "-", out: "-", hours: "0.00", status: "Absent" },
    { id: 4, date: "26 Aug 2025", code: "EMP004", name: "Sneha Iyer", in: "09:30 AM", out: "01:30 PM", hours: "4.00", status: "Half Day" },
    { id: 5, date: "26 Aug 2025", code: "EMP005", name: "Aditya Gupta", in: "09:00 AM", out: "06:00 PM", hours: "9.00", status: "Present" },
    { id: 6, date: "26 Aug 2025", code: "EMP006", name: "Neha Patel", in: "-", out: "-", hours: "0.00", status: "On Leave" },
    { id: 7, date: "26 Aug 2025", code: "EMP007", name: "Rohan Desai", in: "09:05 AM", out: "06:10 PM", hours: "9.08", status: "Present" },
    { id: 8, date: "26 Aug 2025", code: "EMP008", name: "Meera Nair", in: "09:10 AM", out: "06:00 PM", hours: "8.83", status: "Present" },
  ],
};

// 7. Time Off / Leave Requests (public.leave_requests)
export const MOCK_TIME_OFF = [
  { id: 1, code: "EMP001", name: "Rahul Sharma", type: "Annual Leave", from: "12 Sep 2025", to: "16 Sep 2025", days: 5, status: "Pending" },
  { id: 2, code: "EMP002", name: "Priya Mehta", type: "Sick Leave", from: "10 Sep 2025", to: "12 Sep 2025", days: 3, status: "Pending" },
  { id: 3, code: "EMP003", name: "Vikram Rao", type: "Casual Leave", from: "01 Aug 2025", to: "02 Aug 2025", days: 2, status: "Rejected" },
  { id: 4, code: "EMP004", name: "Sneha Iyer", type: "Maternity Leave", from: "01 Jul 2025", to: "30 Jul 2025", days: 30, status: "Approved" },
  { id: 5, code: "EMP005", name: "Aditya Gupta", type: "Annual Leave", from: "15 Aug 2025", to: "20 Aug 2025", days: 6, status: "Pending" },
  { id: 6, code: "EMP006", name: "Neha Patel", type: "Sick Leave", from: "25 Aug 2025", to: "26 Aug 2025", days: 2, status: "Approved" },
  { id: 7, code: "EMP007", name: "Rohan Desai", type: "Paternity Leave", from: "10 Sep 2025", to: "12 Sep 2025", days: 3, status: "Pending" },
  { id: 8, code: "EMP008", name: "Meera Nair", type: "Casual Leave", from: "05 Aug 2025", to: "06 Aug 2025", days: 2, status: "Approved" },
];

// 8. Pay Cycles / Payruns (public.payruns)
export const MOCK_PAY_CYCLES = [
  { id: 1, month: "Aug", year: "2025", payDate: "31 Aug 2025", emps: 48, gross: "₹ 28,60,000", deductions: "₹ 4,20,600", net: "₹ 24,39,400", status: "Processing" },
  { id: 2, month: "Jul", year: "2025", payDate: "31 Jul 2025", emps: 47, gross: "₹ 27,90,000", deductions: "₹ 4,05,200", net: "₹ 23,84,800", status: "Completed" },
  { id: 3, month: "Jun", year: "2025", payDate: "30 Jun 2025", emps: 46, gross: "₹ 26,40,000", deductions: "₹ 3,90,500", net: "₹ 22,49,500", status: "Completed" },
  { id: 4, month: "May", year: "2025", payDate: "31 May 2025", emps: 46, gross: "₹ 25,80,000", deductions: "₹ 3,82,000", net: "₹ 21,98,000", status: "Completed" },
  { id: 5, month: "Apr", year: "2025", payDate: "30 Apr 2025", emps: 45, gross: "₹ 25,10,000", deductions: "₹ 3,75,300", net: "₹ 21,34,700", status: "Completed" },
  { id: 6, month: "Mar", year: "2025", payDate: "31 Mar 2025", emps: 44, gross: "₹ 24,90,000", deductions: "₹ 3,69,800", net: "₹ 21,30,200", status: "Completed" },
  { id: 7, month: "Feb", year: "2025", payDate: "28 Feb 2025", emps: 44, gross: "₹ 24,20,000", deductions: "₹ 3,60,000", net: "₹ 20,60,000", status: "Completed" },
  { id: 8, month: "Jan", year: "2025", payDate: "31 Jan 2025", emps: 42, gross: "₹ 23,80,000", deductions: "₹ 3,48,600", net: "₹ 20,31,400", status: "Completed" },
];

// 9. Pay Slips (public.payslips)
export const MOCK_PAYSLIPS = [
  { id: 1, code: "EMP001", name: "Rahul Sharma", dept: "Engineering", gross: "₹ 52,000", net: "₹ 46,700", status: "Paid" },
  { id: 2, code: "EMP002", name: "Priya Mehta", dept: "HR", gross: "₹ 48,500", net: "₹ 43,700", status: "Paid" },
  { id: 3, code: "EMP003", name: "Vikram Rao", dept: "Sales", gross: "₹ 61,000", net: "₹ 54,800", status: "Paid" },
  { id: 4, code: "EMP004", name: "Sneha Iyer", dept: "Product", gross: "₹ 49,000", net: "₹ 44,000", status: "Pending" },
  { id: 5, code: "EMP005", name: "Aditya Gupta", dept: "Engineering", gross: "₹ 58,000", net: "₹ 52,100", status: "Paid" },
  { id: 6, code: "EMP006", name: "Neha Patel", dept: "HR", gross: "₹ 39,800", net: "₹ 35,600", status: "Paid" },
  { id: 7, code: "EMP007", name: "Rohan Desai", dept: "Marketing", gross: "₹ 47,500", net: "₹ 42,300", status: "Pending" },
  { id: 8, code: "EMP008", name: "Meera Nair", dept: "Finance", gross: "₹ 50,000", net: "₹ 45,900", status: "Paid" },
];

// 10. Payroll Reports Data
export const MOCK_PAYROLL_REPORTS = {
  kpis: {
    totalPayroll: { value: "₹ 24,08,560", change: "↑ 12%", subtext: "vs last month" },
    employeesPaid: { value: 45, change: "94%", subtext: "of total employees" },
    pendingPayments: { value: 3, change: "6%", subtext: "of total employees" },
    averageSalary: { value: "₹ 53,523", change: "↑ 8%", subtext: "vs last month" },
  },
  departmentWise: [
    { name: "Engineering", amount: "₹ 8,24,000", pct: 75, color: "#714B67" },
    { name: "Sales", amount: "₹ 5,72,000", pct: 55, color: "#9333ea" },
    { name: "HR", amount: "₹ 3,48,000", pct: 40, color: "#3b82f6" },
    { name: "Product", amount: "₹ 3,12,000", pct: 36, color: "#059669" },
    { name: "Marketing", amount: "₹ 2,88,000", pct: 32, color: "#d97706" },
    { name: "Finance", amount: "₹ 2,64,000", pct: 30, color: "#0284c7" },
    { name: "Operations", amount: "₹ 1,40,000", pct: 18, color: "#10b981" },
    { name: "IT", amount: "₹ 98,000", pct: 12, color: "#6366f1" },
  ],
  recentReports: [
    { id: 1, name: "Payroll Summary", period: "August 2025", generatedOn: "26 Aug 2025, 10:30 AM", generatedBy: "Admin" },
    { id: 2, name: "Department Wise", period: "August 2025", generatedOn: "26 Aug 2025, 09:15 AM", generatedBy: "Admin" },
    { id: 3, name: "Earnings & Deductions", period: "August 2025", generatedOn: "25 Aug 2025, 04:20 PM", generatedBy: "Admin" },
  ],
};

// 11. Salary Structures (public.salary_structures)
export const MOCK_SALARY_STRUCTURES = [
  { id: 1, name: "Default Structure (Full Time)", code: "SS001", description: "Standard salary structure for full time employees", employees: 32, status: "Active" },
  { id: 2, name: "Part Time Structure", code: "SS002", description: "For part time employees", employees: 5, status: "Active" },
  { id: 3, name: "Contract Structure", code: "SS003", description: "For contract employees", employees: 4, status: "Active" },
  { id: 4, name: "Intern Structure", code: "SS004", description: "For interns", employees: 2, status: "Active" },
  { id: 5, name: "Management Structure", code: "SS005", description: "For management level", employees: 8, status: "Active" },
  { id: 6, name: "Sales Structure", code: "SS006", description: "For sales team", employees: 12, status: "Active" },
  { id: 7, name: "Technical Structure", code: "SS007", description: "For technical team", employees: 10, status: "Inactive" },
  { id: 8, name: "Custom Structure", code: "SS008", description: "Custom structure for special cases", employees: 3, status: "Active" },
];

// 12. Salary Rules (public.salary_rules)
export const MOCK_SALARY_RULES = [
  { id: 1, name: "Basic Salary", code: "BASIC", type: "Earning", calcType: "Fixed", defaultValue: "-", status: "Active" },
  { id: 2, name: "House Rent Allowance", code: "HRA", type: "Allowance", calcType: "Percentage", defaultValue: "40%", status: "Active" },
  { id: 3, name: "Conveyance Allowance", code: "CONV", type: "Allowance", calcType: "Fixed", defaultValue: "2,500", status: "Active" },
  { id: 4, name: "Medical Allowance", code: "MED", type: "Allowance", calcType: "Fixed", defaultValue: "1,500", status: "Active" },
  { id: 5, name: "Special Allowance", code: "SPEC", type: "Allowance", calcType: "Fixed", defaultValue: "-", status: "Active" },
  { id: 6, name: "Provident Fund", code: "PF", type: "Deduction", calcType: "Percentage", defaultValue: "12%", status: "Active" },
  { id: 7, name: "Professional Tax", code: "PT", type: "Deduction", calcType: "Fixed", defaultValue: "200", status: "Active" },
  { id: 8, name: "ESI", code: "ESI", type: "Deduction", calcType: "Percentage", defaultValue: "0.75%", status: "Active" },
  { id: 9, name: "TDS", code: "TDS", type: "Deduction", calcType: "Formula", defaultValue: "-", status: "Active" },
  { id: 10, name: "Gratuity", code: "GRAT", type: "Other", calcType: "Formula", defaultValue: "-", status: "Inactive" },
];

// 13. Users & Roles (public.users & public.roles)
export const MOCK_USERS_LIST = [
  { id: 1, name: "Admin User", email: "admin@company.com", role: "Admin", dept: "-", status: "Active", lastLogin: "26 Aug 2025, 10:24 AM" },
  { id: 2, name: "Rahul Sharma", email: "rahul@company.com", role: "HR Manager", dept: "Engineering", status: "Active", lastLogin: "26 Aug 2025, 09:15 AM" },
  { id: 3, name: "Priya Mehta", email: "priya@company.com", role: "HR Payroll User", dept: "HR", status: "Active", lastLogin: "25 Aug 2025, 04:32 PM" },
  { id: 4, name: "Vikram Rao", email: "vikram@company.com", role: "Department Manager", dept: "Sales", status: "Active", lastLogin: "25 Aug 2025, 11:20 AM" },
  { id: 5, name: "Sneha Iyer", email: "sneha@company.com", role: "Employee", dept: "Product", status: "Active", lastLogin: "24 Aug 2025, 06:45 PM" },
  { id: 6, name: "Aditya Gupta", email: "aditya@company.com", role: "Employee", dept: "Engineering", status: "Active", lastLogin: "24 Aug 2025, 03:12 PM" },
  { id: 7, name: "Neha Patel", email: "neha@company.com", role: "Employee", dept: "HR", status: "Inactive", lastLogin: "20 Aug 2025, 11:05 AM" },
  { id: 8, name: "Rohan Desai", email: "rohan@company.com", role: "Employee", dept: "Marketing", status: "Active", lastLogin: "23 Aug 2025, 09:18 AM" },
];

export const MOCK_ROLES_LIST = [
  { id: 1, name: "Admin", code: "ADMIN", desc: "Full administrative access to all modules and configurations", usersCount: 1, status: "Active" },
  { id: 2, name: "HR Manager", code: "HR_MANAGER", desc: "Full HR management, leaves, attendance, and employee onboarding", usersCount: 2, status: "Active" },
  { id: 3, name: "HR Payroll Manager", code: "HR_PAYROLL_MANAGER", desc: "Comprehensive payroll execution, structure management, and disbursements", usersCount: 1, status: "Active" },
  { id: 4, name: "HR Payroll User", code: "HR_PAYROLL_USER", desc: "Operational payroll generation, attendance verification, and payslips", usersCount: 2, status: "Active" },
  { id: 5, name: "Employee", code: "EMPLOYEE", desc: "Employee self-service, view payslips, and apply for leaves", usersCount: 42, status: "Active" },
];

// 14. Settings (System Configuration)
export const MOCK_SETTINGS = {
  general: {
    companyName: "PeoplePay360",
    currency: "INR (₹)",
    dateFormat: "DD/MM/YYYY",
    timezone: "Asia/Kolkata",
    financialYearStart: "1 April",
    defaultWorkHoursPerDay: 8,
  },
  preferences: {
    emailNotifications: true,
    employeeSelfService: true,
    mobileAccess: false,
    allowOvertime: true,
    multiDepartment: true,
    auditLogs: true,
  },
};
