/* eslint-disable camelcase */
import pool from '../../database/pool.js';
import { nanoid } from 'nanoid';

class ComplaintRepositories {
  constructor() {
    this.pool = pool;
  }

  async createComplaint(id, is_anonymous, full_name, npm, prodi, category, title, description, suggestion, willing_to_contact, whatsapp_number, agreement, evidences) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      const complaintQuery = {
        text: `
          INSERT INTO complaints
            (id, is_anonymous, full_name, npm, prodi, category, title, description, suggestion, willing_to_contact, whatsapp_number, agreement)
          VALUES
            ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          RETURNING *
        `,
        values: [id, is_anonymous, full_name, npm, prodi, category, title, description, suggestion, willing_to_contact, whatsapp_number, agreement],
      };

      const complaintResult = await client.query(complaintQuery);
      const complaint = complaintResult.rows[0];

      const insertedEvidences = [];
      for (const evidence of evidences) {
        const evidenceId = `evidence-${nanoid(16)}`;

        const evidenceQuery = {
          text: `
            INSERT INTO complaint_evidences
              (id, complaint_id, file_url, file_public_id, file_type)
            VALUES
              ($1, $2, $3, $4, $5)
            RETURNING *
          `,
          values: [evidenceId, complaint.id, evidence.url, evidence.public_id, evidence.file_type],
        };

        const evidenceResult = await client.query(evidenceQuery);
        insertedEvidences.push(evidenceResult.rows[0]);
      }

      await client.query('COMMIT');

      return { ...complaint, evidences: insertedEvidences };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async getAllComplaints() {
    const query = {
      text: `
      SELECT
        c.*,
        COUNT(ce.id)::int AS evidence_count
      FROM complaints c
      LEFT JOIN complaint_evidences ce ON ce.complaint_id = c.id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `,
    };

    const result = await this.pool.query(query);
    return result.rows;
  }
  async getComplaintById(id) {
    const complaintQuery = {
      text: 'SELECT * FROM complaints WHERE id = $1',
      values: [id],
    };

    const complaintResult = await this.pool.query(complaintQuery);
    const complaint = complaintResult.rows[0];

    if (!complaint) {
      return null;
    }

    const evidencesQuery = {
      text: 'SELECT * FROM complaint_evidences WHERE complaint_id = $1',
      values: [id],
    };

    const evidencesResult = await this.pool.query(evidencesQuery);

    return { ...complaint, evidences: evidencesResult.rows };
  }

  async updateStatusComplaintById(id, status) {
    const query = {
      text: `
        UPDATE complaints
        SET status = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING *
      `,
      values: [status, id],
    };

    const result = await this.pool.query(query);
    return result.rows[0];
  }
}

export default ComplaintRepositories;