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
  pgm.createTable('blog_posts', {
    id: {
      type: 'VARCHAR',
      primaryKey: true,
    },
    title: {
      type: 'VARCHAR(255)',
      notNull: true,
    },
    slug: {
      type: 'VARCHAR(255)',
      notNull: true,
      unique: true,
    },
    content: {
      type: 'TEXT',
      notNull: true,
    },
    cover_image: {
      type: 'VARCHAR(500)',
    },
    cover_image_public_id: {
      type: 'VARCHAR(255)',
    },
    author_id: {
      type: 'VARCHAR',
      references: 'users(id)',
    },
    status: {
      type: 'VARCHAR(20)',
      notNull: true,
      default: 'draft',
    },
    created_at: {
      type: 'TIMESTAMPTZ',
      default: pgm.func('now()'),
    },
    updated_at: {
      type: 'TIMESTAMPTZ',
      default: pgm.func('now()'),
    },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable('blog_posts');
};
