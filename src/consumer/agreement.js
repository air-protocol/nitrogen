const { verifyMessage, verifyHash } = require('../encrypt')

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
    if(!message) {
        return
    }
    if (! await verifyMessage(message)) {
        report.signatureFailures.push(message.uuid)
    }
    if (!verifyHash(message)) {
        report.hashFailures.push(message.uuid)
    }
}

const validateAgreement = async (agreement) => {
    let report = {
        "signatureFailures": [],
        "hashFailures": [],
        "linkFailures": []
    }

    let message = agreement
    while (message) {
        await checkMessage(message, report)
        if (!message.next) {
            //acceptance message
            await checkMessage(message.settlementInitiated, report)
            await checkMessage(message.signatureRequired, report)
            message.fulfillments.forEach(async (fulfillment) => {
                await checkMessage(fulfillment, report)
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