const adjudicateSchema = {
    "properties": {
        "makerId": { "type": "string" },
        "takerId": { "type": "string" },
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
        "requestId": { "type": "string" },
        "timeStamp": {"type": "string"}
    }
}

const negotiationSchema = {
    "properties": {
        "makerId": { "type": "string" },
        "takerId": { "type": "string" },
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
        "previousHash": { "type": "object" },
        "timeStamp": {"type": "string"}
    }
}

const proposalResolvedSchema = {
    "properties": {
        "makerId": { "type": "string" },
        "takerId": { "type": "string" },
        "message": { "type": "string" },
        "requestId": { "type": "string" },
        "previousHash": { "type": "object" },
        "timeStamp": {"type": "string"}
    }
}

const fulfillmentSchema = {
    "properties": {
        "makerId": { "type": "string" },
        "takerId": { "type": "string" },
        "message": { "type": "string" },
        "requestId": { "type": "string" },
        "fulfillment": { "type": "object" },
        "previousHash": { "type": "object" },
        "timeStamp": {"type": "string"}
    }
}

const settlementInitiatedSchema = {
    "properties": {
        "makerId": { "type": "string" },
        "takerId": { "type": "string" },
        "message": { "type": "string" },
        "requestId": { "type": "string" },
        "escrow": { "type": "string" },
        "previousHash": { "type": "object" },
        "timeStamp": {"type": "string"}
    }
}

const signatureRequiredSchema = {
    "properties": {
        "makerId": { "type": "string" },
        "takerId": { "type": "string" },
        "message": { "type": "string" },
        "requestId": { "type": "string" },
        "transaction": { "type": "object" },
        "previousHash": { "type": "object" },
        "timeStamp": {"type": "string"}
    }
}

const disbursedSchema = {
    "properties": {
        "makerId": { "type": "string" },
        "takerId": { "type": "string" },
        "message": { "type": "string" },
        "requestId": { "type": "string" },
        "previousHash": { "type": "object" },
        "timeStamp": {"type": "string"}
    }
}

const rulingSchema = {
    "properties": {
        "makerId": { "type": "string" },
        "takerId": { "type": "string" },
        "message": { "type": "string" },
        "requestId": { "type": "string" },
        "favor": { "type": "string" },
        "justification": { "type": "string" },
        "transaction": { "type": "object" },
        "previousHash": { "type": "object" },
        "timeStamp": {"type": "string"}
    }
}

const informSchema = {
    "properties": {
        "makerId": { "type": "string" },
        "takerId": { "type": "string" },
        "message": { "type": "string" },
        "requestId": { "type": "string" },
        "mechanic": { "type": "string" },  //to signal what the info is for example "TSS"
        "data": { "type": "object" }, //Mechanic specific data fields
        "previousHash": { "type": "object" },
        "timeStamp": {"type": "string"}
    }
}

const tssDataSchema = {
    "propoerties": {
        "parties"   :   { "type": "number"},
        "threshold" :   { "type": "number"},
        "channel"   :   { "type": "string"},
        "password"  :   { "type": "string"},
    }
}

module.exports = { adjudicateSchema, proposalSchema, negotiationSchema, proposalResolvedSchema, fulfillmentSchema, settlementInitiatedSchema, signatureRequiredSchema, rulingSchema, disbursedSchema, informSchema, tssDataSchema }
