const { verifyMessage, verifyHash } = require('../encrypt')

const buildMessageChain = (proposal, message) => {
    for (i = 0; i < proposal.counterOffers.length; i++) {
        if (proposal.counterOffers[i].hash === message.body.previousHash) {
            proposal.counterOffers[i].next = message
            return buildMessageChain(proposal, proposal.counterOffers[i])
        }
    }
    if (proposal.hash === message.body.previousHash) {
        proposal.next = message

        //disengage unrelated negotiations from final agreement
        proposal.counterOffers = undefined
        proposal.acceptances = undefined

        //un-flatten the model
        //settlement fields are attached to the acceptance in agreement
        proposal.fulfillments = undefined
        proposal.settlementInitiated = undefined
        proposal.signatureRequired = undefined

        return proposal
    }
}

const buildAgreement = (proposal) => {
    //We do not want to modify the original data model
    let copyProposal = JSON.parse(JSON.stringify(proposal))

    let acceptance = undefined
    for (i = 0; i < copyProposal.acceptances.length; i++) {
        if (copyProposal.acceptances[i].takerId === copyProposal.resolution.takerId) {
            acceptance = copyProposal.acceptances[i]
        }
    }
    if (!acceptance) {
        throw new Error('Cannot build agreement.  No resolved acceptance.')
    }
    acceptance.settlementInitiated = copyProposal.settlementInitiated
    acceptance.signatureRequired = copyProposal.signatureRequired
    acceptance.fulfillments = copyProposal.fulfillments
    return buildMessageChain(copyProposal, acceptance)
}

const checkMessage = async (message, report) => {
    if (!message) {
        return
    }
    if (! await verifyMessage(message)) {
        report.signatureFailures.push(message.uuid)
    }
    if (!verifyHash(message)) {
        report.hashFailures.push(message.uuid)
    }
    if (message.next && (message.hash !== message.next.body.previousHash)) {
        report.linkFailures.push(message.next.uuid)
    }
}

const validateAgreement = async (agreement) => {
    let report = {
        "signatureFailures": [],
        "hashFailures": [],
        "linkFailures": [],
        "acceptanceValid": true
    }

    let message = agreement
    let prior
    while (message) {
        //check negotiation message
        await checkMessage(message, report)
        if (!message.next) {
            //reached acceptance message
            report.acceptanceValid = (prior.body.requestAmount === message.body.requestAmount
                && prior.body.requestAsset === message.body.requestAsset
                && prior.body.offerAmount === message.body.offerAmount
                && prior.body.offerAsset === message.body.offerAsset
                && prior.body.requestId === message.body.requestId
                && prior.publicKey !== message.publicKey)

            //check all settlement messages that hang off of acceptance
            await checkMessage(message.settlementInitiated, report)
            if (message.settlementInitiated
                && message.hash !== message.settlementInitiated.body.previousHash) {
                report.linkFailures.push(message.settlementInitiated.uuid)
            }

            await checkMessage(message.signatureRequired, report)
            if (message.signatureRequired &&
                message.signatureRequired.body.previousHash !== message.hash) {
                report.linkFailures.push(message.signatureRequired.uuid)
            }

            for (i = 0; i < message.fulfillments.length; i++) {
                await checkMessage(message.fulfillments[i], report)
                if (message.hash !== message.fulfillments[i].body.previousHash) {
                    report.linkFailures.push(message.fulfillments[i].uuid)
                }
            }
        }
        prior = message
        message = message.next
    }
    return report
}

const pullValuesFromAgreement = (agreement) => {

    let requestId = agreement.body.requestId

    let acceptance = agreement
    while (acceptance.next) {
        acceptance = acceptance.next
    }

    let makerId = acceptance.body.makerId
    let takerId = acceptance.body.takerId
    let challengeStake = acceptance.body.challengeStake
    let escrowStellarKey = acceptance.settlementInitiated.body.escrow
    let acceptanceHash = acceptance.hash

    let buyerMeshKey
    let buyerStellarKey
    let sellerMeshKey
    let sellerStellarKey
    let nativeAmount

    if (agreement.body.offerAsset === 'native') {
        buyerMeshKey = agreement.publicKey
        buyerStellarKey = agreement.body.makerId
        sellerMeshKey = agreement.next.publicKey
        sellerStellarKey = agreement.next.body.takerId
        nativeAmount = acceptance.body.offerAmount
    } else {
        sellerMeshKey = agreement.publicKey
        sellerStellarKey = agreement.body.makerId
        buyerMeshKey = agreement.next.publicKey
        buyerStellarKey = agreement.next.body.takerId
        nativeAmount = acceptance.body.requestAmount
    }
    return { buyerMeshKey, sellerMeshKey, buyerStellarKey, sellerStellarKey, escrowStellarKey, nativeAmount, challengeStake, makerId, takerId, requestId, acceptanceHash }
}

module.exports = { buildAgreement, validateAgreement, pullValuesFromAgreement }