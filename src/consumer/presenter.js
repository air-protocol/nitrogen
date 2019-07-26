const { transactionHistory, viewEscrow, viewTransactionOperations } = require('./chain')
const { validateAgreement } = require('./agreement')
const chalk = require('chalk')

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

const presentViewAgreement = async (agreement) => {
    let message = agreement
    console.log('Original Proposal')
    while (message) {
        printNegotiationMessage(message)
        if (!message.next) {
            let acceptance = message
            acceptance.fulfillments.forEach((fulfillment) => {
                printFulfullment(fulfillment)
            })
            console.log('---------------------------------')
            console.log('Escrow information')
            await printEscrow(acceptance.settlementInitiated.body.escrow)
            console.log('---------------------------------')

            if (acceptance.signatureRequired) {
                console.log('---------------------------------')
                console.log('Pending Operations from Buyer disburse')
                printTransactionOperations(acceptance.signatureRequired.body.transaction)
                console.log('---------------------------------')
            }
        }
        message = message.next
    }
}

const printNegotiationMessage = (message) => {
    console.log('---------------------------------')
    if (message.body.message) {
        console.log('message type: ' + message.body.message)
    }
    console.log('from public key: ' + message.publicKey.toString('hex'))
    console.log('request: ' + message.body.requestId)
    console.log('maker id: ' + message.body.makerId)
    console.log('offer asset: ' + message.body.offerAsset)
    console.log('offer amount: ' + message.body.offerAmount)
    console.log('request asset: ' + message.body.requestAsset)
    console.log('request amount: ' + message.body.requestAmount)
    console.log('---------------------------------')
}

const printFulfullment = (fulfillment) => {
    console.log('---------------------------------')
    console.log('Fulfillment')
    console.log('from public key: ' + fulfillment.publicKey.toString('hex'))
    console.log('request: ' + fulfillment.body.requestId)
    console.log('maker id: ' + fulfillment.body.makerId)
    console.log('taker id: ' + fulfillment.body.takerId)
    console.log('message: ' + fulfillment.body.message)
    console.log('fulfullment: ' + JSON.stringify(fulfillment.body.fulfillment))
    console.log('---------------------------------')
}

const presentOfferHistory = (param, proposals) => {
    let proposal = proposals.get(param)
    if (!proposal) {
        throw new Error('proposal not found')
    }
    console.log('Original Proposal')
    printNegotiationMessage(proposal)
    proposal.counterOffers.forEach((counterOffer) => {
        printNegotiationMessage(counterOffer)
    })
    proposal.acceptances.forEach((acceptance) => {
        printNegotiationMessage(acceptance)
    })
    proposal.fulfillments.forEach((fulfillment) => {
        printFulfullment(fulfillment)
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
    if (proposal.disbursed) {
        console.log('---------------------------------')
        console.log('Final disbursement issued')
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

const printEscrow = async (escrowId) => {
    const accountResult = await viewEscrow(escrowId)
    console.log('Account Id: ' + accountResult.account_id)
    console.log('Sequence: ' + accountResult.sequence)
    console.log('Balance: ' + JSON.stringify(accountResult.balances[0]))
    for (i = 0; i < accountResult.signers.length; i++) {
        console.log('Signer: ' + JSON.stringify(accountResult.signers[i]))
    }
}

const presentViewEscrow = async (param, proposals) => {
    const proposal = proposals.get(param)
    if (!proposal.settlementInitiated) {
        throw new Error('The settlement has not been initiated yet. No escrow account to view')
    }
    const escrowId = proposal.settlementInitiated.body.escrow
    printEscrow(escrowId)
}

const printTransactionOperations = async (transaction) => {
    const pendingOperations = await viewTransactionOperations(transaction)
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

const presentPendingTransaction = async (param, proposals) => {
    const proposal = proposals.get(param)
    if (!proposal.signatureRequired) {
        throw new Error('The buyer has not yet disbursed. No contract to view.')
    }
    printTransactionOperations(proposal.signatureRequired.body.transaction)
}

const presentCase = async (param, adjudications) => {
    const adjudicationsForProposal = adjudications.get(param)
    if (!adjudicationsForProposal) {
        throw new Error('There are no adjudication messages for that request id')
    }
    console.log('Adjudications for case: ' + param)
    console.log('----------------------------')
    let report
    for (let i = 0; i < adjudicationsForProposal.length; i++) {
        report = await validateAgreement(adjudicationsForProposal[i].body.agreement)
        if (report.signatureFailures.length
            || report.hashFailures.length
            || report.linkFailures.length
            || (!report.acceptanceValid)) {
            console.log(chalk.red(i + ') uuid: ' + adjudicationsForProposal[i].uuid))
            console.log(chalk.red('timestamp: ' + adjudicationsForProposal[i].body.timeStamp))
            console.log(chalk.red('sender: ' + adjudicationsForProposal[i].publicKey))
        } else {
            console.log(chalk.green(i + ') uuid: ' + adjudicationsForProposal[i].uuid))
            console.log(chalk.green('timestamp: ' + adjudicationsForProposal[i].body.timeStamp))
            console.log(chalk.green('sender: ' + adjudicationsForProposal[i].publicKey))
        }
        console.log('\n----------------------------')
    }
}

module.exports = { presentOpenCases, presentCounterOffers, presentOfferHistory, presentProposals, presentTransactionHistory, presentViewEscrow, presentPendingTransaction, presentAgreementReport, presentCase, presentViewAgreement }
