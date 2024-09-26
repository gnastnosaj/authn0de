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
exports.customAuthentication = customAuthentication;
const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const qs = require("qs");
const models_1 = require("../models");
const utils_1 = require("../utils");
const data_1 = require("../data");
const sliLogger_1 = require("../utils/sliLogger");
class AuthenticationApp {
    static create(providerName, authenticationUrl) {
        const authenticationApp = express();
        authenticationApp.use(cors({ origin: "*" }));
        const authenticationGet = (req, resp) => {
            const request = new models_1.RequestWrapper(req);
            const authToken = request.getParameter("auth_token");
            const payload = {
                authToken: authToken,
            };
            const strippedUrl = authenticationUrl.split("?")[0];
            const urlWithPayload = `${strippedUrl}?${qs.stringify(payload)}`;
            resp.redirect(urlWithPayload);
        };
        authenticationApp.get("/", authenticationGet);
        authenticationApp.get("/authentication", authenticationGet);
        const authenticationPost = (req, resp) => __awaiter(this, void 0, void 0, function* () {
            const request = new models_1.RequestWrapper(req);
            const encyptedAuthToken = request.getParameter("auth_token");
            const idTokenString = request.getParameter("id_token");
            const success = request.getParameter("success");
            // SLI Logger
            const metadataResourceType = "Firebase Auth";
            const metadataAction = "Authentication";
            const metadataCriticalUserJourney = "SSO";
            const metadata = (0, sliLogger_1.cloudLoggingMetadata)((0, sliLogger_1.getProjectId)(), metadataResourceType, metadataAction, metadataCriticalUserJourney);
            const authToken = JSON.parse(utils_1.Crypto.decrypt(request.getParameter("auth_token")));
            let client;
            if (success === "true") {
                try {
                    const idToken = yield admin.auth().verifyIdToken(idTokenString);
                    if (idToken.aud === process.env.GCLOUD_PROJECT) {
                        client = yield data_1.CloudFirestoreClients.fetch(authToken["client_id"]);
                        if (client === null || client === void 0 ? void 0 : client.implicitConsent) {
                            const payload = yield (0, utils_1.processConsent)(resp, {
                                action: "allow",
                                authToken,
                                userId: idToken.sub,
                            }, { redirect: !(client === null || client === void 0 ? void 0 : client.browserRedirect) });
                            // SLI Logger
                            (0, sliLogger_1.sendSuccessIndicator)(metadata, "Browser redirect to avoid CORS", metadataResourceType, metadataAction);
                            return resp.json(payload);
                        }
                        else {
                            const encryptedUserId = utils_1.Crypto.encrypt(idToken.sub);
                            utils_1.Navigation.redirect(resp, "/authorize/consent", {
                                auth_token: encyptedAuthToken,
                                user_id: encryptedUserId,
                            });
                        }
                    }
                }
                catch (error) {
                    // SLI Logger
                    (0, sliLogger_1.sendFailureIndicator)(metadata, "Authentication error", metadataResourceType, metadataAction);
                    return resp.json({ error: JSON.stringify(error) });
                }
            }
            if (client === null || client === void 0 ? void 0 : client.browserRedirect) {
                // SLI Logger
                (0, sliLogger_1.sendFailureIndicator)(metadata, "Authentication error", metadataResourceType, metadataAction);
                return resp.json({
                    error: "access_denied",
                });
            }
            utils_1.Navigation.redirect(resp, authToken["redirect_uri"], {
                error: "access_denied",
            });
            // SLI Logger
            (0, sliLogger_1.sendFailureIndicator)(metadata, "Authentication error", metadataResourceType, metadataAction);
            return;
        });
        authenticationApp.post("/", authenticationPost);
        authenticationApp.post("/authentication", authenticationPost);
        return authenticationApp;
    }
}
function customAuthentication(authenticationUrl) {
    return functions.https.onRequest(AuthenticationApp.create("custom", authenticationUrl));
}
//# sourceMappingURL=authentication.js.map