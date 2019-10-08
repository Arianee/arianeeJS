import axios from 'axios';
import { ArianeeConfig } from '../../../models/ariaanee-config';
import { config } from 'shelljs';

export class ArianeeHttpClient {
    constructor(private arianeeConfig: ArianeeConfig) {
    }

    public static get defaultConfig() {
        return {
            method: 'GET',
            headers: {
                "Content-Type": "application/json"
            }
        }
    }
    public static fetch(url: string, config: any = {...ArianeeHttpClient.defaultConfig}) {
        if (config.body) {
            config.data = config.body;
        }

        return axios(url, config)
            .then(result => result.data)
    }


}