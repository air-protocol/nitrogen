jest.mock('../../src/consumer/chain')
jest.mock('../../src/config/config')

const chain = require('../../src/consumer/chain')
const config = require('../../src/config/config')

config.juryKey = 'GDIAIGUHDGMTDLKC6KFU2DIR7JVNYI4WFQ5TWTVKEHZ4G3T47HEFNUME'

const proposalsJson = '[["abc1234",{"uuid":"db836403-ff5c-4ea8-b699-7ed3b2053261","publicKey":{"type":"Buffer","data":[4,96,193,172,30,18,95,146,245,208,241,68,226,187,8,236,113,73,254,185,246,112,82,28,106,11,103,248,235,175,46,105,189,100,52,243,116,129,246,241,183,61,31,164,237,207,103,165,64,80,5,36,174,153,115,99,199,157,195,75,197,63,61,110,58]},"body":{"requestId":"abc1234","makerId":"GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3","offerAsset":"native","offerAmount":200,"requestAsset":"peanuts","requestAmount":100,"conditions":[],"juryPool":"ghi1234","challengeStake":100,"audience":[]},"makerId":"GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3","hash":{"type":"Buffer","data":[34,130,49,216,182,133,186,114,78,19,47,203,148,197,250,191,52,81,194,209,91,18,36,173,16,22,75,187,130,52,250,85]},"signature":{"type":"Buffer","data":[48,68,2,32,26,68,108,127,236,222,145,38,129,70,225,32,172,214,196,164,71,114,182,5,132,44,209,47,82,70,149,220,69,152,183,246,2,32,66,12,165,138,204,99,242,55,118,157,19,212,219,249,10,160,121,11,252,196,247,197,115,24,226,36,202,117,179,187,132,108]},"counterOffers":[],"acceptances":[{"uuid":"97887c16-2ed0-44fd-a5bc-6df0b1922ad6","publicKey":{"type":"Buffer","data":[4,71,143,196,211,11,224,135,95,128,0,234,255,158,207,31,17,19,88,156,37,11,108,1,100,115,103,15,227,150,122,45,254,170,92,239,164,120,1,150,76,229,205,191,70,113,168,192,113,102,47,201,113,8,170,71,160,250,130,110,201,154,86,55,146]},"body":{"requestId":"abc1234","makerId":"GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3","offerAsset":"native","offerAmount":200,"requestAsset":"peanuts","requestAmount":100,"conditions":[],"juryPool":"ghi1234","challengeStake":100,"audience":[],"takerId":"GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV","message":"accepted","previousHash":{"type":"Buffer","data":[34,130,49,216,182,133,186,114,78,19,47,203,148,197,250,191,52,81,194,209,91,18,36,173,16,22,75,187,130,52,250,85]}},"makerId":"GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3","takerId":"GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV","hash":{"type":"Buffer","data":[225,115,25,35,101,215,158,46,73,95,216,210,123,67,52,231,17,190,51,145,198,195,135,142,219,77,187,26,204,252,49,101]},"signature":{"type":"Buffer","data":[48,68,2,32,39,79,78,242,71,170,70,167,169,230,85,227,100,108,197,163,102,10,223,125,84,156,59,8,163,130,120,68,147,32,246,46,2,32,95,210,69,202,189,39,227,213,139,50,34,226,170,137,38,146,144,248,115,40,45,79,214,160,102,31,59,209,31,25,120,13]}}],"rejections":[],"resolution":{"uuid":"c8063a28-50d5-4209-9095-f857b2fcc136","publicKey":{"type":"Buffer","data":[4,96,193,172,30,18,95,146,245,208,241,68,226,187,8,236,113,73,254,185,246,112,82,28,106,11,103,248,235,175,46,105,189,100,52,243,116,129,246,241,183,61,31,164,237,207,103,165,64,80,5,36,174,153,115,99,199,157,195,75,197,63,61,110,58]},"body":{"requestId":"abc1234","makerId":"GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3","takerId":"GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV","message":"resolved","previousHash":{"type":"Buffer","data":[34,130,49,216,182,133,186,114,78,19,47,203,148,197,250,191,52,81,194,209,91,18,36,173,16,22,75,187,130,52,250,85]}},"makerId":"GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3","takerId":"GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV","hash":{"type":"Buffer","data":[118,48,71,70,70,147,2,227,74,82,159,4,212,21,253,81,103,109,234,87,27,160,125,118,45,163,106,136,25,252,147,114]},"signature":{"type":"Buffer","data":[48,69,2,33,0,146,120,181,207,159,190,17,206,251,17,136,3,105,224,107,66,140,7,79,209,140,70,128,209,92,15,163,238,59,91,207,153,2,32,88,16,179,88,96,125,250,184,162,226,237,180,58,241,107,73,69,34,6,155,10,115,0,123,225,42,164,10,110,215,87,89]}}}]]'
const proposals = new Map(JSON.parse(proposalsJson))

const takerBuyerProposalsJson = '[["abc1234",{"uuid":"b8b65006-a4c6-4ef1-b83c-9c5bcd2030f1","publicKey":{"type":"Buffer","data":[4,194,61,71,186,13,17,200,215,174,137,182,233,19,166,107,0,73,158,145,50,54,236,45,97,1,15,56,142,186,148,246,173,153,10,80,246,238,147,138,133,58,163,32,140,73,163,116,79,54,250,127,32,19,167,180,47,31,200,88,56,205,245,123,138]},"body":{"requestId":"abc1234","makerId":"GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3","offerAsset":"peanuts","offerAmount":100,"requestAsset":"native","requestAmount":200,"conditions":[],"juryPool":"ghi1234","challengeStake":100,"audience":[]},"makerId":"GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3","hash":{"type":"Buffer","data":[179,199,67,231,45,106,180,114,169,154,50,66,84,185,248,159,86,155,186,130,99,208,115,21,47,85,96,126,208,18,240,74]},"signature":{"type":"Buffer","data":[48,69,2,33,0,224,117,194,120,200,158,199,148,13,66,144,120,115,187,246,115,140,54,106,72,68,124,102,48,124,145,71,89,31,208,19,0,2,32,95,220,223,198,77,67,145,169,14,166,42,79,132,94,19,201,17,27,207,71,110,15,50,148,189,223,158,242,84,162,134,32]},"counterOffers":[],"acceptances":[{"uuid":"87a12882-a52e-4648-9ac3-42590608d74b","publicKey":{"type":"Buffer","data":[4,66,71,102,243,102,242,27,16,108,0,61,33,98,3,240,7,11,208,128,53,102,13,181,206,61,140,220,31,108,78,200,100,85,118,6,11,79,187,151,69,22,66,101,56,124,142,92,193,11,178,236,158,138,122,156,70,5,79,45,15,145,162,188,49]},"body":{"requestId":"abc1234","makerId":"GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3","offerAsset":"peanuts","offerAmount":100,"requestAsset":"native","requestAmount":200,"conditions":[],"juryPool":"ghi1234","challengeStake":100,"audience":[],"takerId":"GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV","message":"accepted","previousHash":{"type":"Buffer","data":[179,199,67,231,45,106,180,114,169,154,50,66,84,185,248,159,86,155,186,130,99,208,115,21,47,85,96,126,208,18,240,74]}},"makerId":"GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3","takerId":"GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV","hash":{"type":"Buffer","data":[111,32,232,87,71,115,25,202,120,226,137,30,90,123,228,136,94,29,207,75,187,144,250,34,105,232,138,10,81,77,203,189]},"signature":{"type":"Buffer","data":[48,69,2,33,0,164,165,107,70,60,122,217,96,121,255,23,180,106,252,201,82,152,5,162,6,165,83,68,226,240,159,153,227,51,77,129,124,2,32,64,134,85,43,171,245,224,237,163,156,2,216,33,172,180,162,180,3,229,98,18,44,54,8,118,44,222,26,47,103,169,92]}}],"rejections":[],"resolution":{"uuid":"e22e30bf-5071-411b-b8b1-13d6cf8b52be","publicKey":{"type":"Buffer","data":[4,194,61,71,186,13,17,200,215,174,137,182,233,19,166,107,0,73,158,145,50,54,236,45,97,1,15,56,142,186,148,246,173,153,10,80,246,238,147,138,133,58,163,32,140,73,163,116,79,54,250,127,32,19,167,180,47,31,200,88,56,205,245,123,138]},"body":{"requestId":"abc1234","makerId":"GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3","takerId":"GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV","message":"resolved","previousHash":{"type":"Buffer","data":[179,199,67,231,45,106,180,114,169,154,50,66,84,185,248,159,86,155,186,130,99,208,115,21,47,85,96,126,208,18,240,74]}},"makerId":"GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3","takerId":"GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV","hash":{"type":"Buffer","data":[199,173,26,141,65,211,215,238,84,184,151,76,114,182,96,73,153,246,123,105,115,60,203,235,211,177,93,129,157,250,234,87]},"signature":{"type":"Buffer","data":[48,68,2,32,76,67,193,115,222,59,56,34,43,212,158,137,248,82,176,137,166,219,195,173,0,1,237,236,206,234,244,11,126,71,169,104,2,32,64,127,191,85,223,57,188,9,177,16,123,232,152,150,28,134,233,95,203,15,161,137,37,158,212,192,194,218,55,16,207,236]}}}]]'
const takerBuyerProposals = new Map(JSON.parse(takerBuyerProposalsJson))


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
    await processSettleProposal(settlementJson, takerBuyerProposals)

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
    await processSettleProposal(settlementJson, proposals)

    //Assert
    expect(chain.initiateSettlement).not.toBeCalled()
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
    await processSettleProposal(settlementJson, takerBuyerProposals)

    //Assert
    expect(chain.initiateSettlement).not.toBeCalled()
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
    await processSettleProposal(settlementJson, proposals)

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
    await processSettleProposal(settlementJson, new Map())

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
    await processSettleProposal(settlementJson, unresolvedProposals)

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
    await processSettleProposal(settlementJson, unresolvedProposals)

    //Assert
    expect(chain.initiateSettlement).not.toBeCalled()
}) 