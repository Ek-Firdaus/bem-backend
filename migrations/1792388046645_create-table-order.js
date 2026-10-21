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
  // 1. Batch pre-order (satu batch = satu produk dengan masa buka-tutup)
  pgm.createTable('order_batches', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    // period_id: {
    //   type: 'VARCHAR(50)',
    //   notNull: true,
    //   references: 'periods(id)',
    //   onDelete: 'RESTRICT',
    // },
    name: { type: 'VARCHAR(150)', notNull: true },
    description: { type: 'TEXT' },
    base_price: { type: 'INTEGER', notNull: true },
    // image_url: { type: 'VARCHAR(255)' },
    // image_public_id: { type: 'VARCHAR(255)' },
    // Daftar isian yang wajib diisi per item, mis. nama di baju, NPM, prodi, angkatan
    item_fields: { type: 'JSONB', notNull: true, default: pgm.func("'[]'::jsonb") },
    open_at: { type: 'TIMESTAMPTZ', notNull: true },
    close_at: { type: 'TIMESTAMPTZ', notNull: true },
    is_active: { type: 'BOOLEAN', notNull: true, default: true },
    created_at: { type: 'TIMESTAMPTZ', notNull: true, default: pgm.func('NOW()') },
    updated_at: { type: 'TIMESTAMPTZ', notNull: true, default: pgm.func('NOW()') },
  });
  pgm.addConstraint('order_batches', 'order_batches_close_after_open', {
    check: 'close_at > open_at',
  });
  pgm.addConstraint('order_batches', 'order_batches_base_price_check', {
    check: 'base_price >= 0',
  });
  pgm.addConstraint('order_batches', 'order_batches_item_fields_check', {
    check: "jsonb_typeof(item_fields) = 'array'",
  });
  // pgm.createIndex('order_batches', 'period_id');
  pgm.createIndex('order_batches', 'is_active');

  // 1a. Gambar per batch (opsional, bisa lebih dari satu)
  pgm.createTable('order_batch_images', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    batch_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'order_batches(id)',
      onDelete: 'CASCADE',
    },
    image_url: { type: 'VARCHAR(255)', notNull: true },
    image_public_id: { type: 'VARCHAR(255)', notNull: true },
    sort_order: { type: 'INTEGER', notNull: true, default: 0 },
    created_at: { type: 'TIMESTAMPTZ', notNull: true, default: pgm.func('NOW()') },
  });
  pgm.createIndex('order_batch_images', 'batch_id');
  pgm.addConstraint('order_batch_images', 'order_batch_images_sort_unique', {
    unique: ['batch_id', 'sort_order'],
  });

  // 2. Varian per batch (ukuran, warna, dll). Produk tanpa varian tidak punya baris di sini
  pgm.createTable('order_batch_variants', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    batch_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'order_batches(id)',
      onDelete: 'CASCADE',
    },
    label: { type: 'VARCHAR(50)', notNull: true },
    extra_price: { type: 'INTEGER', notNull: true, default: 0 },
    sort_order: { type: 'SMALLINT', notNull: true, default: 0 },
  });
  pgm.addConstraint('order_batch_variants', 'order_batch_variants_unique', {
    unique: ['batch_id', 'label'],
  });
  pgm.addConstraint('order_batch_variants', 'order_batch_variants_extra_price_check', {
    check: 'extra_price >= 0',
  });

  // 3. Order (data pembeli + bukti bayar), pemilik selalu external user
  pgm.createTable('orders', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    batch_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'order_batches(id)',
      onDelete: 'RESTRICT',
    },
    external_user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'external_users(id)',
      onDelete: 'RESTRICT',
    },
    buyer_name: { type: 'VARCHAR(150)', notNull: true },
    phone: { type: 'VARCHAR(25)', notNull: true },
    total_price: { type: 'INTEGER', notNull: true },
    status: { type: 'VARCHAR(50)', notNull: true, default: 'pending' },
    payment_proof_url: { type: 'VARCHAR(255)' },
    payment_proof_public_id: { type: 'VARCHAR(255)' },
    rejected_reason: { type: 'TEXT' },
    notes: { type: 'TEXT' },
    picked_up_at: { type: 'TIMESTAMPTZ' },
    created_at: { type: 'TIMESTAMPTZ', notNull: true, default: pgm.func('NOW()') },
    updated_at: { type: 'TIMESTAMPTZ', notNull: true, default: pgm.func('NOW()') },
  });
  pgm.addConstraint('orders', 'orders_status_check', {
    check:
      "status IN ('verifikasi_pembayaran','produksi','pengantaran','siap_diambil','selesai','ditolak','dibatalkan','pending')",
  });
  pgm.addConstraint('orders', 'orders_total_price_check', {
    check: 'total_price >= 0',
  });
  pgm.createIndex('orders', 'batch_id');
  pgm.createIndex('orders', 'external_user_id');
  pgm.createIndex('orders', 'status');

  // 4. Item order. Isian khusus produk (nama di baju, NPM, dll) disimpan di item_data
  pgm.createTable('order_items', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    order_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'orders(id)',
      onDelete: 'CASCADE',
    },
    variant_label: { type: 'VARCHAR(50)' },
    qty: { type: 'INTEGER', notNull: true, default: 1 },
    unit_price: { type: 'INTEGER', notNull: true },
    item_data: { type: 'JSONB', notNull: true, default: pgm.func("'{}'::jsonb") },
  });
  pgm.addConstraint('order_items', 'order_items_qty_check', {
    check: 'qty > 0',
  });
  pgm.addConstraint('order_items', 'order_items_unit_price_check', {
    check: 'unit_price >= 0',
  });
  pgm.addConstraint('order_items', 'order_items_item_data_check', {
    check: "jsonb_typeof(item_data) = 'object'",
  });
  pgm.createIndex('order_items', 'order_id');

  // 5. Riwayat status order (untuk timeline tracking pembeli)
  pgm.createTable('order_status_logs', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    order_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'orders(id)',
      onDelete: 'CASCADE',
    },
    status: { type: 'VARCHAR(50)', notNull: true },
    note: { type: 'TEXT' },
    changed_by: { type: 'VARCHAR(50)', references: 'users(id)', onDelete: 'SET NULL' },
    changed_by_external_id: {
      type: 'VARCHAR(50)',
      references: 'external_users(id)',
      onDelete: 'SET NULL',
    },
    created_at: { type: 'TIMESTAMPTZ', notNull: true, default: pgm.func('NOW()') },
  });
  pgm.createIndex('order_status_logs', 'order_id');
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable('order_batch_images');
  pgm.dropTable('order_status_logs');
  pgm.dropTable('order_items');
  pgm.dropTable('orders');
  pgm.dropTable('order_batch_variants');
  pgm.dropTable('order_batches');
};
