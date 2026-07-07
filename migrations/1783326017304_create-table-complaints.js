/* eslint-disable camelcase */
/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  pgm.createTable('complaints', {
    id: {
      type: 'varchar',
      primaryKey: true,
    },
    is_anonymous: {
      type: 'boolean',
      notNull: true,
      default: false,
    },
    full_name: {
      type: 'varchar(255)',
    },
    npm: {
      type: 'varchar(20)',
    },
    prodi: {
      type: 'varchar(50)',
      notNull: true,
    },
    category: {
      type: 'varchar(50)',
      notNull: true,
    },
    title: {
      type: 'varchar(255)',
      notNull: true,
    },
    description: {
      type: 'text',
      notNull: true,
    },
    suggestion: {
      type: 'text',
    },
    willing_to_contact: {
      type: 'boolean',
      notNull: true,
      default: false,
    },
    whatsapp_number: {
      type: 'varchar(20)',
    },
    agreement: {
      type: 'boolean',
      notNull: true,
      default: false,
    },
    status: {
      type: 'varchar(20)',
      notNull: true,
      default: 'pending',
    },
    created_at: {
      type: 'timestamp',
      default: pgm.func('now()'),
    },
    updated_at: {
      type: 'timestamp',
      default: pgm.func('now()'),
    },
  });

  pgm.addConstraint('complaints', 'complaints_prodi_check', {
    check: "prodi IN ('Teknik Informatika', 'Sistem Informasi')",
  });

  pgm.addConstraint('complaints', 'complaints_status_check', {
    check: "status IN ('pending', 'on progress', 'done')",
  });

  pgm.createTable('complaint_evidences', {
    id: {
      type: 'varchar',
      primaryKey: true,
    },
    complaint_id: {
      type: 'varchar',
      notNull: true,
      references: 'complaints(id)',
      onDelete: 'CASCADE',
    },
    file_url: {
      type: 'varchar(500)',
      notNull: true,
    },
    file_public_id: {
      type: 'varchar(255)',
      notNull: true,
    },
    file_type: {
      type: 'varchar(20)',
      notNull: true,
    },
    created_at: {
      type: 'timestamp',
      default: pgm.func('now()'),
    },
  });

  pgm.createIndex('complaint_evidences', 'complaint_id');
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable('complaint_evidences');
  pgm.dropTable('complaints');
};
