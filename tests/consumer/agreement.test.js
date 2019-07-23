const { buildAgreement, validateAgreement } = require('../../src/consumer/agreement')
const proposalsJson = '[["cde1234",{"uuid":"cf98d895-8ff6-48ae-a162-e4643c684a80","publicKey":"049c2f477d4fd59c5458fae7fb4d541a6b6132243a29a5e813d196961796988a55e28db2e332b6b93dd0f02b30531838f1cd329be803a3f6b6143e07afe530bf58","body":{"requestId":"cde1234","makerId":"GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3","offerAsset":"native","offerAmount":200,"requestAsset":"peanuts","requestAmount":100,"conditions":[],"juryPool":"ghi1234","challengeStake":5,"audience":[]},"hash":"a9797fb9e2105585d618a66aad30da293b197e8fc3bbd5ab7c53e97307e34a0d","signature":"304402206b1089fede7d96041a8b1137493132178e51ea74b332b8a2934086631cc806d0022040eb92aa11044b64adc04b36369de9f01506e2558af28890c43841b951aa672e","counterOffers":[{"uuid":"fd14934f-d05a-43bc-bc8b-83e4e2cc366c","publicKey":"045c6f5fb25784e593177bc64d95cd637e02572c0fe7ce3d6bd06667f34700db17e9aec54de1f50df15e680ab6a6e3adb20cb66f1ae2208502c967b7002cd1a917","body":{"requestId":"cde1234","makerId":"GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3","offerAsset":"native","offerAmount":200,"requestAsset":"peanuts","requestAmount":80,"conditions":[],"juryPool":"ghi1234","challengeStake":5,"audience":[],"takerId":"GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV","message":"countered","previousHash":"a9797fb9e2105585d618a66aad30da293b197e8fc3bbd5ab7c53e97307e34a0d"},"recipientKey":"049c2f477d4fd59c5458fae7fb4d541a6b6132243a29a5e813d196961796988a55e28db2e332b6b93dd0f02b30531838f1cd329be803a3f6b6143e07afe530bf58","hash":"2c9afe76bfb3c86765742a984afaf28b4232ec2292c6ac179323c09d2dc9bdc7","signature":"30440220664539bd6462d45015d7187571de91f6194bc8aa127e9399a138b1db093677480220624c223bf795203df446609b950ed0c0f66f2711245da0b0ad1f48238e593764"},{"uuid":"c055fee9-3d26-4d7a-aa6a-e998c5d3bc98","publicKey":"049c2f477d4fd59c5458fae7fb4d541a6b6132243a29a5e813d196961796988a55e28db2e332b6b93dd0f02b30531838f1cd329be803a3f6b6143e07afe530bf58","body":{"requestId":"cde1234","makerId":"GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3","offerAsset":"native","offerAmount":200,"requestAsset":"peanuts","requestAmount":95,"conditions":[],"juryPool":"ghi1234","challengeStake":5,"audience":[],"takerId":"GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV","message":"countered","previousHash":"2c9afe76bfb3c86765742a984afaf28b4232ec2292c6ac179323c09d2dc9bdc7"},"recipientKey":"045c6f5fb25784e593177bc64d95cd637e02572c0fe7ce3d6bd06667f34700db17e9aec54de1f50df15e680ab6a6e3adb20cb66f1ae2208502c967b7002cd1a917","hash":"85b5865c2094b96a65b9ababe54af5b2404ed1a6e6d24d72c6ffafcfa1955fd0","signature":"3045022100c71f93e86f2aa7087bcc78a37c1da3789c5410a4f96bd031681d0f9bb805748d02205cd4541c266b6317d545dc133701f40589f064020abaac180045ff531865e8c6"}],"rejections":[],"acceptances":[{"uuid":"e9e132f6-f771-47be-88e4-4f9adc72beaa","publicKey":"045c6f5fb25784e593177bc64d95cd637e02572c0fe7ce3d6bd06667f34700db17e9aec54de1f50df15e680ab6a6e3adb20cb66f1ae2208502c967b7002cd1a917","body":{"requestId":"cde1234","makerId":"GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3","offerAsset":"native","offerAmount":200,"requestAsset":"peanuts","requestAmount":95,"conditions":[],"juryPool":"ghi1234","challengeStake":5,"audience":[],"takerId":"GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV","message":"accepted","previousHash":"85b5865c2094b96a65b9ababe54af5b2404ed1a6e6d24d72c6ffafcfa1955fd0"},"recipientKey":"049c2f477d4fd59c5458fae7fb4d541a6b6132243a29a5e813d196961796988a55e28db2e332b6b93dd0f02b30531838f1cd329be803a3f6b6143e07afe530bf58","hash":"fb0f8de38b2babe0c8a7032d0cfb0e1b3a771e99bc7f62deeba69f1049434031","signature":"304402203ae5d387b7f74a0bf041537cce01a294b07f61b7c411c5e81b5e4f386bca50f40220305c66016592a3e9823163ca14ff1851a4b00d665e32a0c4d4a3b40537ff40b4"}],"fulfillments":[{"uuid":"692286e0-1c69-4e6a-ae55-8a369b923290","publicKey":"049c2f477d4fd59c5458fae7fb4d541a6b6132243a29a5e813d196961796988a55e28db2e332b6b93dd0f02b30531838f1cd329be803a3f6b6143e07afe530bf58","body":{"requestId":"cde1234","makerId":"GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3","takerId":"GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV","message":"fulfillment","fulfillment":"account transfer","previousHash":"fb0f8de38b2babe0c8a7032d0cfb0e1b3a771e99bc7f62deeba69f1049434031"},"recipientKey":"045c6f5fb25784e593177bc64d95cd637e02572c0fe7ce3d6bd06667f34700db17e9aec54de1f50df15e680ab6a6e3adb20cb66f1ae2208502c967b7002cd1a917","hash":"f3f99a3450acee3295e9885495e3f2f31f0982c85c41ea19daf772c292047aa0","signature":"304402205697047c7fb3b25ac3a4a59ee22c7a476d015ab6a91a2ecafa5e3e1916ab31ce022035ce320d96e7025ccf4c5c596c7e43db3f2ecfd8432f1d4d13ee16414525e363"},{"uuid":"8405a61b-4118-441e-ad6e-547323880fb9","publicKey":"045c6f5fb25784e593177bc64d95cd637e02572c0fe7ce3d6bd06667f34700db17e9aec54de1f50df15e680ab6a6e3adb20cb66f1ae2208502c967b7002cd1a917","body":{"requestId":"cde1234","makerId":"GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3","takerId":"GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV","message":"fulfillment","fulfillment":"account transfer","previousHash":"fb0f8de38b2babe0c8a7032d0cfb0e1b3a771e99bc7f62deeba69f1049434031"},"recipientKey":"049c2f477d4fd59c5458fae7fb4d541a6b6132243a29a5e813d196961796988a55e28db2e332b6b93dd0f02b30531838f1cd329be803a3f6b6143e07afe530bf58","hash":"f3f99a3450acee3295e9885495e3f2f31f0982c85c41ea19daf772c292047aa0","signature":"3045022100bc7ddad3946f34f6e260c9181a480628ad979221195e6963ad8b81bf9b16f3840220600e941310539822adf32dc995212f87b8bfeda968d37ad1ca5b406e71f04638"}],"resolution":{"uuid":"e7a81c8b-8b15-4120-9cc7-adddae8f6cc9","publicKey":"049c2f477d4fd59c5458fae7fb4d541a6b6132243a29a5e813d196961796988a55e28db2e332b6b93dd0f02b30531838f1cd329be803a3f6b6143e07afe530bf58","body":{"requestId":"cde1234","makerId":"GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3","takerId":"GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV","message":"resolved","previousHash":"a9797fb9e2105585d618a66aad30da293b197e8fc3bbd5ab7c53e97307e34a0d"},"hash":"c6e807a0d59744fcaf0067942e262e6b2944207fa8fc24881886a5d2850983a3","signature":"3045022100fb4474ed137350d5c43bc6c01a97ef45697545ec3f1fc4f5ad0466514ef24e310220354bef5d3a6b6fcebb68d3538526b4a759607f0738f2dd5602e00ebb74da71ca"},"settlementInitiated":{"uuid":"a600578b-a180-4f1d-bd4f-69101f02709b","publicKey":"049c2f477d4fd59c5458fae7fb4d541a6b6132243a29a5e813d196961796988a55e28db2e332b6b93dd0f02b30531838f1cd329be803a3f6b6143e07afe530bf58","body":{"makerId":"GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3","takerId":"GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV","requestId":"cde1234","message":"settlementInitiated","escrow":"GDW6LEICVFRRLQL45UO3LLUYW6DQNWS4JASKCQG6VOM42RGXEDMSIV2J","previousHash":"fb0f8de38b2babe0c8a7032d0cfb0e1b3a771e99bc7f62deeba69f1049434031"},"recipientKey":"045c6f5fb25784e593177bc64d95cd637e02572c0fe7ce3d6bd06667f34700db17e9aec54de1f50df15e680ab6a6e3adb20cb66f1ae2208502c967b7002cd1a917","hash":"6870d15016e845871f530163a5ed7c9f1d29f059bb2edcc2c5e44092cdf3fe33","signature":"304402201ee94f542f4da64418cc39aabad765bb4faa19030b10520687897bd0972efe72022051f2cf706cdfcfb1c7d986c09abddcafc059d345a0a611d13c8f229b6011cc0c"},"signatureRequired":{"uuid":"d54e0f67-be99-441e-a0b6-e721c3440fe6","publicKey":"049c2f477d4fd59c5458fae7fb4d541a6b6132243a29a5e813d196961796988a55e28db2e332b6b93dd0f02b30531838f1cd329be803a3f6b6143e07afe530bf58","body":{"makerId":"GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3","takerId":"GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV","requestId":"cde1234","message":"signatureRequired","transaction":"AAAAAO3lkQKpYxXBfO0dta6Yt4cG2lxIJKFA3quZzUTXINkkAAAAyAAUhbEAAAACAAAAAAAAAAAAAAACAAAAAAAAAAEAAAAAYo4h6Lq9uidCXGzXtEYZObEB6M9DurLG2zg4Itl8YAMAAAAAAAAAAHc1lAAAAAAAAAAACAAAAAAYJf2teKEI0fmZRSwam/E+esu7RaxyvOw49ePdCSKUxgAAAAAAAAABCSKUxgAAAEAZKZ0h77BHjqmgdy37KqSxz1iMAoNpSMOfh1mZLXuCU4ba/4InkiE3ZIsruq63EMYzeZirWR0+nxjuIGqW/OsI","previousHash":"fb0f8de38b2babe0c8a7032d0cfb0e1b3a771e99bc7f62deeba69f1049434031"},"recipientKey":"045c6f5fb25784e593177bc64d95cd637e02572c0fe7ce3d6bd06667f34700db17e9aec54de1f50df15e680ab6a6e3adb20cb66f1ae2208502c967b7002cd1a917","hash":"183492aae72673f7f5517e45201021a46bd9a7565b91c1802ccf95a0e77469dc","signature":"30450221009a15931d6fb645ffcaa978ea774de0cf0de53f8c1c405bdc9b447ec861309d8102203532a65badc84b0d4d302cd5662756cc817e2f2d6962f195b71d536ff10ad7cd"}}]]'

const proposals = new Map(JSON.parse(proposalsJson))

test('build agreement does', () => {
    //Assemble

    //Action
    const agreement = buildAgreement(proposals.get('cde1234'))

    //Assert
    expect(agreement.publicKey.toString('hex')).toEqual('049c2f477d4fd59c5458fae7fb4d541a6b6132243a29a5e813d196961796988a55e28db2e332b6b93dd0f02b30531838f1cd329be803a3f6b6143e07afe530bf58')
    expect(agreement.body.makerId).toEqual('GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3')
    expect(agreement.body.offerAsset).toEqual('native')
    expect(agreement.body.offerAmount).toEqual(200)
    expect(agreement.body.requestAsset).toEqual('peanuts')
    expect(agreement.body.requestAmount).toEqual(100)

    const firstCounterOffer = agreement.next
    expect(firstCounterOffer.publicKey.toString('hex')).toEqual('045c6f5fb25784e593177bc64d95cd637e02572c0fe7ce3d6bd06667f34700db17e9aec54de1f50df15e680ab6a6e3adb20cb66f1ae2208502c967b7002cd1a917')
    expect(firstCounterOffer.body.message).toEqual('countered')
    expect(firstCounterOffer.body.makerId).toEqual('GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3')
    expect(firstCounterOffer.body.takerId).toEqual('GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV')
    expect(firstCounterOffer.body.offerAsset).toEqual('native')
    expect(firstCounterOffer.body.offerAmount).toEqual(200)
    expect(firstCounterOffer.body.requestAsset).toEqual('peanuts')
    expect(firstCounterOffer.body.requestAmount).toEqual(80)

    const secondCounterOffer = agreement.next.next
    expect(secondCounterOffer.publicKey.toString('hex')).toEqual('049c2f477d4fd59c5458fae7fb4d541a6b6132243a29a5e813d196961796988a55e28db2e332b6b93dd0f02b30531838f1cd329be803a3f6b6143e07afe530bf58')
    expect(secondCounterOffer.body.message).toEqual('countered')
    expect(secondCounterOffer.body.makerId).toEqual('GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3')
    expect(secondCounterOffer.body.takerId).toEqual('GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV')
    expect(secondCounterOffer.body.offerAsset).toEqual('native')
    expect(secondCounterOffer.body.offerAmount).toEqual(200)
    expect(secondCounterOffer.body.requestAsset).toEqual('peanuts')
    expect(secondCounterOffer.body.requestAmount).toEqual(95)

    const acceptance = agreement.next.next.next
    expect(acceptance.publicKey.toString('hex')).toEqual('045c6f5fb25784e593177bc64d95cd637e02572c0fe7ce3d6bd06667f34700db17e9aec54de1f50df15e680ab6a6e3adb20cb66f1ae2208502c967b7002cd1a917')
    expect(acceptance.body.message).toEqual('accepted')
    expect(acceptance.body.makerId).toEqual('GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3')
    expect(acceptance.body.takerId).toEqual('GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV')
    expect(acceptance.body.offerAsset).toEqual('native')
    expect(acceptance.body.offerAmount).toEqual(200)
    expect(acceptance.body.requestAsset).toEqual('peanuts')
    expect(acceptance.body.requestAmount).toEqual(95)
})
test('validateAgreement reports clean', async () => {
    //Assemble
    let agreement = buildAgreement(proposals.get('cde1234'))

    //Action
    let report = await validateAgreement(agreement)

    //Assert
    expect(report.signatureFailures.length).toEqual(0)
})

test('validateAgreement checks message signatures', async () => {
    //Assemble
    let agreement = buildAgreement(proposals.get('cde1234'))
    agreement.next.signature = 'badsign'

    //Action
    let report = await validateAgreement(agreement)

    //Assert
    expect(report.signatureFailures.length).toEqual(1)
    expect(report.signatureFailures[0]).toEqual(agreement.next.uuid)
})

test('validateAgreement checks message content with signature', async () => {
    //Assemble
    let agreement = buildAgreement(proposals.get('cde1234'))
    agreement.body.requestAmount = 1000

    //Action
    let report = await validateAgreement(agreement)

    //Assert
    expect(report.signatureFailures.length).toEqual(1)
    expect(report.signatureFailures[0]).toEqual(agreement.uuid)
})

test('validateAgreement checks message hashes', async () => {
    //Assemble
    const agreement = buildAgreement(proposals.get('cde1234'))
    agreement.hash = 'badhash'
    agreement.next.next.hash = 'badhash'

    //Action
    let report = await validateAgreement(agreement)

    //Assert
    expect(report.hashFailures.length).toEqual(2)
    expect(report.hashFailures[0]).toEqual(agreement.uuid)
    expect(report.hashFailures[1]).toEqual(agreement.next.next.uuid)
})

test('validateAgreement checks message links', async () => {
    //Assemble
    const agreement = buildAgreement(proposals.get('cde1234'))
    agreement.next.next.body.previousHash = 'badhash'

    //Action
    let report = await validateAgreement(agreement)

    //Assert
    expect(report.linkFailures.length).toEqual(1)
    expect(report.linkFailures[0]).toEqual(agreement.next.next.uuid)
})