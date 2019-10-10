import ClientBrowser  from "jayson/lib/client/browser";
import { ArianeeHttpClient } from "./arianeeHttpClient";

export class ArianeeRPC {
    withURI = url => {
    const callServer = async (request, callback) => {
      const result = await ArianeeHttpClient.fetch(url,{
        method: "POST",
        body: request,
        headers: {
          "Content-Type": "application/json"
        }
      })
    .then(function(text) { callback(null, text); })
    .catch(function(err) { callback(err); });
    };

    const client = (<any>ClientBrowser)(callServer, {
      // other options go here
    });

    return client;
  }
}
