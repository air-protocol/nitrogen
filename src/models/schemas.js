const proposalSchema = {
    "properties": {
        "audience": { "type": "array" },
        "challengeStake": { "type": "number" },
        "conditions": { "type": "array" },
        "juryPool": { "type": "string" },
        "makerId": { "type": "string" },
        "offerAsset": { "type": "string" },
        "offerAmount": { "type": "number" },
        "requestAmount": { "type": "number" },
        "requestAsset": { "type": "string" },
        "requestId": { "type": "string" }
    }
}

const negotiationSchema = {
    "properties": {
        "audience": { "type": "array" },
        "challengeStake": { "type": "number" },
        "conditions": { "type": "array" },
        "juryPool": { "type": "string" },
        "makerId": { "type": "string" },
        "offerAsset": { "type": "string" },
        "offerAmount": { "type": "number" },
        "requestAmount": { "type": "number" },
        "requestAsset": { "type": "string" },
        "requestId": { "type": "string" },
        "takerId": { "type": "string" },
        "message": { "type": "string" },
        "previousHash": { "type": "object" }
    }
}

const proposalResolvedSchema = {
    "properties": {
        "makerId": { "type": "string" },
        "message": { "type": "string" },
        "requestId": { "type": "string" },
        "takerId": { "type": "string" },
        "previousHash": { "type": "object" }
    }
}

const fulfillmentSchema = {
    "properties": {
        "makerId": { "type": "string" },
        "message": { "type": "string" },
        "requestId": { "type": "string" },
        "takerId": { "type": "string" },
        "fulfillment": { "type": "object" },
        "previousHash": { "type": "object" }
    }
}
module.exports = { proposalSchema, negotiationSchema, proposalResolvedSchema, fulfillmentSchema }