import React from 'react'
import * as core from '../../lib/core'

const CreateCompany = () => {
    const createNewCompanyPost = async () => {
        const json = await core.mockAPI(
            "API_METHODS.POST",
            "COMPANY_API.POST_CREATE_COMPANY_PROFILE",
            1,
            {
                name: "test",
                founder: "test",
                size: "test",
                about: "test",
                links: "test",
            },
        );
        console.log("JSON:", json);

    };
    return (
        <div>
            <h1>Create Company</h1>
            <button onClick={createNewCompanyPost}>Create Company</button>
        </div>
    )
}

export default CreateCompany