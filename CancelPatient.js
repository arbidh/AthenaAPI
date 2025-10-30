const crypto = require('crypto');
const axios = require('axios');
const athena = require('./AthenaClient');

// Global cachedToken variable
let cachedToken;
const practiceid = athena.getPracticeId(1);

exports.handler = async (event) => {
    try {
        console.log('Raw event body:', event.body);

        if (!event.body || event.body.trim() === "") {
            return { 
                statusCode: 400, 
                body: JSON.stringify({ error: "Missing or empty request body" }) 
            };
        }
        //insert your AI Signature 
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
        
        const { patientid, appointmentid, cancellationreason } = payload.args;

        // Ensure we have a valid token before making any API call.
 
        // Assign to module-level cachedToken so helper functions can access it
        cachedToken = await athena.getToken();
        if (appointmentid == null) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Appointment ID is required to cancel" })
            };
        }
        const patientResponse = await cancel(appointmentid, cancellationreason, patientid);
        console.log("Patient Response:", patientResponse);

        return {
            statusCode: 200,
            body: JSON.stringify({message: `successfully cancelled appointmentid: ${appointmentid}`})
        };
        
    } catch (error) {
        console.error('Error in handler:', error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error', message: error.message }),
        };
    }
};

// Token retrieval moved to AthenaClient.getToken()

const cancel = async (appointmentid, cancellationreason, patientid) => {

    const patientidint = parseInt(patientid, 10);
    const appointmentidint = parseInt(appointmentid, 10);
    if (!appointmentid) {
        console.error("❌ Error: appointmentid is undefined.");
        return { error: "Invalid appointment ID" };
    }

    console.log(`📅 Cancelling appointment ${appointmentid} for patient ${patientid}`);

    const url = `${athena.getBaseUrl()}/v1/${practiceid}/appointments/${appointmentid}/cancel`;

    const headers = {
        'Authorization': `Bearer ${cachedToken.access_token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
    };

    const body = new URLSearchParams({
        cancellationreason: cancellationreason,
        ignoreschedulablepermission: true,
        patientid: patientidint
    });

    console.log("📤 Sending API request with body:", body.toString());

    try {
        const response = await axios.put(url, body.toString(), { headers, timeout: 10000 });
        console.log("✅ Successfully cancelled appointment:", response.data);
        return response.data;
    } catch (error) {
        console.error("❌ Error in cancel:", error.response?.data || error.message);
        if (error.response) {
            return { error: error.response.data.message || 'Unknown error from Athena API' };
        } else if (error.request) {
            return { error: 'Network Error: Failed to send request' };
        } else {
            return { error: 'Unexpected Error: Failed to process request' };
        }
    }
};

const formatResponse = (statusCode, body) => ({
    statusCode,
    body: JSON.stringify(body),
});
