#!/usr/bin/env node

/**
 * Migration script to create courier integration tables
 * Run this with: node scripts/migrate-courier-tables.js
 */

const { Client } = require('pg')
const fs = require('fs')
const path = require('path')
require('dotenv').config()

async function runMigration() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    })

    try {
        await client.connect()
        console.log('✅ Connected to database')

        // Read the SQL file
        const sqlPath = path.join(__dirname, '../../courier-integration.sql')
        const sql = fs.readFileSync(sqlPath, 'utf8')

        console.log('🔄 Running courier integration migration...')
        await client.query(sql)

        console.log('✅ Migration completed successfully!')
        console.log('\nCreated tables:')
        console.log('  - courier_config')
        console.log('  - courier_shipment')
        console.log('  - pathao_store')

    } catch (error) {
        console.error('❌ Migration failed:', error)
        process.exit(1)
    } finally {
        await client.end()
    }
}

runMigration()
