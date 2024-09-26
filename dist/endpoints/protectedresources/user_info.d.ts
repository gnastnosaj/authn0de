import * as functions from "firebase-functions/v1";
import * as express from "express";
import { ProtectedResourceEndpointResponse } from "oauth2-nodejs";
import { AbstractProtectedResourceEndpoint } from "./abstract_protected_resource_endpoint";
export declare class UserInfoEndpoint extends AbstractProtectedResourceEndpoint {
    protected handleRequest(req: express.Request, endpointInfo: ProtectedResourceEndpointResponse): Promise<string>;
    protected validateScope(scopes: string[]): boolean;
}
export declare function userinfo(): functions.HttpsFunction;
