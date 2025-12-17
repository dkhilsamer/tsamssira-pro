const db = require('./src/db');

async function checkSchema() {
    try {
        console.log('Checking tables...');
        const tables = await db.query('SHOW TABLES');
        console.log('Tables:', tables.map(t => Object.values(t)[0]));

        console.log('\nChecking properties columns...');
        const columns = await db.query('SHOW COLUMNS FROM properties');
        console.log('Properties Columns:', columns.map(c => c.Field));

        console.log('\nChecking boost_requests columns...');
        try {
            const boostCols = await db.query('SHOW COLUMNS FROM boost_requests');
            console.log('Boost Requests Columns:', boostCols.map(c => c.Field));
        } catch (e) {
            console.log('boost_requests table does NOT exist.');
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit();
    }
}

checkSchema();
