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
exports.tokeninfo = tokeninfo;
const functions = require("firebase-functions/v1");
const models_1 = require("../models");
const oauth2_nodejs_1 = require("oauth2-nodejs");
const data_1 = require("../data");
const sliLogger_1 = require("../utils/sliLogger");
function tokeninfo() {
    // SLI Logger
    const metadataResourceType = "Firebase Auth";
    const metadataAction = "Token Registration";
    const metadataCriticalUserJourney = "SSO";
    const metadata = (0, sliLogger_1.cloudLoggingMetadata)((0, sliLogger_1.getProjectId)(), metadataResourceType, metadataAction, metadataCriticalUserJourney);
    return functions.https.onRequest((req, resp) => __awaiter(this, void 0, void 0, function* () {
        if (req.method === "GET") {
            const request = new models_1.RequestWrapper(req);
            const tokeninfoEndpoint = new oauth2_nodejs_1.TokeninfoEndpoint();
            tokeninfoEndpoint.dataHandlerFactory = new data_1.CloudFirestoreDataHandlerFactory();
            try {
                const tokeninfoEndpointResponse = yield tokeninfoEndpoint.handleRequest(request);
                resp.contentType("application/json; charset=UTF-8");
                resp.status(tokeninfoEndpointResponse.code).send(tokeninfoEndpointResponse.body);
                // SLI Logger
                (0, sliLogger_1.sendSuccessIndicator)(metadata, "Successfully provided token", metadataResourceType, metadataAction);
            }
            catch (error) {
                resp.status(500).send(error.toString());
                // SLI Logger
                (0, sliLogger_1.sendFailureIndicator)(metadata, "Failed to provide token info", metadataResourceType, metadataAction);
            }
        }
        else {
            resp.status(405).send("Method Not Allowed");
            // SLI Logger
            (0, sliLogger_1.sendFailureIndicator)(metadata, "Failed to provide token info, method not allowed", metadataResourceType, metadataAction);
        }
    }));
}
//# sourceMappingURL=token_info.js.map