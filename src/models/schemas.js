const adjudicateSchema = {
    "properties": {
        "makerId": { "type": "string" },
        "takerId": { "type": "string" },
        "recipientKey": { "type": "string" },
        "message": { "type": "string" },
        "requestId": { "type": "string" },
        "agreement": { "type": "object" },
        "previousHash": { "type": "object" }
    }
}

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
        "makerId": { "type": "string" },
        "takerId": { "type": "string" },
        "recipientKey": { "type": "string" },
        "audience": { "type": "array" },
        "challengeStake": { "type": "number" },
        "conditions": { "type": "array" },
        "juryPool": { "type": "string" },
        "offerAsset": { "type": "string" },
        "offerAmount": { "type": "number" },
        "requestAmount": { "type": "number" },
        "requestAsset": { "type": "string" },
        "requestId": { "type": "string" },
        "message": { "type": "string" },
        "previousHash": { "type": "object" }
    }
}

const proposalResolvedSchema = {
    "properties": {
        "makerId": { "type": "string" },
        "takerId": { "type": "string" },
        "message": { "type": "string" },
        "requestId": { "type": "string" },
        "previousHash": { "type": "object" }
    }
}

const fulfillmentSchema = {
    "properties": {
        "makerId": { "type": "string" },
        "takerId": { "type": "string" },
        "recipientKey": { "type": "string" },
        "message": { "type": "string" },
        "requestId": { "type": "string" },
        "fulfillment": { "type": "object" },
        "previousHash": { "type": "object" }
    }
}

const settlementInitiatedSchema = {
    "properties": {
        "makerId": { "type": "string" },
        "takerId": { "type": "string" },
        "recipientKey": { "type": "string" },
        "message": { "type": "string" },
        "requestId": { "type": "string" },
        "escrow": { "type": "string" },
        "previousHash": { "type": "object" }
    }
}

const signatureRequiredSchema = {
    "properties": {
        "makerId": { "type": "string" },
        "takerId": { "type": "string" },
        "recipientKey": { "type": "string" },
        "message": { "type": "string" },
        "requestId": { "type": "string" },
        "transaction": { "type": "object" },
        "previousHash": { "type": "object" }
    }
}

module.exports = { adjudicateSchema, proposalSchema, negotiationSchema, proposalResolvedSchema, fulfillmentSchema, settlementInitiatedSchema, signatureRequiredSchema }