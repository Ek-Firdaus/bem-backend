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
  pgm.createTable('roles', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    name: { type: 'VARCHAR(50)', notNull: true },
    is_system: { type: 'BOOLEAN', notNull: true, default: false },
    created_at: { type: 'TIMESTAMP', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'TIMESTAMP', notNull: true, default: pgm.func('current_timestamp') }
  });

  pgm.createTable('permissions', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    resource: { type: 'VARCHAR(255)', notNull: true },
    action: { type: 'VARCHAR(255)', notNull: true },
    created_at: { type: 'TIMESTAMP', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'TIMESTAMP', notNull: true, default: pgm.func('current_timestamp') }
  });

  pgm.createTable('role_permissions', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    role_id: { type: 'VARCHAR(50)', notNull: true, references: 'roles', onDelete: 'CASCADE' },
    permission_id: { type: 'VARCHAR(50)', notNull: true, references: 'permissions', onDelete: 'CASCADE' },
    created_at: { type: 'TIMESTAMP', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'TIMESTAMP', notNull: true, default: pgm.func('current_timestamp') }
  });

  // Cegah permission yang sama diassign dua kali ke role yang sama
  pgm.addConstraint('role_permissions', 'role_permissions_unique', {
    unique: ['role_id', 'permission_id'],
  });

  pgm.createTable('divisions', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    name: { type: 'VARCHAR(50)', notNull: true },
    created_at: { type: 'TIMESTAMP', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'TIMESTAMP', notNull: true, default: pgm.func('current_timestamp') }
  });

  pgm.createTable('periods', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    name_kabinet: { type: 'VARCHAR(50)', notNull: true },
    vision: { type: 'TEXT', notNull: true },
    mission: { type: 'TEXT', notNull: true },
    logo_url: { type: 'VARCHAR(255)' },
    logo_public_id: { type: 'VARCHAR(255)' },
    start_date: { type: 'DATE', notNull: true },
    end_date: { type: 'DATE', notNull: true },
    is_active: { type: 'BOOLEAN', notNull: true, default: false },
    created_at: { type: 'TIMESTAMP', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'TIMESTAMP', notNull: true, default: pgm.func('current_timestamp') }
  });

  // Cuma boleh ada 1 periode aktif dalam satu waktu
  pgm.sql(`
    CREATE UNIQUE INDEX periods_only_one_active
    ON periods (is_active)
    WHERE is_active = true
  `);

  pgm.createTable('user_periods', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    user_id: { type: 'VARCHAR(50)', notNull: true, references: 'users', onDelete: 'CASCADE' },
    period_id: { type: 'VARCHAR(50)', notNull: true, references: 'periods', onDelete: 'CASCADE' },
    role_id: { type: 'VARCHAR(50)', notNull: true, references: 'roles', onDelete: 'CASCADE' },
    division_id: { type: 'VARCHAR(50)', notNull: true, references: 'divisions', onDelete: 'CASCADE' },
    image_url: { type: 'VARCHAR(255)' },
    image_public_id: { type: 'VARCHAR(255)' },
    status: { type: 'VARCHAR(20)', notNull: true, default: 'active', check: "status IN ('active', 'graduated')" },
    created_at: { type: 'TIMESTAMP', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'TIMESTAMP', notNull: true, default: pgm.func('current_timestamp') }
  });

  // 1 user cuma boleh 1 baris per periode
  pgm.addConstraint('user_periods', 'user_periods_user_period_unique', {
    unique: ['user_id', 'period_id'],
  });
};


/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable('user_periods');
  pgm.sql('DROP INDEX IF EXISTS periods_only_one_active');
  pgm.dropTable('periods');
  pgm.dropTable('divisions');
  pgm.dropTable('role_permissions');
  pgm.dropTable('permissions');
  pgm.dropTable('roles');
};
