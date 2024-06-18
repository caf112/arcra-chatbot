import {AzureOpenAI} from "openai";

const apiKey = process.env.AZURE_OPENAI_API_KEY;
const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const apiVersion = process.env.AZURE_OPENAI_API_VERSION_ID_1;

if(!apiKey){
    console.error("APIキーが設定されていません。");
    process.exit(1);
}
if (!endpoint) {
    console.error("エンドポイントが設定されていません。");
    process.exit(1);
}
if (!apiVersion) {
    console.error("APIバージョンが設定されていません。");
    process.exit(1);
}

export const openai = new AzureOpenAI({
    apiKey:apiKey,
    endpoint:endpoint,
    apiVersion:apiVersion
})
