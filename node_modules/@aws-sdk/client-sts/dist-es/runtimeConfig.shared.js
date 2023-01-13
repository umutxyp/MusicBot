import { NoOpLogger } from "@aws-sdk/smithy-client";
import { parseUrl } from "@aws-sdk/url-parser";
import { fromBase64, toBase64 } from "@aws-sdk/util-base64";
import { defaultEndpointResolver } from "./endpoint/endpointResolver";
export const getRuntimeConfig = (config) => ({
    apiVersion: "2011-06-15",
    base64Decoder: config?.base64Decoder ?? fromBase64,
    base64Encoder: config?.base64Encoder ?? toBase64,
    disableHostPrefix: config?.disableHostPrefix ?? false,
    endpointProvider: config?.endpointProvider ?? defaultEndpointResolver,
    logger: config?.logger ?? new NoOpLogger(),
    serviceId: config?.serviceId ?? "STS",
    urlParser: config?.urlParser ?? parseUrl,
});
