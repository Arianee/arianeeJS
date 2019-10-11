import axios from 'axios';

export class ArianeeHttpClient {

    constructor(){

    }

    public static get defaultConfig() {
        return {
            method: 'GET',
            headers: {
                "Content-Type": "application/json"
            }
        };
    }
    public static fetch(url: string, config: any = {...ArianeeHttpClient.defaultConfig}) {
        if (config.body) {
            config.data = config.body;
        }

        return axios(url, config)
            .then(result => result.data);
    }

}