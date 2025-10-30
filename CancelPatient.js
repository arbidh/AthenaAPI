const crypto = require('crypto');
const axios = require('axios');
const AWS = require('aws-sdk');
const secretsManager = new AWS.SecretsManager();
const SECRET_ID = "\\YourSecretID";

// Global cachedToken variable
let token;
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
 
        token = await getAuthToken({ isProd: true })
        console.log("Token:", token);
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

const getAuthToken = async ({ isProd }) => {
    try {
      const response = await axios.post('https://pdphr49frb.execute-api.us-west-1.amazonaws.com/Production/GetAuthToken', {
        args: {
          isProd
        }
      });
  
      if (response.status !== 200) {
        throw new Error(`Auth call failed with status ${response.status}: ${response.statusText}`);
      }
  
      const { token, data } = response.data;
  
      if (!token && data?.token) {
        return data.token;
      } else if (!token) {
        throw new Error('No token found in response');
      }
  
      return token;
    } catch (error) {
      console.error('Error fetching token via HTTP:', error.message);
      throw error;
    }
  };

const cancel = async (appointmentid, cancellationreason, patientid) => {

    const patientidint = parseInt(patientid, 10);
    const appointmentidint = parseInt(appointmentid, 10);
    if (!appointmentid) {
        console.error("❌ Error: appointmentid is undefined.");
        return { error: "Invalid appointment ID" };
    }

    console.log(`📅 Cancelling appointment ${appointmentid} for patient ${patientid}`);

    const url = `https://api.platform.athenahealth.com/v1/${practiceid}/appointments/${appointmentid}/cancel`;

    const headers = {
        'Authorization': `Bearer ${token.access_token}`,
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
