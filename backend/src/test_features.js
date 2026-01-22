const axios = require('axios');
const assert = require('assert');

const BASE_URL = 'http://localhost:3000/api';
let ownerToken = null;
let clientToken = null;
let ownerId = null;
let clientId = null;
let propertyId = null;

// Helper to manage cookies/session
const axiosInstance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    validateStatus: () => true // Handle 4xx/5xx manually
});

// We need to manage cookies manually for axios in node
let ownerCookie = null;
let clientCookie = null;

async function runTest() {
    console.log('--- Starting System Test ---');

    try {
        // 1. Register/Login Owner
        console.log('\n1. Setting up Owner...');
        const ownerUser = {
            username: 'test_owner_' + Date.now(),
            password: 'password123',
            email: `owner_${Date.now()}@test.com`,
            role: 'proprietaire',
            phone: '12345678'
        };

        // Register Owner
        let res = await axiosInstance.post('/auth/register', ownerUser);
        if (res.status === 201 || res.status === 200) {
            console.log('✅ Owner Registered');
        } else {
            console.error('❌ Owner Register Failed:', res.data);
            return;
        }

        // Login Owner to get session
        res = await axiosInstance.post('/auth/login', {
            username: ownerUser.username,
            password: ownerUser.password
        });

        if (res.status === 200) {
            ownerCookie = res.headers['set-cookie'];
            ownerId = res.data.user.id;
            console.log('✅ Owner Logged In (ID:', ownerId, ')');
        } else {
            console.error('❌ Owner Login Failed:', res.data);
            return;
        }

        // 2. Setup Client
        console.log('\n2. Setting up Client...');
        const clientUser = {
            username: 'test_client_' + Date.now(),
            password: 'password123',
            email: `client_${Date.now()}@test.com`,
            role: 'viziteur', // or whatever the role string is
            phone: '87654321'
        };

        // Register Client
        res = await axiosInstance.post('/auth/register', clientUser);
        if (res.status === 201 || res.status === 200) {
            console.log('✅ Client Registered');
        } else {
            console.error('❌ Client Register Failed:', res.data);
            return;
        }

        // Login Client
        res = await axiosInstance.post('/auth/login', {
            username: clientUser.username,
            password: clientUser.password
        });

        if (res.status === 200) {
            clientCookie = res.headers['set-cookie'];
            clientId = res.data.user.id;
            console.log('✅ Client Logged In (ID:', clientId, ')');
        } else {
            console.error('❌ Client Login Failed:', res.data);
            return;
        }

        // 3. Create Student Property (As Owner)
        console.log('\n3. Creating Student Property...');
        const propertyData = {
            title: 'Chambre Étudiant Test',
            description: 'Une superbe chambre pour étudiant',
            price: 300,
            location: 'Tunis',
            bedrooms: 1,
            bathrooms: 1,
            area: 20,
            type: 'Location',
            property_category: 'etudiant', // Matches ENUM('etudiant', 'famille')
            is_student: 1 // TEST THIS
        };

        res = await axiosInstance.post('/properties', propertyData, {
            headers: { Cookie: ownerCookie }
        });

        if (res.status === 201) {
            propertyId = res.data.id;
            console.log('✅ Property Created (ID:', propertyId, ')');
        } else {
            console.error('❌ Property Create Failed:', res.data);
            return;
        }

        // 4. Client Search for Student Property
        console.log('\n4. Testing Student Filter...');
        res = await axiosInstance.get('/properties?is_student=1', {
            headers: { Cookie: clientCookie }
        });

        if (res.status === 200) {
            const found = res.data.some(p => p.id === propertyId);
            if (found) {
                console.log('✅ Student property found in filter results');
            } else {
                console.error('❌ Student property NOT found in results!', res.data.map(p => ({ id: p.id, is_student: p.is_student })));
            }
        } else {
            console.error('❌ Search Failed:', res.data);
        }

        // 5. Client Sends Message
        console.log('\n5. Sending Message from Client to Owner...');
        const msgContent = "Bonjour, est-ce dispo pour un étudiant ?";
        res = await axiosInstance.post('/messages', {
            receiver_id: ownerId,
            property_id: propertyId,
            content: msgContent
        }, {
            headers: { Cookie: clientCookie }
        });

        if (res.status === 201) {
            console.log('✅ Message Sent');
        } else {
            console.error('❌ Send Message Failed:', res.data);
            return;
        }

        // 6. Owner Checks Conversations
        console.log('\n6. Owner Checking Inbox...');
        res = await axiosInstance.get('/messages/conversations', {
            headers: { Cookie: ownerCookie }
        });

        if (res.status === 200) {
            // Should see client
            const conv = res.data.find(c => c.user_id === clientId);
            if (conv) {
                console.log('✅ Conversation with Client found');
                console.log('   Preview:', conv.last_message);
            } else {
                console.error('❌ Conversation NOT found!');
            }
        } else {
            console.error('❌ Get Conversations Failed:', res.data);
        }

        // 7. Owner Reads Messages
        console.log('\n7. Owner Reading Chat...');
        res = await axiosInstance.get(`/messages/${clientId}`, {
            headers: { Cookie: ownerCookie }
        });

        if (res.status === 200) {
            const msgs = res.data;
            const myMsg = msgs.find(m => m.content === msgContent);
            if (myMsg) {
                console.log('✅ Message content verified in chat history');
            } else {
                console.error('❌ Specific message not found in history');
            }
        } else {
            console.error('❌ Get Messages Failed:', res.data);
        }

        console.log('\n--- Test Completed ---');

    } catch (err) {
        console.error('FATAL TEST ERROR:', err.message);
        if (err.response) console.error('Response data:', err.response.data);
    }
}

runTest();
