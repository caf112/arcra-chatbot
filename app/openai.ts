import {AzureOpenAI} from "openai";

const apiKey = process.env.AZURE_OPENAI_API_KEY;
const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const apiVersion = process.env.AZURE_OPENAI_API_VERSION_ID_1;

export const openai = new AzureOpenAI({
    apiKey:apiKey,
    endpoint:endpoint,
    apiVersion:apiVersion
})
