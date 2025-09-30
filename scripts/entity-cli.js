#!/usr/bin/env node

/**
 * Entity Management CLI
 * Command-line tool for managing database entities
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const ENTITIES_FILE = path.join(__dirname, '..', 'src', 'lib', 'schema', 'entities.ts')

function showHelp() {
  console.log(`
🔧 Entity Management CLI

Usage: node scripts/entity-cli.js <command> [options]

Commands:
  sync                    Sync database with entity definitions
  generate               Generate types and CRUD services
  add <entity>           Add a new entity (interactive)
  list                   List all entities
  validate               Validate entity definitions
  help                   Show this help message

Examples:
  node scripts/entity-cli.js sync
  node scripts/entity-cli.js generate
  node scripts/entity-cli.js add user_preferences
  node scripts/entity-cli.js list
`)
}

function syncDatabase() {
  console.log('🚀 Syncing database with entity definitions...')
  try {
    execSync('node scripts/entity-sync.js', { stdio: 'inherit' })
    console.log('✅ Database sync completed')
  } catch (error) {
    console.error('❌ Database sync failed:', error.message)
    process.exit(1)
  }
}

function generateCode() {
  console.log('🔧 Generating TypeScript types and CRUD services...')
  try {
    execSync('node scripts/entity-sync.js', { stdio: 'inherit' })
    console.log('✅ Code generation completed')
  } catch (error) {
    console.error('❌ Code generation failed:', error.message)
    process.exit(1)
  }
}

function listEntities() {
  console.log('📋 Available entities:')

  if (!fs.existsSync(ENTITIES_FILE)) {
    console.log('❌ Entities file not found. Run sync first.')
    return
  }

  try {
    const content = fs.readFileSync(ENTITIES_FILE, 'utf8')
    const entityMatches = content.match(/export const entities: Record<string, Entity> = \{([\s\S]*?)\}/)

    if (entityMatches) {
      const entityNames = content.match(/\s+(\w+):\s*\{/g) || []
      entityNames.forEach(match => {
        const name = match.trim().replace(':', '').trim()
        console.log(`   - ${name}`)
      })
    } else {
      console.log('   No entities found')
    }
  } catch (error) {
    console.error('❌ Failed to read entities file:', error.message)
  }
}

function validateEntities() {
  console.log('🔍 Validating entity definitions...')

  if (!fs.existsSync(ENTITIES_FILE)) {
    console.log('❌ Entities file not found')
    return
  }

  try {
    // Basic validation - check for required fields
    const content = fs.readFileSync(ENTITIES_FILE, 'utf8')

    const requiredFields = ['name', 'table', 'fields']
    const entityMatches = content.match(/\w+:\s*\{[\s\S]*?\}/g) || []

    let valid = true

    entityMatches.forEach((match, index) => {
      const hasName = match.includes('name:')
      const hasTable = match.includes('table:')
      const hasFields = match.includes('fields:')

      if (!hasName || !hasTable || !hasFields) {
        console.log(`❌ Entity ${index + 1} is missing required fields`)
        valid = false
      }
    })

    if (valid) {
      console.log('✅ All entities are valid')
    } else {
      console.log('❌ Some entities have validation errors')
    }
  } catch (error) {
    console.error('❌ Validation failed:', error.message)
  }
}

function addEntity(entityName) {
  console.log(`➕ Adding new entity: ${entityName}`)

  if (!entityName) {
    console.log('❌ Please provide an entity name')
    console.log('Usage: node scripts/entity-cli.js add <entity_name>')
    return
  }

  const entityTemplate = `
  ${entityName}: {
    name: '${entityName.charAt(0).toUpperCase() + entityName.slice(1)}',
    table: '${entityName}',
    fields: {
      id: {
        type: 'uuid',
        primary: true,
        default: 'gen_random_uuid()',
      },
      name: {
        type: 'varchar(255)',
        nullable: false,
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
    rls: {
      policies: ['Service role full access'],
    },
    triggers: [
      \`DROP TRIGGER IF EXISTS update_${entityName}_updated_at ON ${entityName};
       CREATE TRIGGER update_${entityName}_updated_at
       BEFORE UPDATE ON ${entityName}
       FOR EACH ROW
       EXECUTE FUNCTION update_updated_at_column();\`,
    ],
  },`

  console.log('📝 Entity template:')
  console.log(entityTemplate)
  console.log('\n💡 Copy this template to your entities.ts file and customize as needed')
}

// Main CLI logic
const command = process.argv[2]
const arg = process.argv[3]

switch (command) {
  case 'sync':
    syncDatabase()
    break
  case 'generate':
    generateCode()
    break
  case 'add':
    addEntity(arg)
    break
  case 'list':
    listEntities()
    break
  case 'validate':
    validateEntities()
    break
  case 'help':
  case '--help':
  case '-h':
    showHelp()
    break
  default:
    console.log('❌ Unknown command:', command)
    showHelp()
    process.exit(1)
}
