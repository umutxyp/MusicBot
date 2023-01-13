import axios from "axios"

const apiURL = "https://api.soundcloud.com/"
const apiV2URL = "https://api-v2.soundcloud.com/"
const webURL = "https://www.soundcloud.com/"

export default class API {
    public static headers = {"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36"}
    public constructor(public clientID: string, public oauthToken: string, public proxy: string) {}

    /**
     * Gets an endpoint from the Soundcloud API.
     */
    public get = async (endpoint: string, params?: any) => {
        if (!params) params = {}
        params.client_id = await this.getClientID()
        if (this.oauthToken) params.oauth_token = this.oauthToken
        if (endpoint.startsWith("/")) endpoint = endpoint.slice(1)
        endpoint = apiURL + endpoint
        if (this.proxy) endpoint = this.proxy + endpoint
        try { 
            const response = await axios.get(endpoint, {params, headers: API.headers}).then((r) => r.data)
            return response
        } catch {
            params.client_id = await this.getClientID(true)
            const response = await axios.get(endpoint, {params, headers: API.headers}).then((r) => r.data)
            return response
        }
    }

    /**
     * Gets an endpoint from the Soundcloud V2 API.
     */
    public getV2 = async (endpoint: string, params?: any) => {
        if (!params) params = {}
        params.client_id = await this.getClientID()
        if (this.oauthToken) params.oauth_token = this.oauthToken
        if (endpoint.startsWith("/")) endpoint = endpoint.slice(1)
        endpoint = apiV2URL + endpoint
        if (this.proxy) endpoint = this.proxy + endpoint
        try {
            const response = await axios.get(endpoint, {params, headers: API.headers}).then((r) => r.data)
            return response
        } catch {
            params.client_id = await this.getClientID(true)
            const response = await axios.get(endpoint, {params, headers: API.headers}).then((r) => r.data)
            return response
        }
        
    }

    /**
     * Some endpoints use the main website as the URL.
     */
    public getWebsite = async (endpoint: string, params?: any) => {
        if (!params) params = {}
        params.client_id = await this.getClientID()
        if (this.oauthToken) params.oauth_token = this.oauthToken
        if (endpoint.startsWith("/")) endpoint = endpoint.slice(1)
        endpoint = webURL + endpoint
        if (this.proxy) endpoint = this.proxy + endpoint
        try {
            const response = await axios.get(endpoint, {params, headers: API.headers}).then((r) => r.data)
            return response
        } catch {
            params.client_id = await this.getClientID(true) 
            const response = await axios.get(endpoint, {params, headers: API.headers}).then((r) => r.data)
            return response
        }
    }

    /**
     * Gets a URL, such as download, stream, attachment, etc.
     */
    public getURL = async (URI: string, params?: any) => {
        if (!params) params = {}
        params.client_id = await this.getClientID()
        if (this.oauthToken) params.oauth_token = this.oauthToken
        if (this.proxy) URI = this.proxy + URI
        try {
            const response = await axios.get(URI, {params, headers: API.headers}).then((r) => r.data)
            return response
        } catch {
            params.client_id = await this.getClientID(true)
            const response =  await axios.get(URI, {params, headers: API.headers}).then((r) => r.data)
            return response
        }
    }

    public post = async (endpoint: string, params?: any) => {
        if (!params) params = {}
        params.client_id = await this.getClientID()
        if (this.oauthToken) params.oauth_token = this.oauthToken
        if (endpoint.startsWith("/")) endpoint = endpoint.slice(1)
        endpoint = apiURL + endpoint
        if (this.proxy) endpoint = this.proxy + endpoint
        const response = await axios.post(endpoint, {params, headers: API.headers}).then((r) => r.data)
        return response
    }

    public getClientID = async (reset?: boolean) => {
        if (!this.clientID || reset) {
            let url = webURL
            if (this.proxy) url = this.proxy + url
            const response = await axios.get(url).then((r) => r.data)
            const urls = response.match(/(?!<script crossorigin src=")https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*\.js)(?=">)/g)
            let script: string
            do {
                script = await axios.get(urls.pop()).then((r) => r.data)
            } while (!script.includes(",client_id:\"") && urls.length > 0)
            this.clientID = script.match(/,client_id:"(\w+)"/)?.[1]
            if (!this.clientID) Promise.reject("Unable to fetch a SoundCloud API key!")
        }
        return this.clientID
    }
}
