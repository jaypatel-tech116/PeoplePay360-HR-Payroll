const { pool } = require('../config/db');

/**
 * Approves a time off request atomically:
 * - Locks both the request row and matching allocation row
 * - Verifies allocation validity window and sufficient remaining balance
 * - Decrements remaining_amount and increments taken_amount
 * - Marks request as 'approved'
 * - Rolls back immediately if balance would become negative
 */
async function approveTimeOffRequest(requestId, approverUserId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Fetch and lock the request
    const reqRes = await client.query(
      'SELECT * FROM time_off_requests WHERE id = $1 FOR UPDATE',
      [requestId]
    );

    if (reqRes.rows.length === 0) {
      throw new Error('Time off request not found.');
    }

    const request = reqRes.rows[0];
    if (request.status === 'approved') {
      throw new Error('Time off request is already approved.');
    }
    if (request.status === 'refused') {
      throw new Error('Cannot approve a refused time off request.');
    }

    // 2. Fetch leave type configuration
    const typeRes = await client.query(
      'SELECT * FROM time_off_types WHERE id = $1',
      [request.time_off_type_id]
    );
    const leaveType = typeRes.rows[0];

    // 3. Handle allocation deduction if required
    if (leaveType.requires_allocation) {
      const allocRes = await client.query(
        `SELECT * FROM time_off_allocations
         WHERE employee_id = $1
           AND time_off_type_id = $2
           AND status = 'approved'
           AND valid_from <= $3
           AND valid_to >= $4
         ORDER BY valid_from ASC
         FOR UPDATE`,
        [request.employee_id, request.time_off_type_id, request.date_from, request.date_to]
      );

      if (allocRes.rows.length === 0) {
        throw new Error(`No active approved leave allocation found for ${leaveType.name} covering the requested dates.`);
      }

      const allocation = allocRes.rows[0];
      const duration = parseFloat(request.duration);
      const remaining = parseFloat(allocation.remaining_amount);

      if (remaining < duration) {
        throw new Error(
          `Insufficient leave balance! Required: ${duration} ${leaveType.unit}, but only ${remaining} ${leaveType.unit} remaining in the allocation.`
        );
      }

      // Atomically decrement allocation
      await client.query(
        `UPDATE time_off_allocations
         SET taken_amount = taken_amount + $1,
             remaining_amount = remaining_amount - $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [duration, allocation.id]
      );
    }

    // 4. Update request status to approved
    const updateRes = await client.query(
      `UPDATE time_off_requests
       SET status = 'approved',
           approved_by = $1,
           decided_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [approverUserId, requestId]
    );

    await client.query('COMMIT');
    return updateRes.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Refuses a time off request.
 * If the request was previously approved and had an allocation deducted,
 * this atomically restores the balance!
 */
async function refuseTimeOffRequest(requestId, approverUserId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const reqRes = await client.query(
      'SELECT * FROM time_off_requests WHERE id = $1 FOR UPDATE',
      [requestId]
    );

    if (reqRes.rows.length === 0) {
      throw new Error('Time off request not found.');
    }

    const request = reqRes.rows[0];

    // If it was already approved, return the deducted allocation
    if (request.status === 'approved') {
      const typeRes = await client.query(
        'SELECT * FROM time_off_types WHERE id = $1',
        [request.time_off_type_id]
      );
      const leaveType = typeRes.rows[0];

      if (leaveType.requires_allocation) {
        const allocRes = await client.query(
          `SELECT * FROM time_off_allocations
           WHERE employee_id = $1
             AND time_off_type_id = $2
             AND status = 'approved'
           ORDER BY valid_from ASC
           FOR UPDATE`,
          [request.employee_id, request.time_off_type_id]
        );

        if (allocRes.rows.length > 0) {
          const allocation = allocRes.rows[0];
          const duration = parseFloat(request.duration);
          await client.query(
            `UPDATE time_off_allocations
             SET taken_amount = GREATEST(0, taken_amount - $1),
                 remaining_amount = remaining_amount + $1,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $2`,
            [duration, allocation.id]
          );
        }
      }
    }

    const updateRes = await client.query(
      `UPDATE time_off_requests
       SET status = 'refused',
           approved_by = $1,
           decided_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [approverUserId, requestId]
    );

    await client.query('COMMIT');
    return updateRes.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  approveTimeOffRequest,
  refuseTimeOffRequest
};
