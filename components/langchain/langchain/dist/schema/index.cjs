"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Docstore = exports.BaseEntityStore = exports.BaseFileStore = exports.BaseCache = exports.BaseListChatMessageHistory = exports.BaseChatMessageHistory = exports.BaseRetriever = exports.BasePromptValue = exports.ChatMessage = exports.FunctionMessage = exports.SystemChatMessage = exports.AIChatMessage = exports.HumanChatMessage = exports.BaseChatMessage = exports.SystemMessage = exports.AIMessage = exports.HumanMessage = exports.BaseMessage = exports.RUN_KEY = void 0;
const serializable_js_1 = require("../load/serializable.cjs");
exports.RUN_KEY = "__run";
class BaseMessage extends serializable_js_1.Serializable {
    /**
     * @deprecated
     * Use {@link BaseMessage.content} instead.
     */
    get text() {
        return this.content;
    }
    constructor(fields, 
    /** @deprecated */
    kwargs) {
        if (typeof fields === "string") {
            // eslint-disable-next-line no-param-reassign
            fields = { content: fields, additional_kwargs: kwargs };
        }
        // Make sure the default value for additional_kwargs is passed into super() for serialization
        if (!fields.additional_kwargs) {
            // eslint-disable-next-line no-param-reassign
            fields.additional_kwargs = {};
        }
        super(fields);
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain", "schema"]
        });
        Object.defineProperty(this, "lc_serializable", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        /** The text of the message. */
        Object.defineProperty(this, "content", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /** The name of the message sender in a multi-user chat. */
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /** Additional keyword arguments */
        Object.defineProperty(this, "additional_kwargs", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.name = fields.name;
        this.content = fields.content;
        this.additional_kwargs = fields.additional_kwargs;
    }
    toDict() {
        return {
            type: this._getType(),
            data: this.toJSON()
                .kwargs,
        };
    }
}
exports.BaseMessage = BaseMessage;
class HumanMessage extends BaseMessage {
    _getType() {
        return "human";
    }
}
exports.HumanMessage = HumanMessage;
class AIMessage extends BaseMessage {
    _getType() {
        return "ai";
    }
}
exports.AIMessage = AIMessage;
class SystemMessage extends BaseMessage {
    _getType() {
        return "system";
    }
}
exports.SystemMessage = SystemMessage;
/**
 * @deprecated
 * Use {@link BaseMessage} instead.
 */
exports.BaseChatMessage = BaseMessage;
/**
 * @deprecated
 * Use {@link HumanMessage} instead.
 */
exports.HumanChatMessage = HumanMessage;
/**
 * @deprecated
 * Use {@link AIMessage} instead.
 */
exports.AIChatMessage = AIMessage;
/**
 * @deprecated
 * Use {@link SystemMessage} instead.
 */
exports.SystemChatMessage = SystemMessage;
class FunctionMessage extends BaseMessage {
    constructor(fields, 
    /** @deprecated */
    name) {
        if (typeof fields === "string") {
            // eslint-disable-next-line no-param-reassign
            fields = { content: fields, name };
        }
        super(fields);
    }
    _getType() {
        return "function";
    }
}
exports.FunctionMessage = FunctionMessage;
class ChatMessage extends BaseMessage {
    constructor(fields, role) {
        if (typeof fields === "string") {
            // eslint-disable-next-line no-param-reassign, @typescript-eslint/no-non-null-assertion
            fields = { content: fields, role: role };
        }
        super(fields);
        Object.defineProperty(this, "role", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.role = fields.role;
    }
    _getType() {
        return "generic";
    }
}
exports.ChatMessage = ChatMessage;
/**
 * Base PromptValue class. All prompt values should extend this class.
 */
class BasePromptValue extends serializable_js_1.Serializable {
}
exports.BasePromptValue = BasePromptValue;
/**
 * Base Index class. All indexes should extend this class.
 */
class BaseRetriever {
}
exports.BaseRetriever = BaseRetriever;
class BaseChatMessageHistory extends serializable_js_1.Serializable {
}
exports.BaseChatMessageHistory = BaseChatMessageHistory;
class BaseListChatMessageHistory extends serializable_js_1.Serializable {
    addUserMessage(message) {
        return this.addMessage(new HumanMessage(message));
    }
    addAIChatMessage(message) {
        return this.addMessage(new AIMessage(message));
    }
}
exports.BaseListChatMessageHistory = BaseListChatMessageHistory;
class BaseCache {
}
exports.BaseCache = BaseCache;
class BaseFileStore extends serializable_js_1.Serializable {
}
exports.BaseFileStore = BaseFileStore;
class BaseEntityStore extends serializable_js_1.Serializable {
}
exports.BaseEntityStore = BaseEntityStore;
class Docstore {
}
exports.Docstore = Docstore;
