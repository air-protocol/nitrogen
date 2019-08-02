const { getKeyFromPreviousHash, getResolvedAcceptance } = require('../../src/consumer/proposalHelper')

const proposalsJson = '[["abc1234",{"uuid":"3b914bc5-58a7-4d13-b1f3-2eb6972f3836","publicKey":"04955cda95e98f3af8b46f4d3d5ba52bdda031984f51b657434f9d95d399b17a417ab0726076c30c4828b86b95a39c0de6b9d09d3c9b7b5d2046f22c6264ef633e","body":{"requestId":"abc1234","makerId":"GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3","offerAsset":"native","offerAmount":200,"requestAsset":"peanuts","requestAmount":100,"conditions":[],"juryPool":"ghi1234","challengeStake":100,"audience":[]},"hash":"228231d8b685ba724e132fcb94c5fabf3451c2d15b1224ad10164bbb8234fa55","signature":"3045022100f3f9ae1a24f7462f99a46e15ad84024ee7fd1c6bca76fe72297d434fe79f18f6022079c4d08f2c6075b12da3e49f4876cc0bcf3de4adb78a881814467026cc2d9f2d","counterOffers":[],"acceptances":[{"uuid":"20fa8059-8602-4a08-b383-b30e11b377f7","publicKey":"04a9238a2b56a5c5fe31553e6aa2c3677985d90b4aa635fccfdc6c8fa407eb3f6b3a3c55ef5a7c45b078e9a51fcec82e165d9aaf88147d28ca7a19718948f33782","body":{"requestId":"abc1234","makerId":"GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3","offerAsset":"native","offerAmount":200,"requestAsset":"peanuts","requestAmount":100,"conditions":[],"juryPool":"ghi1234","challengeStake":100,"audience":[],"takerId":"GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV","message":"accepted","previousHash":"228231d8b685ba724e132fcb94c5fabf3451c2d15b1224ad10164bbb8234fa55"},"recipientKey":"04955cda95e98f3af8b46f4d3d5ba52bdda031984f51b657434f9d95d399b17a417ab0726076c30c4828b86b95a39c0de6b9d09d3c9b7b5d2046f22c6264ef633e","hash":"93b5e4e59d588cb4c2af502a937f5f18986031c7947ea0f4df3d18b4e2584426","signature":"3044022075612f48e957959cf81d3eebcae23544365408f48375b80f6e9c293020fb9c6e0220354a44eb550c03600341521742c8242368f71e6055794a87e1d2128c5e119d8a"}],"fulfillments":[],"resolution":{"uuid":"e3cdba78-1673-4587-968a-cf885962c272","publicKey":"04955cda95e98f3af8b46f4d3d5ba52bdda031984f51b657434f9d95d399b17a417ab0726076c30c4828b86b95a39c0de6b9d09d3c9b7b5d2046f22c6264ef633e","body":{"requestId":"abc1234","makerId":"GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3","takerId":"GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV","message":"resolved","previousHash":"228231d8b685ba724e132fcb94c5fabf3451c2d15b1224ad10164bbb8234fa55"},"hash":"8f24bad33aa2a5afc234d70babd4ddef5d99a629277bf08c4c671042ed0eccf9","signature":"3045022100eaaabcc22390256c0e3f1def43fea555227ddbf647e6de2d1b8a8c2579da5dcb02203a7cdd8317bb6a7cda5db2296e2300dc4ee4f0b360dca740bb25df0b20c73460"}}]]'
const proposals = new Map(JSON.parse(proposalsJson))

test('getKeyFromPreviousHash does', () => {

    //Assemble
    const recipientKey = '04955cda95e98f3af8b46f4d3d5ba52bdda031984f51b657434f9d95d399b17a417ab0726076c30c4828b86b95a39c0de6b9d09d3c9b7b5d2046f22c6264ef633e'
    const previousHash = '228231d8b685ba724e132fcb94c5fabf3451c2d15b1224ad10164bbb8234fa55'

    //Action
    const result = getKeyFromPreviousHash(previousHash, proposals.get('abc1234'))

    //Assert
    expect(result).toEqual(recipientKey)
})

test('getResolvedAcceptance does', () => {
    //Assemble

    //Action
    const {proposal, acceptance} = getResolvedAcceptance('abc1234', proposals)

    //Assert
    expect(proposal).toBe(proposals.get('abc1234'))
    expect(proposal.resolution).toEqual(expect.anything())
    expect(proposal.resolution.body.takerId).toEqual(expect.anything())
    expect(proposal.acceptances).toEqual(expect.anything())
    expect(proposal.acceptances.length).toBeGreaterThan(0)
    expect(acceptance.body.takerId).toEqual(proposal.resolution.body.takerId)
})