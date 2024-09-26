"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.customAuthorize = customAuthorize;
const functions = require("firebase-functions/v1");
const express = require("express");
const models_1 = require("../models");
const oauth2_nodejs_1 = require("oauth2-nodejs");
const data_1 = require("../data");
const utils_1 = require("../utils");
const cors = require("cors");
const sliLogger_1 = require("../utils/sliLogger");
class AuthorizeApp {
    static create(providerName, authenticationUrl) {
        const authorizeApp = express();
        authorizeApp.use(cors({ origin: "*" }));
        const authorizeProvider = (req, resp) => __awaiter(this, void 0, void 0, function* () {
            const request = new models_1.RequestWrapper(req);
            const authorizationEndpoint = new oauth2_nodejs_1.AuthorizationEndpoint();
            functions.logger.log(request);
            authorizationEndpoint.dataHandlerFactory = new data_1.CloudFirestoreDataHandlerFactory();
            authorizationEndpoint.allowedResponseTypes = ["code", "token"];
            // SLI Logger
            const metadataResourceType = "Firebase Auth";
            const metadataAction = "Authorization";
            const metadataCriticalUserJourney = "SSO";
            const metadata = (0, sliLogger_1.cloudLoggingMetadata)((0, sliLogger_1.getProjectId)(), metadataResourceType, metadataAction, metadataCriticalUserJourney);
            functions.logger.info("reqeuest", request);
            functions.logger.info("authorizationEndpoint", authorizationEndpoint);
            try {
                const authorizationEndpointResponse = yield authorizationEndpoint.handleRequest(request);
                functions.logger.info(authorizationEndpointResponse);
                if (authorizationEndpointResponse.isSuccess()) {
                    const authToken = {
                        client_id: request.getParameter("client_id"),
                        redirect_uri: request.getParameter("redirect_uri"),
                        response_type: request.getParameter("response_type"),
                        scope: request.getParameter("scope"),
                        created_at: Date.now(),
                    };
                    const state = request.getParameter("state");
                    if (state) {
                        authToken["state"] = state;
                    }
                    const authTokenString = utils_1.Crypto.encrypt(JSON.stringify(authToken));
                    // SLI Logger
                    (0, sliLogger_1.sendSuccessIndicator)(metadata, "Successfully authorized user, redirecting to /authentication", metadataResourceType, metadataAction);
                    utils_1.Navigation.redirect(resp, `${authenticationUrl}`, {
                        auth_token: authTokenString,
                    });
                }
                else {
                    const error = authorizationEndpointResponse.error;
                    functions.logger.error(error.toJson());
                    resp.contentType("application/json; charset=UTF-8");
                    resp.status(error.code).send(error.toJson());
                    // SLI Logger
                    (0, sliLogger_1.sendFailureIndicator)(metadata, "Authorization failure", metadataResourceType, metadataAction);
                }
            }
            catch (error) {
                resp.status(500).send(error.toString());
                (0, sliLogger_1.sendFailureIndicator)(metadata, "Authorization failure", metadataResourceType, metadataAction);
            }
        });
        authorizeApp.get("/authorize/entry", authorizeProvider);
        authorizeApp.get("/entry", authorizeProvider);
        return authorizeApp;
    }
}
function customAuthorize(authenticationUrl) {
    return functions.https.onRequest(AuthorizeApp.create("Custom", authenticationUrl));
}
//# sourceMappingURL=authorize.js.map