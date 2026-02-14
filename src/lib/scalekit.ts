import { Scalekit } from "@scalekit-sdk/node";

function getRequiredEnvVar(name: string): string {
	const value = process.env[name];
	if (!value) {
		throw new Error(
			`Missing required environment variable "${name}" for Scalekit configuration.`
		);
	}
	return value;
}
const environmentUrl = getRequiredEnvVar("SCALEKIT_ENVIRONMENT_URL");
const clientId = getRequiredEnvVar("SCALEKIT_CLIENT_ID");
const clientSecret = getRequiredEnvVar("SCALEKIT_CLIENT_SECRET");
export const scalekit = new Scalekit(
	environmentUrl,
	clientId,
	clientSecret
);