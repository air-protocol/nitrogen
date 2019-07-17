const buildMessageChain = (proposal, message) => {
    for (i = 0; i < proposal.counterOffers.length; i++) {
        if (proposal.counterOffers[i].hash === message.body.previousHash) {
            proposal.counterOffers[i].next = message
            return buildMessageChain(proposal, proposal.counterOffers[i])
        } 
    }
    if (proposal.hash === message.body.previousHash) {
        return {
            "body": {
                "message": "proposal",
                "makerId": proposal.body.makerId,
                "takerId": proposal.body.takerId,
                "offerAsset": proposal.body.offerAsset,
                "offerAmount": proposal.body.offerAmount,
                "requestAsset": proposal.body.requestAsset,
                "requestAmount": proposal.body.requestAmount
            },
            "hash": proposal.hash,
            "publicKey": proposal.publicKey,
            "next": message
        }
    }
}

const buildAgreement = (proposal) => {
    let acceptance = undefined
    for (i = 0; i < proposal.acceptances.length; i++) {
        if (proposal.acceptances[i].takerId === proposal.resolution.takerId) {
            acceptance = proposal.acceptances[i]
        }
    }
    if (!acceptance) {
        throw new Error('Cannot build agreement.  No resolved acceptance.')
    }
    acceptance.settlementInitiated = proposal.settlementInitiated
    acceptance.signatureRequired = proposal.signatureRequired
    acceptance.fulfillments = proposal.fulfillments
    return buildMessageChain(proposal, acceptance)
}

const validateAgreement = (agreement) => {
    //TODO
    return true
}

module.exports = { buildAgreement, validateAgreement }