const BJSON = require('buffer-json')
const { buildAgreement } = require('../../src/consumer/agreement')
const proposalsJson = '[["cde1234",{"uuid":"84e075e3-4543-44a6-bc4c-456ba97f61e0","publicKey":{"type":"Buffer","data":"base64:BPrzfk1AFeWtnRshPYsrEmGpfspeDNH6sAU3/nOpndpjwM91z9RTB3AGChgmzOhaWQR4mZHV5UtNd1843IkRIPI="},"body":{"requestId":"cde1234","makerId":"GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3","offerAsset":"native","offerAmount":200,"requestAsset":"peanuts","requestAmount":100,"conditions":[],"juryPool":"ghi1234","challengeStake":5,"audience":[]},"hash":{"type":"Buffer","data":"base64:qXl/ueIQVYXWGKZqrTDaKTsZfo/Du9WrfFPpcwfjSg0="},"signature":{"type":"Buffer","data":"base64:MEQCIBkwjzYFmGbtmtDXCw7EZ7JF8edZFhy+grWUngzCr/xTAiBmV2iDOF2XQHSr+EJ26HKYASH8gwDtfL+yjFgVJbsizQ=="},"counterOffers":[{"uuid":"474762c1-93f4-47dc-a7cd-ba8a177c56f7","publicKey":{"type":"Buffer","data":"base64:BK+qirZEiXGjshzcueFXar+Tg6Edmxej0jno5olut/r4wmnr9Ln0gimd7TY3CQBEhKaV7xn3pUFwlPwNYl4I23A="},"body":{"requestId":"cde1234","makerId":"GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3","offerAsset":"native","offerAmount":200,"requestAsset":"peanuts","requestAmount":80,"conditions":[],"juryPool":"ghi1234","challengeStake":5,"audience":[],"takerId":"GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV","message":"countered","previousHash":{"type":"Buffer","data":"base64:qXl/ueIQVYXWGKZqrTDaKTsZfo/Du9WrfFPpcwfjSg0="}},"recipientKey":{"type":"Buffer","data":"base64:BPrzfk1AFeWtnRshPYsrEmGpfspeDNH6sAU3/nOpndpjwM91z9RTB3AGChgmzOhaWQR4mZHV5UtNd1843IkRIPI="},"hash":{"type":"Buffer","data":"base64:Bl3QefyzmkER71XIF91iwwhHKfjlqqYV2n3AAng1wMg="},"signature":{"type":"Buffer","data":"base64:MEQCIBX2e1kbCBXr9cLAg/26Mh82fQwfgz+bcTXwYAwhw9bAAiAsGs+SgfIsWecF/9zuDauztSGN+6kmA5nyCpdWw39Hmg=="}},{"uuid":"9be533a7-f108-40c6-a588-603e0ebc8efc","publicKey":{"type":"Buffer","data":"base64:BPrzfk1AFeWtnRshPYsrEmGpfspeDNH6sAU3/nOpndpjwM91z9RTB3AGChgmzOhaWQR4mZHV5UtNd1843IkRIPI="},"body":{"requestId":"cde1234","makerId":"GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3","offerAsset":"native","offerAmount":200,"requestAsset":"peanuts","requestAmount":95,"conditions":[],"juryPool":"ghi1234","challengeStake":5,"audience":[],"takerId":"GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV","message":"countered","previousHash":{"type":"Buffer","data":"base64:Bl3QefyzmkER71XIF91iwwhHKfjlqqYV2n3AAng1wMg="}},"recipientKey":{"type":"Buffer","data":"base64:BK+qirZEiXGjshzcueFXar+Tg6Edmxej0jno5olut/r4wmnr9Ln0gimd7TY3CQBEhKaV7xn3pUFwlPwNYl4I23A="},"hash":{"type":"Buffer","data":"base64:H7lD3wyEUS5sjAg25iAPe8Zf3dqFVPfrWszwq+xiC6E="},"signature":{"type":"Buffer","data":"base64:MEUCIQD1kdTIxZlJgpXRs03LPhPgr/d6t+0ZobzUxdER1JOiCQIgD4bsgtOFkgouewUfVQLRbofy684tZSzJlmZ6Pi/pSsc="}}],"acceptances":[{"uuid":"55da4d63-971a-4eea-8d98-61f7f854ceca","publicKey":{"type":"Buffer","data":"base64:BK+qirZEiXGjshzcueFXar+Tg6Edmxej0jno5olut/r4wmnr9Ln0gimd7TY3CQBEhKaV7xn3pUFwlPwNYl4I23A="},"body":{"requestId":"cde1234","makerId":"GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3","offerAsset":"native","offerAmount":200,"requestAsset":"peanuts","requestAmount":95,"conditions":[],"juryPool":"ghi1234","challengeStake":5,"audience":[],"takerId":"GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV","message":"accepted","previousHash":{"type":"Buffer","data":"base64:H7lD3wyEUS5sjAg25iAPe8Zf3dqFVPfrWszwq+xiC6E="}},"recipientKey":{"type":"Buffer","data":"base64:BPrzfk1AFeWtnRshPYsrEmGpfspeDNH6sAU3/nOpndpjwM91z9RTB3AGChgmzOhaWQR4mZHV5UtNd1843IkRIPI="},"hash":{"type":"Buffer","data":"base64:QEzqyO3sWqurWNrbhXB39LsA5d/xswDNHKhkZdw2DsM="},"signature":{"type":"Buffer","data":"base64:MEQCIGvsodYrND5r5/11Sp5rzpOlfnKhb/nmwykJka2kKV+qAiAND9RWX6y8eVFZebCsjzPsApzlApfkoy4lXmujBRdQfQ=="}}],"fulfillments":[],"resolution":{"uuid":"a2166564-3e2f-414e-985f-2fa3d8b07c6e","publicKey":{"type":"Buffer","data":"base64:BPrzfk1AFeWtnRshPYsrEmGpfspeDNH6sAU3/nOpndpjwM91z9RTB3AGChgmzOhaWQR4mZHV5UtNd1843IkRIPI="},"body":{"requestId":"cde1234","makerId":"GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3","takerId":"GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV","message":"resolved","previousHash":{"type":"Buffer","data":"base64:qXl/ueIQVYXWGKZqrTDaKTsZfo/Du9WrfFPpcwfjSg0="}},"hash":{"type":"Buffer","data":"base64:JOSJrht6YbQnGjg3c9nrbIBmac2qfFIJ3DE9jjDoLM4="},"signature":{"type":"Buffer","data":"base64:MEUCIQCqepz36JnsyLwtAuvQKPiCX+Cf2sWF/y88GluvHOWvAAIgNuweSaA64cKSLd85mryEbB57Q4KvW2+KEYtXff81aTE="}},"settlementInitiated":{"uuid":"5962b1a4-6cf9-47f3-b42b-00bb00718037","publicKey":{"type":"Buffer","data":"base64:BPrzfk1AFeWtnRshPYsrEmGpfspeDNH6sAU3/nOpndpjwM91z9RTB3AGChgmzOhaWQR4mZHV5UtNd1843IkRIPI="},"body":{"makerId":"GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3","takerId":"GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV","requestId":"cde1234","message":"settlementInitiated","escrow":"GDJ3JCGI6IOTUFF6TJ4IDB2OIICFEDNLNTHVDRFDHRINJE72QOQU66JG","previousHash":{"type":"Buffer","data":"base64:QEzqyO3sWqurWNrbhXB39LsA5d/xswDNHKhkZdw2DsM="}},"recipientKey":{"type":"Buffer","data":"base64:BK+qirZEiXGjshzcueFXar+Tg6Edmxej0jno5olut/r4wmnr9Ln0gimd7TY3CQBEhKaV7xn3pUFwlPwNYl4I23A="},"hash":{"type":"Buffer","data":"base64:R+k82VZhtT1FwigHhKXb8G1X4PfrrXGnkzFEIWI9fRI="},"signature":{"type":"Buffer","data":"base64:MEUCIQDZpdFYP+v96GyuA1NkvUy7jRNKvIgS1uqWW57rXtE+PwIgHd5xf86zQYYevKTvmYshp0LUfc9Hvk37cph0Lda9K08="}},"signatureRequired":{"uuid":"82606748-5e39-4950-9732-b6fadf3cab97","publicKey":{"type":"Buffer","data":"base64:BPrzfk1AFeWtnRshPYsrEmGpfspeDNH6sAU3/nOpndpjwM91z9RTB3AGChgmzOhaWQR4mZHV5UtNd1843IkRIPI="},"body":{"makerId":"GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3","takerId":"GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV","requestId":"cde1234","message":"signatureRequired","transaction":"AAAAANO0iMjyHToUvpp4gYdOQgRSDatsz1HEozxQ1JP6g6FPAAAAyAAUVqkAAAACAAAAAAAAAAAAAAACAAAAAAAAAAEAAAAAYo4h6Lq9uidCXGzXtEYZObEB6M9DurLG2zg4Itl8YAMAAAAAAAAAAHc1lAAAAAAAAAAACAAAAAAYJf2teKEI0fmZRSwam/E+esu7RaxyvOw49ePdCSKUxgAAAAAAAAABCSKUxgAAAECa0xc4mzyNa+2zIP7gI0COC7gn9BLafjod73EJPRduwyEbJvYgS+Oo+4IYX1T703XFgioG0k9FdXfNdSwTofMG","previousHash":{"type":"Buffer","data":"base64:QEzqyO3sWqurWNrbhXB39LsA5d/xswDNHKhkZdw2DsM="}},"recipientKey":{"type":"Buffer","data":"base64:BK+qirZEiXGjshzcueFXar+Tg6Edmxej0jno5olut/r4wmnr9Ln0gimd7TY3CQBEhKaV7xn3pUFwlPwNYl4I23A="},"hash":{"type":"Buffer","data":"base64:qDmSR1MFqSd1GOQlta+9XHAE2tGGe0BBJY0ETPTV/7w="},"signature":{"type":"Buffer","data":"base64:MEQCIH1KvJkKPqK7M2XRmh37KLql46ARtDNJWXizGzvvGis7AiAbWM6FvTWzi+oB6wv7JScdwWYEaJpzUf9yop/Rsh8Y6A=="}}}]] '

const proposals = new Map(BJSON.parse(proposalsJson))

test('build agreement does', () => {
    //Assemble

    //Action
    const agreement = buildAgreement(proposals.get('cde1234'))

    //Assert
    expect(agreement.publicKey.toString('hex')).toEqual('04faf37e4d4015e5ad9d1b213d8b2b1261a97eca5e0cd1fab00537fe73a99dda63c0cf75cfd4530770060a1826cce85a5904789991d5e54b4d775f38dc891120f2')
    expect(agreement.body.message).toEqual('proposal')
    expect(agreement.body.makerId).toEqual('GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3')
    expect(agreement.body.offerAsset).toEqual('native')
    expect(agreement.body.offerAmount).toEqual(200)
    expect(agreement.body.requestAsset).toEqual('peanuts')
    expect(agreement.body.requestAmount).toEqual(100)

    const firstCounterOffer = agreement.next
    expect(firstCounterOffer.publicKey.toString('hex')).toEqual('04afaa8ab6448971a3b21cdcb9e1576abf9383a11d9b17a3d239e8e6896eb7faf8c269ebf4b9f482299ded363709004484a695ef19f7a5417094fc0d625e08db70')
    expect(firstCounterOffer.body.message).toEqual('countered')
    expect(firstCounterOffer.body.makerId).toEqual('GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3')
    expect(firstCounterOffer.body.takerId).toEqual('GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV')
    expect(firstCounterOffer.body.offerAsset).toEqual('native')
    expect(firstCounterOffer.body.offerAmount).toEqual(200)
    expect(firstCounterOffer.body.requestAsset).toEqual('peanuts')
    expect(firstCounterOffer.body.requestAmount).toEqual(80)

    const secondCounterOffer = agreement.next.next
    expect(secondCounterOffer.publicKey.toString('hex')).toEqual('04faf37e4d4015e5ad9d1b213d8b2b1261a97eca5e0cd1fab00537fe73a99dda63c0cf75cfd4530770060a1826cce85a5904789991d5e54b4d775f38dc891120f2')
    expect(secondCounterOffer.body.message).toEqual('countered')
    expect(secondCounterOffer.body.makerId).toEqual('GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3')
    expect(secondCounterOffer.body.takerId).toEqual('GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV')
    expect(secondCounterOffer.body.offerAsset).toEqual('native')
    expect(secondCounterOffer.body.offerAmount).toEqual(200)
    expect(secondCounterOffer.body.requestAsset).toEqual('peanuts')
    expect(secondCounterOffer.body.requestAmount).toEqual(95)

    const acceptance = agreement.next.next.next
    expect(acceptance.publicKey.toString('hex')).toEqual('04afaa8ab6448971a3b21cdcb9e1576abf9383a11d9b17a3d239e8e6896eb7faf8c269ebf4b9f482299ded363709004484a695ef19f7a5417094fc0d625e08db70')
    expect(acceptance.body.message).toEqual('accepted')
    expect(acceptance.body.makerId).toEqual('GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3')
    expect(acceptance.body.takerId).toEqual('GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV')
    expect(acceptance.body.offerAsset).toEqual('native')
    expect(acceptance.body.offerAmount).toEqual(200)
    expect(acceptance.body.requestAsset).toEqual('peanuts')
    expect(acceptance.body.requestAmount).toEqual(95)
})