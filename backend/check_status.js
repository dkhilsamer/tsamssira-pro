const db = require('./src/db');

async function checkStatusSchema() {
    try {
        const res = await db.query("SHOW CREATE TABLE boost_requests");
        console.log(res);
        const res2 = await db.query("SHOW CREATE TABLE rental_requests");
        console.log(res2);
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

checkStatusSchema();
