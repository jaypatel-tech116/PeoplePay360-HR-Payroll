const { getDashboardData } = require('../services/dashboardService');
const { query } = require('../config/db');

exports.getDashboard = async (req, res) => {
  try {
    const { period, department, employeeType } = req.query;

    const companyId = req.user.role === 'Admin' ? null : req.user.company_id;

    const data = await getDashboardData({
      period,
      departmentId: department,
      employeeType,
      companyId,
      userRole: req.user.role
    });

    // Also fetch department list for filter dropdown
    const deptList = await query('SELECT id, name FROM departments ORDER BY name ASC');
    data.filterOptions = {
      departments: deptList.rows,
      employeeTypes: ['full_time', 'part_time', 'contract', 'intern']
    };

    res.json(data);
  } catch (err) {
    console.error('Dashboard aggregation error:', err);
    res.status(500).json({ error: 'Failed to aggregate dashboard metrics: ' + err.message });
  }
};
