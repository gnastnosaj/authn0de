export function getEnvName(projectId: any): any;
export function cloudLoggingMetadata(projectID: any, resourceType: any, action: any, criticalUserJourney: any): {
    severity: string;
    resource: {
        type: string;
    };
    labels: {
        env: any;
        context: {};
        resourceType: any;
        action: any;
        resultStatus: string;
        criticalUserJourney: any;
    };
};
export function formatMessage(projectId: any, resourceType: any, action: any, resultStatus: any): string;
export function getProjectId(): string | undefined;
export function sendFailureIndicator(metadata: any, details: any, metadataResourceType: any, metadataAction: any): void;
export function sendSuccessIndicator(metadata: any, details: any, metadataResourceType: any, metadataAction: any): void;
export function sliLogger(): functions.HttpsFunction & functions.Runnable<any>;
import functions = require("firebase-functions/v1");
