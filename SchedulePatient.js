const crypto = require('crypto');
const axios = require('axios');
const athena = require('./AthenaClient');

// Global cachedToken variable
let cachedToken;
const practiceid = 1


exports.handler = async (event) => {
    try {
        console.log('Raw event body:', event.body);

        if (!event.body || event.body.trim() === "") {
            return { 
                statusCode: 400, 
                body: JSON.stringify({ error: "Missing or empty request body" }) 
            };
        }
        //insert Your AI key signature here 
        let payload;
        try {
            payload = JSON.parse(event.body);
        } catch (error) {
            return { 
                statusCode: 400, 
                body: JSON.stringify({ error: "Invalid JSON format" }) 
            };
        }
        console.log("Parsed payload:", payload);

        const { patientid, providerid, departmentid, existing, appointmentid, appointmenttypeid} = payload.args;

    // Ensure we have a valid token before making any API call.
    cachedToken = await athena.getToken();
        

        const reasonid = existing ? 4 : 12;
        
        const patientResponse = await bookPatient(providerid,patientid, appointmentid,reasonid, departmentid, appointmenttypeid);
        console.log("Patient Response:", patientResponse);

        return {
            statusCode: 200,
            body: JSON.stringify(patientResponse)
        };
        
    } catch (error) {
        console.error('Error in handler:', error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error', message: error.message }),
        };
    }
};
const formatResponse = (statusCode, body) => ({
    statusCode,
    body: JSON.stringify(body),
});
const formatDate = (date) => {
    const d = new Date(date);
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
};

// Token retrieval moved to AthenaClient.getToken()

const bookPatient = async (providerid,patientid, appointmentid,reasonid, departmentid, appointmenttypeid) => {

    if (!patientid || isNaN(patientid)) {
        console.error("❌ Error: Invalid patient ID received:", patientid);
        return { statusCode: 400, body: JSON.stringify({ error: "Invalid patient ID" }) };
    }

    const patientIdInt = parseInt(patientid, 10);
    const reasonIdInt = parseInt(reasonid, 10);
    const provideridInt = parseInt(providerid, 10);
    const appointmentIdStr = String(appointmentid).trim();
    const departmentidInt = parseInt(departmentid, 10);
    const appointmenttypeidInt = parseInt(appointmenttypeid, 10);

    if (!appointmentIdStr || appointmentIdStr === "undefined" || appointmentIdStr === "null") {
        console.error("❌ Error: Invalid appointment ID received:", slot);
        return { statusCode: 400, body: JSON.stringify({ error: "Invalid appointment ID" }) };
    }

    const url = `https://api.platform.athenahealth.com/v1/${practiceid}/appointments/${appointmentIdStr}`;

    if (!cachedToken || !cachedToken.access_token) {
        console.error("❌ Error: Missing authentication token");
        return { statusCode: 401, body: JSON.stringify({ error: "Unauthorized: Missing auth token" }) };
    }
    if (!appointmenttypeidInt) {
        console.error("❌ Error: Invalid appointment type ID received:", appointmenttypeidInt);
        return { statusCode: 400, body: JSON.stringify({ error: "Invalid appointment type ID" }) };
    }
    
    const headers = {
        Authorization: `Bearer ${cachedToken.access_token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
    };

    const body = new URLSearchParams({
        patientid: patientIdInt,
        departmentid: departmentidInt,
        providerid: provideridInt,
        appointmenttypeid: appointmenttypeidInt,
        ignoreschedulablepermission: true 
    });

    console.log("📝 Request body:", body.toString());

    try {
        const response = await axios.put(url, body.toString(), { 
            headers, 
            timeout: 90000 // Increase timeout to 60 seconds
        });

        console.log("✅ Successfully booked appointment:", response.data);
        return { 
            statusCode: 200, 
            body: JSON.stringify(response.data)
        };
    } catch (error) {
        console.error("❌ Error in bookPatient:", error.response?.data || error.message);

        if (error.response && error.response.status === 409) {
            console.error("⚠️ The appointment is already booked or not available.");
            return { 
                statusCode: 409, 
                body: JSON.stringify({ 
                    error: "That appointment time was already booked or not available for booking.",
                    detailedmessage: error.response.data.detailedmessage || "No further details provided."
                }) 
            };
        }

        if (error.code === 'ECONNABORTED') {
            return { statusCode: 504, body: JSON.stringify({ error: "Request Timeout: API took too long to respond" }) };
        }

        return { 
            statusCode: 500, 
            body: JSON.stringify({ error: "Failed to book patient", message: error }) 
        };
    }
};

