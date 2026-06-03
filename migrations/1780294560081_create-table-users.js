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
  pgm.createTable('users', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true
    },
    npm: {
      type: 'NUMERIC(10)',
      unique: true,
      notNull: true
    },
    name: {
      type: 'VARCHAR(255)',
      notNull: true
    },
    password: {
      type: 'VARCHAR(255)',
      notNull: true
    },
    division: {
      type: 'VARCHAR(50)',
      notNull: true
    },
    role: {
      type: 'VARCHAR(20)',
      notNull: true,
      default: 'member',
      check: "role IN('super_admin','pilar','admin_sekre','admin_psdm','member')"
    }
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable('users');
};
