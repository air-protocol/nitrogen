const { transactionHistory, viewEscrow, viewTransactionOperations } = require('./chain')

const presentOpenCases = (adjudications, rulings) => {
    console.log('Proposal request ids in dispute')
    adjudications.forEach((value, key) => {
        if (!rulings.get(key)) {
            console.log(key)
        }
    });
}

const presentAgreementReport = (report) => {
    console.log('Agreement Report')
    console.log('---------------------------------')
    console.log('There are ' + report.signatureFailures.length + ' messages with signature failures')
    console.log('---------------------------------')
    report.signatureFailures.forEach((uuid) => {
        console.log(uuid)
    })
    console.log('---------------------------------')
    console.log('There are ' + report.hashFailures.length + ' messages with hash failures')
    console.log('---------------------------------')
    report.hashFailures.forEach((uuid) => {
        console.log(uuid)
    })
    console.log('---------------------------------')
    console.log('There are ' + report.linkFailures.length + ' messages with link failures')
    console.log('---------------------------------')
    report.linkFailures.forEach((uuid) => {
        console.log(uuid)
    })
    console.log('Acceptance Validity')
    console.log('---------------------------------')
    console.log('The acceptance on the agreemet is ' + (report.acceptanceValid ? 'valid' : 'invalid'))
}

const presentCounterOffers = (param, proposals) => {
    let counteredProposal = proposals.get(param)
    if (!counteredProposal) {
        throw new Error('proposal not found')
    }
    counteredProposal.counterOffers.forEach((counterOffer) => {
        console.log('---------------------------------')
        console.log('request: ' + counterOffer.body.requestId)
        console.log('taker id: ' + counterOffer.body.takerId)
        console.log('offer asset: ' + counterOffer.body.offerAsset)
        console.log('offer amount: ' + counterOffer.body.offerAmount)
        console.log('request asset: ' + counterOffer.body.requestAsset)
        console.log('request amount: ' + counterOffer.body.requestAmount)
        console.log('---------------------------------')
    })
}

const presentOfferHistory = (param, proposals) => {
    let proposal = proposals.get(param)
    if (!proposal) {
        throw new Error('proposal not found')
    }
    console.log('---------------------------------')
    console.log('Original Proposal')
    console.log('from public key: ' + proposal.publicKey.toString('hex'))
    console.log('request: ' + proposal.body.requestId)
    console.log('maker id: ' + proposal.body.makerId)
    console.log('offer asset: ' + proposal.body.offerAsset)
    console.log('offer amount: ' + proposal.body.offerAmount)
    console.log('request asset: ' + proposal.body.requestAsset)
    console.log('request amount: ' + proposal.body.requestAmount)
    console.log('---------------------------------')
    proposal.counterOffers.forEach((counterOffer) => {
        console.log('---------------------------------')
        console.log('Counter Offer')
        console.log('from public key: ' + counterOffer.publicKey.toString('hex'))
        console.log('request: ' + counterOffer.body.requestId)
        console.log('maker id: ' + counterOffer.body.makerId)
        console.log('taker id: ' + counterOffer.body.takerId)
        console.log('offer asset: ' + counterOffer.body.offerAsset)
        console.log('offer amount: ' + counterOffer.body.offerAmount)
        console.log('request asset: ' + counterOffer.body.requestAsset)
        console.log('request amount: ' + counterOffer.body.requestAmount)
        console.log('---------------------------------')
    })
    proposal.acceptances.forEach((acceptance) => {
        console.log('---------------------------------')
        console.log('Acceptance')
        console.log('from public key: ' + acceptance.publicKey.toString('hex'))
        console.log('request: ' + acceptance.body.requestId)
        console.log('maker id: ' + acceptance.body.makerId)
        console.log('taker id: ' + acceptance.body.takerId)
        console.log('offer asset: ' + acceptance.body.offerAsset)
        console.log('offer amount: ' + acceptance.body.offerAmount)
        console.log('request asset: ' + acceptance.body.requestAsset)
        console.log('request amount: ' + acceptance.body.requestAmount)
        console.log('---------------------------------')
    })
    proposal.fulfillments.forEach((fulfillment) => {
        console.log('---------------------------------')
        console.log('Fulfillment')
        console.log('from public key: ' + fulfillment.publicKey.toString('hex'))
        console.log('request: ' + fulfillment.body.requestId)
        console.log('maker id: ' + fulfillment.body.makerId)
        console.log('taker id: ' + fulfillment.body.takerId)
        console.log('message: ' + fulfillment.body.message)
        console.log('fulfullment: ' + JSON.stringify(fulfillment.body.fulfillment))
        console.log('---------------------------------')
    })
    if (proposal.resolution) {
        console.log('---------------------------------')
        console.log('Proposal resolved accepting taker id: ' + proposal.resolution.body.takerId)
        console.log('---------------------------------')
    }
    if (proposal.settlementInitiated) {
        console.log('---------------------------------')
        console.log('Settlement initiated with escrow id: ' + proposal.settlementInitiated.body.escrow)
        console.log('---------------------------------')
    }
    if (proposal.signatureRequired) {
        console.log('---------------------------------')
        console.log('The buyer issued disbursement')
        console.log('---------------------------------')
    }
}

const presentProposals = (proposals) => {
    console.clear()
    console.log('Proposals:')
    proposals.forEach((proposal, requestId) => {
        console.log('---------------------------------')
        console.log('request: ' + requestId)
        console.log('offer asset: ' + proposal.body.offerAsset)
        console.log('offer amount: ' + proposal.body.offerAmount)
        console.log('request asset: ' + proposal.body.requestAsset)
        console.log('request amount: ' + proposal.body.requestAmount)
        console.log('---------------------------------')
    })
}

const presentTransactionHistory = async (accountId) => {
    const records = await transactionHistory(accountId)
    records.forEach((item) => {
        console.log('\n' + 'Source Account: ' + item.source_account)
        console.log('Source Account Sequence: ' + item.source_account_sequence)
        console.log('Created At: ' + item.created_at)
        console.log('Memo: ' + item.memo)
        console.log('Successful: ' + item.successful)
        console.log('Fee Paid: ' + item.fee_paid)
        console.log('Ledger number: ' + item.ledger)
    })
}

const presentViewEscrow = async (param, proposals) => {
    const proposal = proposals.get(param)
    if (!proposal.settlementInitiated) {
        throw new Error('The settlement has not been initiated yet. No escrow account to view')
    }
    const escrowId = proposal.settlementInitiated.body.escrow
    const accountResult = await viewEscrow(escrowId)
    console.log('\nAccount Id: ' + accountResult.account_id)
    console.log('Sequence: ' + accountResult.sequence)
    console.log('Balance: ' + JSON.stringify(accountResult.balances[0]))
    for (i = 0; i < accountResult.signers.length; i++) {
        console.log('Signer: ' + JSON.stringify(accountResult.signers[i]))
    }
}

const presentPendingTransaction = async (param, proposals) => {
    const proposal = proposals.get(param)
    if (!proposal.signatureRequired) {
        throw new Error('The buyer has not yet disbursed. No contract to view.')
    }
    const pendingOperations = await viewTransactionOperations(proposal.signatureRequired.body.transaction)
    console.log('Pending Operations')
    pendingOperations.forEach((operation) => {
        console.log('type: ' + operation.type)
        if (operation.destination) {
            console.log('destination: ' + operation.destination)
        }
        if (operation.amount) {
            console.log('amount: ' + operation.amount)
        }
        console.log('----------------------------')
    })
}

module.exports = { presentOpenCases, presentCounterOffers, presentOfferHistory, presentProposals, presentTransactionHistory, presentViewEscrow, presentPendingTransaction, presentAgreementReport }