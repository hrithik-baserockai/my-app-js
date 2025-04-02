// // API

// export const API = async (method, endpoint, token, body, content_type) => {
//     let response = null;
//     let options = null;
//     if (token === 0) {
//         let ps_id = await getData(data.PS_ID);
//         options = {
//             method: method,
//             headers: {
//                 "Content-Type": content_type ?? "application/json",
//                 Ps: ps_id,
//             },
//             retries: 0,
//             retryDelay: 3000,
//         };
//         if (method !== API_METHODS.GET) {
//             options.body = JSON.stringify(body);
//         }
//         console.log("response", options, options.body);
//         response = await fetch(endpoint, options);
//     } else if (token == 2) {
//         const urlParams = new URLSearchParams(window.location.search);
//         const tokenFromQuery = urlParams.get("token");

//         let ps_id = await getData(data.PS_ID);
//         options = {
//             method: method,
//             headers: {
//                 "Content-Type": content_type ?? "application/json",
//                 Ps: ps_id,
//                 Authorization: "Bearer " + tokenFromQuery,
//             },
//             retries: 0,
//             retryDelay: 3000,
//         };
//         if (method !== API_METHODS.GET) {
//             options.body = JSON.stringify(body);
//         }
//         console.log("response", options, options.body);
//         response = await fetch(endpoint, options);
//     } else {
//         let ps_id = await getData(data.PS_ID);
//         options = {
//             method: method,
//             headers: {
//                 "Content-Type": content_type ?? "application/json",
//                 Authorization: "Bearer " + (await getData(data.ACCESS_TOKEN)),
//                 Ps: ps_id,
//             },
//             retries: 0,
//             retryDelay: 3000,
//         };
//         if (method !== API_METHODS.GET) {
//             options.body = JSON.stringify(body);
//         }
//         response = await fetch(endpoint, options);
//     }

//     let x = await response.json();

//     if (x?.message === "Token Expired") {
//         logout();
//         // window.location.replace("/login");
//         return;
//     }
//     return x;
// };


// Mock API Data (replace with your desired mock data)
const mockApiResponse = {
    data: {
        message: 'Success!',
        items: [
            { id: 1, name: 'Item 1' },
            { id: 2, name: 'Item 2' },
        ],
    },
};

const mockApiErrorResponse = {
    message: "Token Expired"
}

/**
 * Mock implementation of the API function.
 *
 * @param {string} method  HTTP method (GET, POST, etc.)
 * @param {string} endpoint API endpoint URL
 * @param {number} token   Token type (0, 1, 2, etc.) - determines authentication behavior
 * @param {object} body     Request body (for POST, PUT, etc.)
 * @param {string} content_type Content type of the request (e.g., 'application/json')
 * @returns {Promise<any>} A Promise that resolves to the mock API response data.  Can return undefined if token is expired for testing
 */
export const mockAPI = async (method, endpoint, token, body, content_type) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => { // Simulate network latency

            if (token === -1) { //Simulate token expired.  Just a test value.
                resolve(mockApiErrorResponse);
                return;
            }

            // Basic mock logic based on token type.  You'd expand this in a real mock.
            if (token === 0) {
                // No token required - Simulate a public endpoint
                resolve(mockApiResponse);
            } else if (token === 1) {
                // Simulate needing a valid token
                if (body?.validToken === true) { //Check if the token is valid
                    resolve(mockApiResponse);
                } else {
                    resolve({ message: 'Invalid token' }); //Simulate error
                }
            } else if (token === 2) {
                resolve(mockApiResponse);
            } else {
                resolve({ message: 'Unknown token type' });
            }
        }, 500); // 500ms delay
    });
};