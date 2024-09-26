"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserInfoEndpoint = void 0;
exports.userinfo = userinfo;
const admin = require("firebase-admin");
const abstract_protected_resource_endpoint_1 = require("./abstract_protected_resource_endpoint");
const sliLogger_1 = require("../../utils/sliLogger");
class UserInfoEndpoint extends abstract_protected_resource_endpoint_1.AbstractProtectedResourceEndpoint {
    handleRequest(req, endpointInfo) {
        return new Promise((resolve, reject) => {
            // SLI Logger
            const metadataResourceType = "Firebase Auth";
            const metadataAction = "Get User Info";
            const metadataCriticalUserJourney = "SSO";
            const metadata = (0, sliLogger_1.cloudLoggingMetadata)((0, sliLogger_1.getProjectId)(), metadataResourceType, metadataAction, metadataCriticalUserJourney);
            const auth = admin.auth();
            auth.updateUser(endpointInfo.userId, { emailVerified: true });
            auth
                .getUser(endpointInfo.userId)
                .then((userRecord) => {
                var _a, _b;
                resolve(JSON.stringify({
                    sub: endpointInfo.userId,
                    first_name: (_a = userRecord.displayName) === null || _a === void 0 ? void 0 : _a.split(" ")[0],
                    last_name: (_b = userRecord.displayName) === null || _b === void 0 ? void 0 : _b.split(" ")[1],
                    email: userRecord.email,
                }));
                (0, sliLogger_1.sendSuccessIndicator)(metadata, "Successfully retrieved user info", metadataResourceType, metadataAction);
            })
                .catch((error) => {
                reject(error);
                (0, sliLogger_1.sendFailureIndicator)(metadata, "Failed to retrieve user info", metadataResourceType, metadataAction);
            });
        });
    }
    validateScope(scopes) {
        return scopes.indexOf("profile") !== -1;
    }
}
exports.UserInfoEndpoint = UserInfoEndpoint;
function userinfo() {
    return new UserInfoEndpoint().endpoint;
}
//# sourceMappingURL=user_info.js.map