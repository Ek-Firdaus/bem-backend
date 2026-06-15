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
  pgm.createTable('inventories', {
    id: {
      type: 'VARCHAR(255)',
      primaryKey: true,
      notNull: true,
    },

    name: {
      type: 'VARCHAR(255)',
      notNull: true,
    },

    description: {
      type: 'TEXT',
    },

    category: {
      type: 'VARCHAR(100)',
    },

    quantity: {
      type: 'INTEGER',
      notNull: true,
      default: 1,
    },

    location: {
      type: 'VARCHAR(255)',
    },

    condition: {
      type: 'VARCHAR(20)',
      notNull: true,
      default: 'good',
      check: "condition IN ('good', 'minor_damage', 'damaged', 'lost')",
    },

    status: {
      type: 'VARCHAR(20)',
      notNull: true,
      default: 'available',
      check: "status IN ('available', 'borrowed', 'maintenance')",
    },

    image_url: {
      type: 'VARCHAR(500)',
    },

    image_public_id: {
      type: 'VARCHAR(255)',
    },

    qr_url: {
      type: 'VARCHAR(500)',
    },

    qr_public_id: {
      type: 'VARCHAR(255)',
    },

    asset_token: {
      type: 'VARCHAR(50)',
      notNull: true,
      unique: true,
    },

    created_by: {
      type: 'VARCHAR(255)',
      references: 'users',
      onDelete: 'SET NULL',
    },

    created_at: {
      type: 'TIMESTAMPTZ',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },

    updated_at: {
      type: 'TIMESTAMPTZ',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable('inventories');
};
