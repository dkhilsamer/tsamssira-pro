const db = require('./src/db');

async function debugBoost() {
    try {
        console.log('Fetching pending boost requests...');
        const sql = `
            SELECT br.id, br.property_id, br.status 
            FROM boost_requests br 
            WHERE status = 'pending'
        `;
        const reqs = await db.query(sql);
        console.log('Pending Requests:', reqs);

        if (reqs.length > 0) {
            const reqId = reqs[0].id;
            const propId = reqs[0].property_id;
            console.log(`\nAttempting to approve Request ID: ${reqId} for Property ID: ${propId}`);

            // Simulate the update query
            console.log('Running Update Query...');
            try {
                const res = await db.query('UPDATE properties SET is_boosted = 1, boost_end_date = DATE_ADD(NOW(), INTERVAL 7 DAY) WHERE id = ?', [propId]);
                console.log('Update Success:', res);
            } catch (sqle) {
                console.error('Update Query Failed:', sqle);
            }
        } else {
            console.log('No pending requests to test.');
        }

    } catch (err) {
        console.error('Main Error:', err);
    } finally {
        process.exit();
    }
}

debugBoost();
