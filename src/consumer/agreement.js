const { verifyMessage } = require('../encrypt')

const buildMessageChain = (proposal, message) => {
    for (i = 0; i < proposal.counterOffers.length; i++) {
        if (proposal.counterOffers[i].hash === message.body.previousHash) {
            proposal.counterOffers[i].next = message
            return buildMessageChain(proposal, proposal.counterOffers[i])
        }
    }
    if (proposal.hash === message.body.previousHash) {
        //create a shallow copy of proposal
        let shallowProposal = JSON.parse(JSON.stringify(proposal))
        shallowProposal.next = message
        shallowProposal.counterOffers = undefined
        shallowProposal.acceptances = undefined
        shallowProposal.fulfillments = undefined
        shallowProposal.settlementInitiated = undefined
        shallowProposal.signatureRequired = undefined

        return shallowProposal
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

const checkMessageSignature = async (message, report) => {
    if (message && ! await verifyMessage(message)) {
        report.signatureFailures.push(message.uuid)
    }
    return report
}

const validateAgreement = async (agreement) => {
    let report = {
        "signatureFailures": [],
        "hashFailures": [],
        "linkFailures": []
    }

    let message = agreement
    while (message) {
        report = checkMessageSignature(message, report)
        if (!message.next) {
            //acceptance message
            report = checkMessageSignature(message.settlementInitiated, report)
            report = checkMessageSignature(message.signatureRequired, report)
            message.fulfillments.forEach(fulfillment => {
               report = checkMessageSignature(fulfillment, report) 
            });
        }
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