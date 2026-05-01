#!/usr/bin/env node

/**
 * Quick setup script for Courier Integration
 * This script will:
 * 1. Create database tables
 * 2. Optionally add sandbox Pathao configuration
 */

const { Client } = require('pg')
const fs = require('fs')
const path = require('path')
const readline = require('readline')
require('dotenv').config()

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

function question(query) {
    return new Promise(resolve => rl.question(query, resolve))
}

async function setup() {
    console.log('\n🚀 Courier Integration Setup\n')
    console.log('This script will set up the courier integration system.\n')

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    })

    try {
        await client.connect()
        console.log('✅ Connected to database\n')

        // Step 1: Create tables
        console.log('📊 Step 1: Creating database tables...')
        const sqlPath = path.join(__dirname, '../../courier-integration.sql')
        const sql = fs.readFileSync(sqlPath, 'utf8')
        await client.query(sql)
        console.log('✅ Tables created successfully\n')

        // Step 2: Ask about Pathao configuration
        const setupPathao = await question('Would you like to set up Pathao with sandbox credentials? (y/n): ')

        if (setupPathao.toLowerCase() === 'y') {
            console.log('\n📦 Setting up Pathao sandbox configuration...')

            const pathaoConfig = {
                base_url: "https://courier-api-sandbox.pathao.com",
                client_id: "7N1aMJQbWm",
                client_secret: "wRcaibZkUdSNz2EI9ZyuXLlNrnAv0TdPUPXMnD39",
                username: "test@pathao.com",
                password: "lovePathao",
                grant_type: "password"
            }

            // Check if Pathao config already exists
            const existing = await client.query(
                'SELECT id FROM courier_config WHERE provider = $1',
                ['pathao']
            )

            if (existing.rows.length > 0) {
                // Update existing
                await client.query(`
                    UPDATE courier_config
                    SET config = $1, is_sandbox = $2, is_active = $3, updated_at = NOW()
                    WHERE provider = $4
                `, [JSON.stringify(pathaoConfig), true, true, 'pathao'])
                console.log('✅ Pathao sandbox configuration updated\n')
            } else {
                // Insert new
                const id = `courier_pathao_${Date.now()}`
                await client.query(`
                    INSERT INTO courier_config (id, provider, is_active, is_sandbox, config, created_at, updated_at)
                    VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
                `, [id, 'pathao', true, true, JSON.stringify(pathaoConfig)])
                console.log('✅ Pathao sandbox configuration added\n')
            }
        }

        console.log('\n🎉 Setup completed successfully!\n')
        console.log('Next steps:')
        console.log('1. Restart your backend server (npm run dev)')
        console.log('2. Go to Admin Panel → Settings → Courier Settings')
        console.log('3. Test the connection to Pathao')
        console.log('4. Create a shipment from any order\n')
        console.log('📖 For more details, see COURIER_INTEGRATION_GUIDE.md\n')

    } catch (error) {
        console.error('\n❌ Setup failed:', error.message)
        console.error('\nDetails:', error)
        process.exit(1)
    } finally {
        await client.end()
        rl.close()
    }
}

setup()
