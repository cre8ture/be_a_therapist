import { OpenAPISpec } from "../../util/openapi.js";
import { BaseChain } from "../base.js";
import { LLMChain } from "../llm_chain.js";
import { ChatOpenAI } from "../../chat_models/openai.js";
import { ChatPromptTemplate, HumanMessagePromptTemplate, } from "../../prompts/chat.js";
import { SequentialChain } from "../sequential_chain.js";
import { JsonOutputFunctionsParser } from "../../output_parsers/openai_functions.js";
function formatURL(url, pathParams) {
    const expectedPathParamNames = [...url.matchAll(/{(.*?)}/g)].map((match) => match[1]);
    const newParams = {};
    for (const paramName of expectedPathParamNames) {
        const cleanParamName = paramName.replace(/^\.;/, "").replace(/\*$/, "");
        const value = pathParams[cleanParamName];
        let formattedValue;
        if (Array.isArray(value)) {
            if (paramName.startsWith(".")) {
                const separator = paramName.endsWith("*") ? "." : ",";
                formattedValue = `.${value.join(separator)}`;
            }
            else if (paramName.startsWith(",")) {
                const separator = paramName.endsWith("*") ? `${cleanParamName}=` : ",";
                formattedValue = `${cleanParamName}=${value.join(separator)}`;
            }
            else {
                formattedValue = value.join(",");
            }
        }
        else if (typeof value === "object") {
            const kvSeparator = paramName.endsWith("*") ? "=" : ",";
            const kvStrings = Object.entries(value).map(([k, v]) => k + kvSeparator + v);
            let entrySeparator;
            if (paramName.startsWith(".")) {
                entrySeparator = ".";
                formattedValue = ".";
            }
            else if (paramName.startsWith(";")) {
                entrySeparator = ";";
                formattedValue = ";";
            }
            else {
                entrySeparator = ",";
                formattedValue = "";
            }
            formattedValue += kvStrings.join(entrySeparator);
        }
        else {
            if (paramName.startsWith(".")) {
                formattedValue = `.${value}`;
            }
            else if (paramName.startsWith(";")) {
                formattedValue = `;${cleanParamName}=${value}`;
            }
            else {
                formattedValue = value;
            }
        }
        newParams[paramName] = formattedValue;
    }
    let formattedUrl = url;
    for (const [key, newValue] of Object.entries(newParams)) {
        formattedUrl = formattedUrl.replace(`{${key}}`, newValue);
    }
    return formattedUrl;
}
function convertOpenAPIParamsToJSONSchema(params, spec) {
    return params.reduce((jsonSchema, param) => {
        let schema;
        if (param.schema) {
            schema = spec.getSchema(param.schema);
            // eslint-disable-next-line no-param-reassign
            jsonSchema.properties[param.name] = convertOpenAPISchemaToJSONSchema(schema, spec);
        }
        else if (param.content) {
            const mediaTypeSchema = Object.values(param.content)[0].schema;
            if (mediaTypeSchema) {
                schema = spec.getSchema(mediaTypeSchema);
            }
            if (!schema) {
                return jsonSchema;
            }
            if (schema.description === undefined) {
                schema.description = param.description ?? "";
            }
            // eslint-disable-next-line no-param-reassign
            jsonSchema.properties[param.name] = convertOpenAPISchemaToJSONSchema(schema, spec);
        }
        else {
            return jsonSchema;
        }
        if (param.required && Array.isArray(jsonSchema.required)) {
            jsonSchema.required.push(param.name);
        }
        return jsonSchema;
    }, {
        type: "object",
        properties: {},
        required: [],
        additionalProperties: {},
    });
}
// OpenAI throws errors on extraneous schema properties, e.g. if "required" is set on individual ones
function convertOpenAPISchemaToJSONSchema(schema, spec) {
    if (schema.type !== "object" && schema.type !== "array") {
        return {
            type: schema.type ?? "string",
        };
    }
    return Object.keys(schema.properties ?? {}).reduce((jsonSchema, propertyName) => {
        if (!schema.properties) {
            return jsonSchema;
        }
        const openAPIProperty = spec.getSchema(schema.properties[propertyName]);
        if (openAPIProperty.type === undefined) {
            return jsonSchema;
        }
        // eslint-disable-next-line no-param-reassign
        jsonSchema.properties[propertyName] = {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            type: openAPIProperty.type,
            description: openAPIProperty.description,
        };
        if (openAPIProperty.required && jsonSchema.required !== undefined) {
            jsonSchema.required.push(propertyName);
        }
        return jsonSchema;
    }, {
        type: "object",
        properties: {},
        required: [],
        additionalProperties: {},
    });
}
function convertOpenAPISpecToOpenAIFunctions(spec) {
    if (!spec.document.paths) {
        return { openAIFunctions: [] };
    }
    const openAIFunctions = [];
    const nameToCallMap = {};
    for (const path of Object.keys(spec.document.paths)) {
        const pathParameters = spec.getParametersForPath(path);
        for (const method of spec.getMethodsForPath(path)) {
            const operation = spec.getOperation(path, method);
            if (!operation) {
                return { openAIFunctions: [] };
            }
            const operationParametersByLocation = pathParameters
                .concat(spec.getParametersForOperation(operation))
                .reduce((operationParams, param) => {
                if (!operationParams[param.in]) {
                    // eslint-disable-next-line no-param-reassign
                    operationParams[param.in] = [];
                }
                operationParams[param.in].push(param);
                return operationParams;
            }, {});
            const paramLocationToRequestArgNameMap = {
                query: "params",
                header: "headers",
                cookie: "cookies",
                path: "path_params",
            };
            const requestArgsSchema = {};
            for (const paramLocation of Object.keys(paramLocationToRequestArgNameMap)) {
                if (operationParametersByLocation[paramLocation]) {
                    requestArgsSchema[paramLocationToRequestArgNameMap[paramLocation]] =
                        convertOpenAPIParamsToJSONSchema(operationParametersByLocation[paramLocation], spec);
                }
            }
            const requestBody = spec.getRequestBodyForOperation(operation);
            if (requestBody?.content !== undefined) {
                const requestBodySchemas = {};
                for (const [mediaType, mediaTypeObject] of Object.entries(requestBody.content)) {
                    if (mediaTypeObject.schema !== undefined) {
                        const schema = spec.getSchema(mediaTypeObject.schema);
                        requestBodySchemas[mediaType] = convertOpenAPISchemaToJSONSchema(schema, spec);
                    }
                }
                const mediaTypes = Object.keys(requestBodySchemas);
                if (mediaTypes.length === 1) {
                    requestArgsSchema.data = requestBodySchemas[mediaTypes[0]];
                }
                else if (mediaTypes.length > 1) {
                    requestArgsSchema.data = {
                        anyOf: Object.values(requestBodySchemas),
                    };
                }
            }
            const openAIFunction = {
                name: OpenAPISpec.getCleanedOperationId(operation, path, method),
                description: operation.description ?? operation.summary ?? "",
                parameters: {
                    type: "object",
                    properties: requestArgsSchema,
                    // All remaining top-level parameters are required
                    required: Object.keys(requestArgsSchema),
                },
            };
            openAIFunctions.push(openAIFunction);
            const baseUrl = (spec.baseUrl ?? "").endsWith("/")
                ? (spec.baseUrl ?? "").slice(0, -1)
                : spec.baseUrl ?? "";
            nameToCallMap[openAIFunction.name] = {
                method,
                url: baseUrl + path,
            };
        }
    }
    return {
        openAIFunctions,
        defaultExecutionMethod: async (name, 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        requestArgs, options) => {
            const { headers: customHeaders, params: customParams, ...rest } = options ?? {};
            const { method, url } = nameToCallMap[name];
            const requestParams = requestArgs.params ?? {};
            const nonEmptyParams = Object.keys(requestParams).reduce(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (filteredArgs, argName) => {
                if (requestParams[argName] !== "" &&
                    requestParams[argName] !== null &&
                    requestParams[argName] !== undefined) {
                    // eslint-disable-next-line no-param-reassign
                    filteredArgs[argName] = requestParams[argName];
                }
                return filteredArgs;
            }, {});
            const queryString = new URLSearchParams({
                ...nonEmptyParams,
                ...customParams,
            }).toString();
            const pathParams = requestArgs.path_params;
            const formattedUrl = formatURL(url, pathParams) +
                (queryString.length ? `?${queryString}` : "");
            const headers = {};
            let body;
            if (requestArgs.data !== undefined) {
                let contentType = "text/plain";
                if (typeof requestArgs.data !== "string") {
                    if (typeof requestArgs.data === "object") {
                        contentType = "application/json";
                    }
                    body = JSON.stringify(requestArgs.data);
                }
                else {
                    body = requestArgs.data;
                }
                headers["content-type"] = contentType;
            }
            const response = await fetch(formattedUrl, {
                ...requestArgs,
                method,
                headers: {
                    ...headers,
                    ...requestArgs.headers,
                    ...customHeaders,
                },
                body,
                ...rest,
            });
            let output;
            if (response.status < 200 || response.status > 299) {
                output = `${response.status}: ${response.statusText} for ${name} called with ${JSON.stringify(queryString)}`;
            }
            else {
                output = await response.text();
            }
            return output;
        },
    };
}
class SimpleRequestChain extends BaseChain {
    constructor(config) {
        super();
        Object.defineProperty(this, "requestMethod", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "inputKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "function"
        });
        Object.defineProperty(this, "outputKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "response"
        });
        this.requestMethod = config.requestMethod;
    }
    get inputKeys() {
        return [this.inputKey];
    }
    get outputKeys() {
        return [this.outputKey];
    }
    _chainType() {
        return "simple_request_chain";
    }
    /** @ignore */
    async _call(values, _runManager) {
        const inputKeyValue = values[this.inputKey];
        const methodName = inputKeyValue.name;
        const args = inputKeyValue.arguments;
        const response = await this.requestMethod(methodName, args);
        return { [this.outputKey]: response };
    }
}
/**
 * Create a chain for querying an API from a OpenAPI spec.
 * @param spec OpenAPISpec or url/file/text string corresponding to one.
 * @param options Custom options passed into the chain
 * @returns OpenAPIChain
 */
export async function createOpenAPIChain(spec, options = {}) {
    let convertedSpec;
    if (typeof spec === "string") {
        try {
            convertedSpec = await OpenAPISpec.fromURL(spec);
        }
        catch (e) {
            try {
                convertedSpec = OpenAPISpec.fromString(spec);
            }
            catch (e) {
                throw new Error(`Unable to parse spec from source ${spec}.`);
            }
        }
    }
    else {
        convertedSpec = OpenAPISpec.fromObject(spec);
    }
    const { openAIFunctions, defaultExecutionMethod } = convertOpenAPISpecToOpenAIFunctions(convertedSpec);
    if (defaultExecutionMethod === undefined) {
        throw new Error(`Could not parse any valid operations from the provided spec.`);
    }
    const { llm = new ChatOpenAI({ modelName: "gpt-3.5-turbo-0613" }), prompt = ChatPromptTemplate.fromPromptMessages([
        HumanMessagePromptTemplate.fromTemplate("Use the provided API's to respond to this user query:\n\n{query}"),
    ]), requestChain = new SimpleRequestChain({
        requestMethod: async (name, args) => defaultExecutionMethod(name, args, {
            headers: options.headers,
            params: options.params,
        }),
    }), llmChainInputs = {}, verbose, ...rest } = options;
    const formatChain = new LLMChain({
        llm,
        prompt,
        outputParser: new JsonOutputFunctionsParser({ argsOnly: false }),
        outputKey: "function",
        llmKwargs: { functions: openAIFunctions },
        ...llmChainInputs,
    });
    return new SequentialChain({
        chains: [formatChain, requestChain],
        outputVariables: ["response"],
        inputVariables: formatChain.inputKeys,
        verbose,
        ...rest,
    });
}
