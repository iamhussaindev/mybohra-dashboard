/**
 * Centralized Entity Schema Definition
 * Define your database entities here and everything else will be generated automatically
 */

export interface EntityField {
  type: string
  nullable?: boolean
  default?: unknown
  unique?: boolean
  primary?: boolean
  foreignKey?: {
    table: string
    column: string
    onDelete?: 'CASCADE' | 'SET NULL' | 'RESTRICT'
  }
  index?: boolean
  ginIndex?: boolean // For array fields
}

export interface EntityRelation {
  type: 'one-to-one' | 'one-to-many' | 'many-to-many'
  target: string
  foreignKey?: string
  through?: string // For many-to-many
}

export interface Entity {
  name: string
  table: string
  fields: Record<string, EntityField>
  relations?: Record<string, EntityRelation>
  rls?: {
    policies: string[]
  }
  indexes?: string[]
  triggers?: string[]
}

// Define your entities here
export const entities: Record<string, Entity> = {
  users: {
    name: 'User',
    table: 'users',
    fields: {
      id: {
        type: 'uuid',
        primary: true,
        default: 'gen_random_uuid()',
      },
      email: {
        type: 'varchar(255)',
        nullable: false,
        unique: true,
        index: true,
      },
      phone_number: {
        type: 'varchar(20)',
        nullable: true,
      },
      name: {
        type: 'varchar(255)',
        nullable: false,
      },
      roles: {
        type: 'text[]',
        default: "ARRAY['user']",
        ginIndex: true,
      },
      created_at: {
        type: 'timestamp with time zone',
        default: 'now()',
        index: true,
      },
      updated_at: {
        type: 'timestamp with time zone',
        default: 'now()',
      },
      created_by: {
        type: 'uuid',
        foreignKey: {
          table: 'auth.users',
          column: 'id',
          onDelete: 'SET NULL',
        },
      },
      updated_by: {
        type: 'uuid',
        foreignKey: {
          table: 'auth.users',
          column: 'id',
          onDelete: 'SET NULL',
        },
      },
    },
    relations: {
      preferences: {
        type: 'one-to-one',
        target: 'user_preferences',
        foreignKey: 'user_id',
      },
      posts: {
        type: 'one-to-many',
        target: 'posts',
        foreignKey: 'author_id',
      },
    },
    rls: {
      policies: ['Users can view own data', 'Users can update own data', 'Service role full access'],
    },
    indexes: [
      'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
      'CREATE INDEX IF NOT EXISTS idx_users_roles ON users USING GIN(roles)',
      'CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at)',
    ],
    triggers: [
      `CREATE OR REPLACE FUNCTION update_updated_at_column()
       RETURNS TRIGGER AS $$
       BEGIN
           NEW.updated_at = now();
           RETURN NEW;
       END;
       $$ language 'plpgsql';`,
      `DROP TRIGGER IF EXISTS update_users_updated_at ON users;
       CREATE TRIGGER update_users_updated_at
       BEFORE UPDATE ON users
       FOR EACH ROW
       EXECUTE FUNCTION update_updated_at_column();`,
    ],
  },

  user_preferences: {
    name: 'UserPreference',
    table: 'user_preferences',
    fields: {
      id: {
        type: 'uuid',
        primary: true,
        default: 'gen_random_uuid()',
      },
      user_id: {
        type: 'uuid',
        nullable: false,
        foreignKey: {
          table: 'users',
          column: 'id',
          onDelete: 'CASCADE',
        },
        index: true,
      },
      theme: {
        type: 'varchar(20)',
        default: "'light'",
      },
      notifications: {
        type: 'boolean',
        default: true,
      },
      language: {
        type: 'varchar(10)',
        default: "'en'",
      },
      created_at: {
        type: 'timestamp with time zone',
        default: 'now()',
      },
      updated_at: {
        type: 'timestamp with time zone',
        default: 'now()',
      },
    },
    relations: {
      user: {
        type: 'one-to-one',
        target: 'users',
        foreignKey: 'user_id',
      },
    },
    rls: {
      policies: ['Users can manage own preferences', 'Service role full access'],
    },
    triggers: [
      `DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
       CREATE TRIGGER update_user_preferences_updated_at
       BEFORE UPDATE ON user_preferences
       FOR EACH ROW
       EXECUTE FUNCTION update_updated_at_column();`,
    ],
  },

  posts: {
    name: 'Post',
    table: 'posts',
    fields: {
      id: {
        type: 'uuid',
        primary: true,
        default: 'gen_random_uuid()',
      },
      title: {
        type: 'varchar(255)',
        nullable: false,
        index: true,
      },
      content: {
        type: 'text',
        nullable: false,
      },
      author_id: {
        type: 'uuid',
        nullable: false,
        foreignKey: {
          table: 'users',
          column: 'id',
          onDelete: 'CASCADE',
        },
        index: true,
      },
      status: {
        type: 'varchar(20)',
        default: "'draft'",
        index: true,
      },
      tags: {
        type: 'text[]',
        ginIndex: true,
      },
      published_at: {
        type: 'timestamp with time zone',
        nullable: true,
        index: true,
      },
      created_at: {
        type: 'timestamp with time zone',
        default: 'now()',
        index: true,
      },
      updated_at: {
        type: 'timestamp with time zone',
        default: 'now()',
      },
    },
    relations: {
      author: {
        type: 'one-to-many',
        target: 'users',
        foreignKey: 'author_id',
      },
      comments: {
        type: 'one-to-many',
        target: 'comments',
        foreignKey: 'post_id',
      },
    },
    rls: {
      policies: ['Users can view published posts', 'Authors can manage own posts', 'Service role full access'],
    },
    indexes: [
      'CREATE INDEX IF NOT EXISTS idx_posts_title ON posts(title)',
      'CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id)',
      'CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status)',
      'CREATE INDEX IF NOT EXISTS idx_posts_tags ON posts USING GIN(tags)',
      'CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at)',
    ],
    triggers: [
      `DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
       CREATE TRIGGER update_posts_updated_at
       BEFORE UPDATE ON posts
       FOR EACH ROW
       EXECUTE FUNCTION update_updated_at_column();`,
    ],
  },
}

// Export entity names for easy access
export const entityNames = Object.keys(entities)
export const entityTables = Object.values(entities).map(e => e.table)
