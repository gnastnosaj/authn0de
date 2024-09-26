import * as express from "express";
import * as functions from "firebase-functions/v1";
import { ProtectedResourceEndpointResponse } from "oauth2-nodejs";
export declare abstract class AbstractProtectedResourceEndpoint {
    get endpoint(): functions.HttpsFunction;
    protected abstract validateScope(scope: string[]): boolean;
    protected abstract handleRequest(req: express.Request, endpointInfo: ProtectedResourceEndpointResponse): Promise<string>;
}
