jest.mock('../../src/consumer/chain')
jest.mock('../../src/config/config')
jest.mock('../../src/encrypt')
jest.mock('../../src/consumer/consumerPeer')

const BJSON = require('buffer-json')
const chain = require('../../src/consumer/chain')
const config = require('../../src/config/config')
const encrypt = require('../../src/encrypt')
const consumerPeer = require('../../src/consumer/consumerPeer')

consumerPeer.buildMessage.mockReturnValue({})
encrypt.encryptMessage.mockReturnValue({})
encrypt.signMessage.mockReturnValue({})
chain.initiateSettlement.mockReturnValue({publicKey: () => 'escrowPublicKey'})

config.juryKey = 'GDIAIGUHDGMTDLKC6KFU2DIR7JVNYI4WFQ5TWTVKEHZ4G3T47HEFNUME'

const proposalsJson = '[["abc1234",{"uuid":"7a6dc0c4-8fb0-46a5-9e08-527c1d11b65f","publicKey":{"type":"Buffer","data":"base64:BNIW57mBDChwR7YOgKEPt5sPkg7jQhpkKA6iH+XRp9tCYfd/hBzS292ptx+jwtWL0kRR1MldH8hXa/pAQ0nK6Pw="},"body":{"requestId":"abc1234","makerId":"GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3","offerAsset":"native","offerAmount":200,"requestAsset":"peanuts","requestAmount":100,"conditions":[],"juryPool":"ghi1234","challengeStake":100,"audience":[]},"hash":{"type":"Buffer","data":"base64:IoIx2LaFunJOEy/LlMX6vzRRwtFbEiStEBZLu4I0+lU="},"signature":{"type":"Buffer","data":"base64:MEUCIQD3BdpyzJzleLmyPHZfDgdjBGcOmuHhYLiDlh9YvFH92wIgBCITCefK03KCf1knWwbL7SqvqoZxFJfoZXIsB5rEL3k="},"counterOffers":[],"acceptances":[{"uuid":"f05c50c1-38f3-4aa1-b306-b4547c3fca3d","publicKey":{"type":"Buffer","data":"base64:BBD8eyh0V14brqRJLeI3w1m3qbJB6efJIskq26X4lSrkUgNm4t1Up6t7ulRj+EFVYfaiVGMBGGKbmDV94d5SSLk="},"body":{"requestId":"abc1234","makerId":"GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3","offerAsset":"native","offerAmount":200,"requestAsset":"peanuts","requestAmount":100,"conditions":[],"juryPool":"ghi1234","challengeStake":100,"audience":[],"takerId":"GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV","message":"accepted","previousHash":{"type":"Buffer","data":"base64:IoIx2LaFunJOEy/LlMX6vzRRwtFbEiStEBZLu4I0+lU="}},"recipientKey":{"type":"Buffer","data":"base64:BNIW57mBDChwR7YOgKEPt5sPkg7jQhpkKA6iH+XRp9tCYfd/hBzS292ptx+jwtWL0kRR1MldH8hXa/pAQ0nK6Pw="},"hash":{"type":"Buffer","data":"base64:4XMZI2XXni5JX9jSe0M05xG+M5HGw4eO2027Gsz8MWU="},"signature":{"type":"Buffer","data":"base64:MEUCIQCyNugVOHpxt1H+xZzAN/AmA1n03blyQpyeHbJNIuo5mAIgZcnEBEDuTVFipfhq17vCqCCLBjp1u9RCdXpmEoUBbCM="}}],"fulfillments":[],"resolution":{"uuid":"12a65ae3-2d48-4cbb-9c96-cf22002d3cec","publicKey":{"type":"Buffer","data":"base64:BNIW57mBDChwR7YOgKEPt5sPkg7jQhpkKA6iH+XRp9tCYfd/hBzS292ptx+jwtWL0kRR1MldH8hXa/pAQ0nK6Pw="},"body":{"requestId":"abc1234","makerId":"GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3","takerId":"GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV","message":"resolved","previousHash":{"type":"Buffer","data":"base64:IoIx2LaFunJOEy/LlMX6vzRRwtFbEiStEBZLu4I0+lU="}},"hash":{"type":"Buffer","data":"base64:djBHRkaTAuNKUp8E1BX9UWdt6lcboH12LaNqiBn8k3I="},"signature":{"type":"Buffer","data":"base64:MEUCIQCmNXriWpTDXAj3nmMIeSOAJgyAHxD+WOh4z6Gd2FEyugIgKn06DlANaQMi4CCexTXjQZ1guZpeN8RgbCDyJVmQAQE="}}}]]'
const proposals = new Map(BJSON.parse(proposalsJson))

const takerBuyerProposalsJson = '[["abc1234",{"uuid":"d128752e-be56-498b-a4ae-1a0b663ae371","publicKey":{"type":"Buffer","data":"base64:BJ0buadUWNmVH7Ep4fuuKewRUh8SLhNQaaYbaPacexYb6SYYLE7KmC2crcTvveJijMxkVbTS0CKNF8NEWPYQ4Qk="},"body":{"requestId":"abc1234","makerId":"GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3","offerAsset":"peanuts","offerAmount":100,"requestAsset":"native","requestAmount":200,"conditions":[],"juryPool":"ghi1234","challengeStake":100,"audience":[]},"hash":{"type":"Buffer","data":"base64:s8dD5y1qtHKpmjJCVLn4n1abuoJj0HMVL1VgftAS8Eo="},"signature":{"type":"Buffer","data":"base64:MEUCIQDoI8dWsNwDyJzsU/0nVS5eaqtt2XHFNwr2wd8o6qOr0gIgJfHczGgNfpKunHaefp6oja30qHEpO852RKqoEfRSs6o="},"counterOffers":[],"acceptances":[{"uuid":"fab00507-39ac-4544-92a2-3c2fe07ff2e7","publicKey":{"type":"Buffer","data":"base64:BNz6gl3Q8PAlK4s6piG708dzatBOWg64YD0U844oiiv4Ztihc0mdauInjHne8Og4zNkcsCuiul70VfcYoGIJSmI="},"body":{"requestId":"abc1234","makerId":"GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3","offerAsset":"peanuts","offerAmount":100,"requestAsset":"native","requestAmount":200,"conditions":[],"juryPool":"ghi1234","challengeStake":100,"audience":[],"takerId":"GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV","message":"accepted","previousHash":{"type":"Buffer","data":"base64:s8dD5y1qtHKpmjJCVLn4n1abuoJj0HMVL1VgftAS8Eo="}},"recipientKey":{"type":"Buffer","data":"base64:BJ0buadUWNmVH7Ep4fuuKewRUh8SLhNQaaYbaPacexYb6SYYLE7KmC2crcTvveJijMxkVbTS0CKNF8NEWPYQ4Qk="},"hash":{"type":"Buffer","data":"base64:byDoV0dzGcp44okeWnvkiF4dz0u7kPoiaeiKClFNy70="},"signature":{"type":"Buffer","data":"base64:MEUCIQD6WQ0ixVk7LWNyAjpBp4YGw6FGNab4GsMO86PbNTImYwIgbFjbIMYYygzAxgwAlJ2gwW/p4PJSc/EYhesKndfOXbM="}}],"fulfillments":[],"resolution":{"uuid":"deabbec7-e048-4a26-9f50-41fee53b1e65","publicKey":{"type":"Buffer","data":"base64:BJ0buadUWNmVH7Ep4fuuKewRUh8SLhNQaaYbaPacexYb6SYYLE7KmC2crcTvveJijMxkVbTS0CKNF8NEWPYQ4Qk="},"body":{"requestId":"abc1234","makerId":"GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3","takerId":"GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV","message":"resolved","previousHash":{"type":"Buffer","data":"base64:s8dD5y1qtHKpmjJCVLn4n1abuoJj0HMVL1VgftAS8Eo="}},"hash":{"type":"Buffer","data":"base64:x60ajUHT1+5UuJdMcrZgSZn2e2lzPMvr07FdgZ366lc="},"signature":{"type":"Buffer","data":"base64:MEQCICGmkfkI4/AyhPl/XoJrBUtaqrwf0VXEa8ULSOCumzaHAiASG0ar1lzliHXuNTiBM+Kd6B7hAHDrRD2RZXkoIV9DBA=="}}}]]'
const takerBuyerProposals = new Map(BJSON.parse(takerBuyerProposalsJson))

const publicKey = new Buffer('public')
const privateKey = new Buffer('private')
const keys = { publicKey, privateKey }


afterEach(() => {
    chain.initiateSettlement.mockClear()
})

const { processSettleProposal } = require('../../src/consumer/commandProcessor')

test('processSettleProposal calls initiateSettlement on chain when proposal is resolved (taker as buyer)', async () => {
    //Assemble
    config.consumerId = 'GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV'
    const settlementJson = '{ "requestId" : "abc1234", "secret" : "SDN5W3B2RSO4ZHVCY3EXUIZQD32JDWHVDBAO5A3FBUF4BPQBZZ3ST6IT"}'
    const buyerSecret = 'SDN5W3B2RSO4ZHVCY3EXUIZQD32JDWHVDBAO5A3FBUF4BPQBZZ3ST6IT'
    const juryPublic = 'GDIAIGUHDGMTDLKC6KFU2DIR7JVNYI4WFQ5TWTVKEHZ4G3T47HEFNUME'
    const sellerPublic = 'GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3'
    const challengeStake = 100
    const requestAmount = 200

    //Action
    await processSettleProposal(settlementJson, takerBuyerProposals, keys)

    //Assert
    expect(chain.initiateSettlement).toBeCalled()
    expect(chain.initiateSettlement.mock.calls[0][0]).toEqual(buyerSecret)
    expect(chain.initiateSettlement.mock.calls[0][1]).toEqual(sellerPublic)
    expect(chain.initiateSettlement.mock.calls[0][2]).toEqual(juryPublic)
    expect(chain.initiateSettlement.mock.calls[0][3]).toEqual(challengeStake)
    expect(chain.initiateSettlement.mock.calls[0][4]).toEqual(requestAmount)
})

test('processSettleProposal does not call initiateSettlement on chain when caller is not the buyer (taker as buyer)', async () => {
    //Assemble
    config.consumerId = 'GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV'
    const settlementJson = '{ "requestId" : "abc1234", "secret" : "SDN5W3B2RSO4ZHVCY3EXUIZQD32JDWHVDBAO5A3FBUF4BPQBZZ3ST6IT"}'
    const buyerSecret = 'SDN5W3B2RSO4ZHVCY3EXUIZQD32JDWHVDBAO5A3FBUF4BPQBZZ3ST6IT'
    const juryPublic = 'GDIAIGUHDGMTDLKC6KFU2DIR7JVNYI4WFQ5TWTVKEHZ4G3T47HEFNUME'
    const sellerPublic = 'GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3'
    const challengeStake = 100
    const requestAmount = 200

    //Action
    try {
        await processSettleProposal(settlementJson, proposals, keys)
    } catch (e) {
        //noop
    }

    //Assert
    expect(chain.initiateSettlement).not.toBeCalled()
})

test('processSettleProposal throws an error when caller is not the buyer (taker as buyer)', async () => {
    //Assemble
    config.consumerId = 'GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV'
    const settlementJson = '{ "requestId" : "abc1234", "secret" : "SDN5W3B2RSO4ZHVCY3EXUIZQD32JDWHVDBAO5A3FBUF4BPQBZZ3ST6IT"}'
    const buyerSecret = 'SDN5W3B2RSO4ZHVCY3EXUIZQD32JDWHVDBAO5A3FBUF4BPQBZZ3ST6IT'
    const juryPublic = 'GDIAIGUHDGMTDLKC6KFU2DIR7JVNYI4WFQ5TWTVKEHZ4G3T47HEFNUME'
    const sellerPublic = 'GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3'
    const challengeStake = 100
    const requestAmount = 200

    //Action
    try {
        await processSettleProposal(settlementJson, proposals, keys)
    } catch (e) {
        //Assert
        expect(e.message).toMatch('only party buying with lumens can initiate settlement')
    }

})

test('processSettleProposal does not call initiateSettlement on chain when caller is not the buyer', async () => {
    //Assemble
    config.consumerId = 'GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3'
    const settlementJson = '{ "requestId" : "abc1234", "secret" : "SAQEACFGGCOY46GR5ZNVNGX53COWMEOTXEFZSM5RNBIJ4LPKHIFIDWUH"}'
    const buyerSecret = 'SAQEACFGGCOY46GR5ZNVNGX53COWMEOTXEFZSM5RNBIJ4LPKHIFIDWUH'
    const juryPublic = 'GDIAIGUHDGMTDLKC6KFU2DIR7JVNYI4WFQ5TWTVKEHZ4G3T47HEFNUME'
    const sellerPublic = 'GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV'
    const challengeStake = 100
    const offerAmount = 200

    //Action
    try {
        await processSettleProposal(settlementJson, takerBuyerProposals, keys)
    } catch (e) {
        //noop
    }

    //Assert
    expect(chain.initiateSettlement).not.toBeCalled()
})

test('processSettleProposal throws an error when caller is not the buyer', async () => {
    //Assemble
    config.consumerId = 'GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3'
    const settlementJson = '{ "requestId" : "abc1234", "secret" : "SAQEACFGGCOY46GR5ZNVNGX53COWMEOTXEFZSM5RNBIJ4LPKHIFIDWUH"}'
    const buyerSecret = 'SAQEACFGGCOY46GR5ZNVNGX53COWMEOTXEFZSM5RNBIJ4LPKHIFIDWUH'
    const juryPublic = 'GDIAIGUHDGMTDLKC6KFU2DIR7JVNYI4WFQ5TWTVKEHZ4G3T47HEFNUME'
    const sellerPublic = 'GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV'
    const challengeStake = 100
    const offerAmount = 200

    //Action
    try {
        await processSettleProposal(settlementJson, takerBuyerProposals, keys)
    } catch (e) {
        //Assert
        expect(e.message).toMatch('only party buying with lumens can initiate settlement')
    }
})

test('processSettleProposal calls initiateSettlement on chain when proposal is resolved', async () => {
    //Assemble
    config.consumerId = 'GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3'
    const settlementJson = '{ "requestId" : "abc1234", "secret" : "SAQEACFGGCOY46GR5ZNVNGX53COWMEOTXEFZSM5RNBIJ4LPKHIFIDWUH"}'
    const buyerSecret = 'SAQEACFGGCOY46GR5ZNVNGX53COWMEOTXEFZSM5RNBIJ4LPKHIFIDWUH'
    const juryPublic = 'GDIAIGUHDGMTDLKC6KFU2DIR7JVNYI4WFQ5TWTVKEHZ4G3T47HEFNUME'
    const sellerPublic = 'GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV'
    const challengeStake = 100
    const offerAmount = 200

    //Action
    await processSettleProposal(settlementJson, proposals, keys)

    //Assert
    expect(chain.initiateSettlement).toBeCalled()
    expect(chain.initiateSettlement.mock.calls[0][0]).toEqual(buyerSecret)
    expect(chain.initiateSettlement.mock.calls[0][1]).toEqual(sellerPublic)
    expect(chain.initiateSettlement.mock.calls[0][2]).toEqual(juryPublic)
    expect(chain.initiateSettlement.mock.calls[0][3]).toEqual(challengeStake)
    expect(chain.initiateSettlement.mock.calls[0][4]).toEqual(offerAmount)
})

test('processSettleProposal doest not call initiateSettlement when proposal is missing', async () => {
    //Assemble
    config.consumerId = 'GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3'
    const settlementJson = '{ "requestId" : "abc1234", "secret" : "SAQEACFGGCOY46GR5ZNVNGX53COWMEOTXEFZSM5RNBIJ4LPKHIFIDWUH"}'

    //Action
    try {
        await processSettleProposal(settlementJson, new Map(), keys)
    } catch (e) {
        //noop
    }

    //Assert
    expect(chain.initiateSettlement).not.toBeCalled()
})

test('processSettleProposal does not call initiateSettlement when proposal is not resolved', async () => {
    //Assemble
    config.consumerId = 'GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3'
    const settlementJson = '{ "requestId" : "abc1234", "secret" : "SAQEACFGGCOY46GR5ZNVNGX53COWMEOTXEFZSM5RNBIJ4LPKHIFIDWUH"}'
    const unresolvedProposals = new Map(JSON.parse(proposalsJson))
    unresolvedProposals.get('abc1234').resolution = undefined

    //Action
    try {
        await processSettleProposal(settlementJson, unresolvedProposals, keys)
    } catch (e) {
        //noop
    }

    //Assert
    expect(chain.initiateSettlement).not.toBeCalled()
})

test('processSettleProposal doest not call initiateSettlement when proposal is resolved without a taker', async () => {
    //Assemble
    config.consumerId = 'GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3'
    const settlementJson = '{ "requestId" : "abc1234", "secret" : "SAQEACFGGCOY46GR5ZNVNGX53COWMEOTXEFZSM5RNBIJ4LPKHIFIDWUH"}'
    const unresolvedProposals = new Map(JSON.parse(proposalsJson))
    unresolvedProposals.get('abc1234').resolution.takerId = ''

    //Action
    try {
        await processSettleProposal(settlementJson, unresolvedProposals, keys)
    } catch (e) {
        //noop
    }

    //Assert
    expect(chain.initiateSettlement).not.toBeCalled()
}) 