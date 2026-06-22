#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const schemasDir = path.join(root, "schemas");
const examplesDir = path.join(root, "examples");

function readJson(relativePath) {
  const filePath = path.join(root, relativePath);
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    throw new Error(`${relativePath}: invalid JSON (${error.message})`);
  }
}

function listJsonFiles(relativeDir) {
  const dir = path.join(root, relativeDir);
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(".json"))
    .sort()
    .map((name) => path.join(relativeDir, name).replace(/\\/g, "/"));
}

const schemaFiles = listJsonFiles("schemas");
const exampleFiles = listJsonFiles("examples");
const schemas = new Map(schemaFiles.map((file) => [path.basename(file), readJson(file)]));

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function typeName(value) {
  if (Array.isArray(value)) return "array";
  if (value === null) return "null";
  return typeof value;
}

function isDateTime(value) {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value) &&
    !Number.isNaN(Date.parse(value))
  );
}

function formatPath(base, key) {
  if (typeof key === "number") return `${base}[${key}]`;
  return base === "$" ? `$.${key}` : `${base}.${key}`;
}

function validate(schema, value, instancePath = "$", seenRefs = []) {
  const errors = [];

  if (schema.$ref) {
    const refName = schema.$ref.split("/").pop();
    const refSchema = schemas.get(refName);
    if (!refSchema) {
      return [`${instancePath}: unresolved schema ref ${schema.$ref}`];
    }
    if (seenRefs.includes(refName)) {
      return [`${instancePath}: circular schema ref ${schema.$ref}`];
    }
    return validate(refSchema, value, instancePath, [...seenRefs, refName]);
  }

  if (schema.oneOf) {
    const matches = schema.oneOf
      .map((option) => validate(option, value, instancePath, seenRefs))
      .filter((optionErrors) => optionErrors.length === 0);
    if (matches.length !== 1) {
      errors.push(`${instancePath}: expected exactly one oneOf schema to match, got ${matches.length}`);
    }
    return errors;
  }

  if (schema.type) {
    const expected = schema.type;
    const actual = typeName(value);
    const ok =
      expected === actual ||
      (expected === "integer" && Number.isInteger(value)) ||
      (expected === "number" && typeof value === "number" && Number.isFinite(value));
    if (!ok) {
      errors.push(`${instancePath}: expected ${expected}, got ${actual}`);
      return errors;
    }
  }

  if (Object.prototype.hasOwnProperty.call(schema, "const") && value !== schema.const) {
    errors.push(`${instancePath}: expected const ${JSON.stringify(schema.const)}`);
  }

  if (schema.enum && !schema.enum.includes(value)) {
    errors.push(`${instancePath}: expected one of ${schema.enum.map(JSON.stringify).join(", ")}`);
  }

  if (typeof value === "string") {
    if (schema.minLength !== undefined && value.length < schema.minLength) {
      errors.push(`${instancePath}: expected minLength ${schema.minLength}`);
    }
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) {
      errors.push(`${instancePath}: does not match pattern ${schema.pattern}`);
    }
    if (schema.format === "date-time" && !isDateTime(value)) {
      errors.push(`${instancePath}: expected RFC3339 date-time`);
    }
  }

  if (typeof value === "number") {
    if (schema.minimum !== undefined && value < schema.minimum) {
      errors.push(`${instancePath}: expected minimum ${schema.minimum}`);
    }
    if (schema.maximum !== undefined && value > schema.maximum) {
      errors.push(`${instancePath}: expected maximum ${schema.maximum}`);
    }
  }

  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) {
      errors.push(`${instancePath}: expected minItems ${schema.minItems}`);
    }
    if (schema.uniqueItems) {
      const encoded = value.map((item) => JSON.stringify(item));
      if (new Set(encoded).size !== encoded.length) {
        errors.push(`${instancePath}: expected unique items`);
      }
    }
    if (schema.items) {
      value.forEach((item, index) => {
        errors.push(...validate(schema.items, item, formatPath(instancePath, index), seenRefs));
      });
    }
  }

  if (isPlainObject(value)) {
    const required = schema.required || [];
    for (const key of required) {
      if (!Object.prototype.hasOwnProperty.call(value, key)) {
        errors.push(`${formatPath(instancePath, key)}: required property missing`);
      }
    }

    const properties = schema.properties || {};
    if (schema.additionalProperties === false) {
      for (const key of Object.keys(value)) {
        if (!Object.prototype.hasOwnProperty.call(properties, key)) {
          errors.push(`${formatPath(instancePath, key)}: additional property not allowed`);
        }
      }
    }

    for (const [key, propertySchema] of Object.entries(properties)) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        errors.push(...validate(propertySchema, value[key], formatPath(instancePath, key), seenRefs));
      }
    }
  }

  return errors;
}

function getPath(value, keys, label) {
  let current = value;
  for (const key of keys) {
    if (!isPlainObject(current) || !Object.prototype.hasOwnProperty.call(current, key)) {
      throw new Error(`${label}: missing ${keys.join(".")}`);
    }
    current = current[key];
  }
  return current;
}

function assertValid(label, schemaName, value) {
  const schema = schemas.get(schemaName);
  if (!schema) throw new Error(`${label}: missing schema ${schemaName}`);
  const errors = validate(schema, value);
  if (errors.length > 0) {
    throw new Error(`${label}: failed ${schemaName}\n${errors.map((error) => `  - ${error}`).join("\n")}`);
  }
}

function checkRefs(schema, schemaName, at = "$", stack = []) {
  const errors = [];
  if (!schema || typeof schema !== "object") return errors;
  if (schema.$ref) {
    const refName = schema.$ref.split("/").pop();
    if (!schemas.has(refName)) errors.push(`${schemaName} ${at}: unresolved ref ${schema.$ref}`);
  }
  for (const [key, value] of Object.entries(schema)) {
    if (key === "$ref") continue;
    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        errors.push(...checkRefs(item, schemaName, `${at}.${key}[${index}]`, stack));
      });
    } else if (isPlainObject(value)) {
      errors.push(...checkRefs(value, schemaName, `${at}.${key}`, stack));
    }
  }
  return errors;
}

function validateSchemaFiles() {
  const errors = [];
  for (const schemaFile of schemaFiles) {
    const schema = schemas.get(path.basename(schemaFile));
    if (!schema.$schema) errors.push(`${schemaFile}: missing $schema`);
    if (!schema.$id) errors.push(`${schemaFile}: missing $id`);
    errors.push(...checkRefs(schema, schemaFile));
  }
  if (errors.length > 0) {
    throw new Error(`Schema checks failed\n${errors.map((error) => `  - ${error}`).join("\n")}`);
  }
}

function validateExampleFiles() {
  for (const exampleFile of exampleFiles) readJson(exampleFile);

  const validations = [
    ["examples/human-to-human-message-v0.2.json", "message-v0.2.schema.json"],
    ["examples/agent-to-user-message-v0.2.json", "message-v0.2.schema.json"],
    ["examples/agent-to-agent-message-v0.2.json", "message-v0.2.schema.json"],
    ["examples/encrypted-message-v0.3.json", "message-v0.3.schema.json"],
    ["examples/encrypted-agent-reply-v0.3.json", "message-v0.3.schema.json"],
    ["examples/message-new-event-v0.2.json", "event-v0.2.schema.json"],
    ["examples/approval-requested-v0.2.json", "event-v0.2.schema.json"]
  ];

  for (const [exampleFile, schemaName] of validations) {
    assertValid(exampleFile, schemaName, readJson(exampleFile));
  }

  const messageEvent = readJson("examples/message-new-event-v0.2.json");
  assertValid("examples/message-new-event-v0.2.json data.message", "message-v0.2.schema.json", getPath(messageEvent, ["data", "message"], "message-new-event-v0.2"));

  const approvalEvent = readJson("examples/approval-requested-v0.2.json");
  assertValid("examples/approval-requested-v0.2.json data", "approval.schema.json", getPath(approvalEvent, ["data"], "approval-requested-v0.2"));

  const securityContext = readJson("examples/security-context-v0.2.json");
  assertValid("examples/security-context-v0.2.json actor", "actor.schema.json", getPath(securityContext, ["actor"], "security-context-v0.2"));
  assertValid("examples/security-context-v0.2.json security", "security-context.schema.json", getPath(securityContext, ["security"], "security-context-v0.2"));

  const humanMessage = readJson("examples/human-message.json");
  assertValid("examples/human-message.json request.body", "message.schema.json", getPath(humanMessage, ["request", "body"], "human-message"));

  const agentApproval = readJson("examples/agent-message-approval-required.json");
  assertValid("examples/agent-message-approval-required.json request.body", "message.schema.json", getPath(agentApproval, ["request", "body"], "agent-message-approval-required"));
}

try {
  validateSchemaFiles();
  validateExampleFiles();
  console.log(`AgentLink protocol examples validated: ${schemaFiles.length} schemas, ${exampleFiles.length} examples.`);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
