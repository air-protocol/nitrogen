const getKeyFromPreviousHash = (previousHash, proposal) => {
    let recipientKey = undefined
    if (previousHash === proposal.hash) {
        recipientKey = proposal.publicKey
    } else {
        for (i = 0; i < proposal.counterOffers.length; i++) {
            if (previousHash === proposal.counterOffers[i].hash) {
                recipientKey = proposal.counterOffers[i].publicKey
                break
            }
        }
    }
    return recipientKey
}

const getResolvedAcceptance = (requestId, proposals) => {
    let proposal = proposals.get(requestId)
    if (!proposal) {
        throw new Error('Unable to locate proposal')
    }
    if (!proposal.resolution) {
        throw new Error('Proposal is not resolved')
    }
    let acceptance = undefined
    for (i = 0; i < proposal.acceptances.length; i++) {
        if (proposal.acceptances[i].body.takerId === proposal.resolution.body.takerId) {
            acceptance = proposal.acceptances[i]
        }
    }
    if (!acceptance) {
        throw new Error('Proposal did not resolve an acceptance')
    }
    return { proposal, acceptance }
}

module.exports = { getKeyFromPreviousHash, getResolvedAcceptance }