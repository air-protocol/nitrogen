## Maker as Buyer
---

### Proposal
~~~
proposal { "requestId" : "abc1234", "makerId" : "GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3", "offerAsset" : "native", "offerAmount" : 200, "requestAsset" : "peanuts", "requestAmount" : 100, "timeStamp": "2019-07-23T15:28:56.782Z", "conditions" : [], "juryPool" : "ghi1234", "challengeStake" : 100, "audience" : []}
~~~

### AcceptOffer
~~~
accept { "requestId" : "abc1234", "makerId" : "GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3", "offerAsset" : "native", "offerAmount" : 200, "requestAsset" : "peanuts", "requestAmount" : 100, "timeStamp": "2019-07-23T15:28:56.782Z", "conditions" : [], "juryPool" : "ghi1234", "challengeStake" : 100, "audience" : [], "takerId" : "GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV", "message" : "accepted", "previousHash" : "c9aa1202c95719a6154706a94e784b380cbfb1e47fbd7d0fbc1864523bef7394"}
~~~

### ProposalResolved
~~~
resolve { "requestId" : "abc1234", "makerId" : "GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3", "takerId" : "GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV", "message" : "resolved", "timeStamp": "2019-07-23T15:28:56.782Z", "previousHash" : "c9aa1202c95719a6154706a94e784b380cbfb1e47fbd7d0fbc1864523bef7394"}
~~~

### Settlement
~~~
settle { "requestId" : "abc1234", "timeStamp": "2019-07-23T15:28:56.782Z", "secret" : "SAQEACFGGCOY46GR5ZNVNGX53COWMEOTXEFZSM5RNBIJ4LPKHIFIDWUH"}
~~~

### Fulfillment 
~~~
fulfillment { "requestId" : "abc1234", "makerId" : "GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3", "takerId" : "GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV", "message" : "fulfillment", "timeStamp": "2019-07-23T15:28:56.782Z", "fulfillment" : "account transfer", "previousHash" : "5d5214ba78b97d49a04a49092ba2ffc1de7b545d64a8c906d5db11c531f78b4f"}
~~~

### Buyer Disburse
~~~
disburse { "requestId" : "abc1234", "timeStamp": "2019-07-23T15:28:56.782Z", "secret" : "SAQEACFGGCOY46GR5ZNVNGX53COWMEOTXEFZSM5RNBIJ4LPKHIFIDWUH"}
~~~

### Seller Disburse
~~~
disburse { "requestId" : "abc1234", "timeStamp": "2019-07-23T15:28:56.782Z", "secret" : "SDN5W3B2RSO4ZHVCY3EXUIZQD32JDWHVDBAO5A3FBUF4BPQBZZ3ST6IT"}
~~~


## Taker as Buyer
---

### Proposal
~~~
proposal { "requestId" : "abc1234", "makerId" : "GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3", "offerAsset" : "peanuts", "offerAmount" : 100, "requestAsset" : "native", "requestAmount" : 200, "timeStamp": "2019-07-23T15:28:56.782Z", "conditions" : [], "juryPool" : "ghi1234", "challengeStake" : 100, "audience" : []}
~~~

### AcceptOffer
~~~
accept { "requestId" : "abc1234", "makerId" : "GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3", "offerAsset" : "peanuts", "offerAmount" : 100, "requestAsset" : "native", "requestAmount" : 200, "timeStamp": "2019-07-23T15:28:56.782Z", "conditions" : [], "juryPool" : "ghi1234", "challengeStake" : 100, "audience" : [], "takerId" : "GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV", "message" : "accepted", "previousHash" : "9ee195b2a9bde6a67d781e1357daf060a32b28c68366237b4b7891dec69c762d"}
~~~

### ProposalResolved
~~~
resolve { "requestId" : "abc1234", "makerId" : "GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3", "takerId" : "GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV", "message" : "resolved", "timeStamp": "2019-07-23T15:28:56.782Z", "previousHash" : "9ee195b2a9bde6a67d781e1357daf060a32b28c68366237b4b7891dec69c762d"}
~~~

### Settlement
~~~
settle { "requestId" : "abc1234", "timeStamp": "2019-07-23T15:28:56.782Z", "secret" : "SDN5W3B2RSO4ZHVCY3EXUIZQD32JDWHVDBAO5A3FBUF4BPQBZZ3ST6IT"}
~~~

### ViewEscrow
~~~
viewEscrow abc1234
~~~

### Fulfillment 
~~~
fulfillment { "requestId" : "abc1234", "makerId" : "GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3", "takerId" : "GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV", "message" : "fulfillment", "timeStamp": "2019-07-23T15:28:56.782Z", "fulfillment" : "account transfer", "previousHash" : "d627835e50f31fe4d305e399bf07f24862af3d4f5b3921fe5d04d286cc8dde69"}
~~~

### Buyer Disburse
~~~
disburse { "requestId" : "abc1234", "timeStamp": "2019-07-23T15:28:56.782Z", "secret" : "SDN5W3B2RSO4ZHVCY3EXUIZQD32JDWHVDBAO5A3FBUF4BPQBZZ3ST6IT"}
~~~

### Seller Disburse
~~~
disburse { "requestId" : "abc1234", "timeStamp": "2019-07-23T15:28:56.782Z", "secret" : "SAQEACFGGCOY46GR5ZNVNGX53COWMEOTXEFZSM5RNBIJ4LPKHIFIDWUH"}
~~~

## Alternate flow (maker is buyer with a counter offer that they accept)
---

### Proposal (sent from maker as buyer)
~~~
proposal { "requestId" : "cde1234", "makerId" : "GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3", "offerAsset" : "native", "offerAmount" : 200, "requestAsset" : "peanuts", "requestAmount" : 100, "timeStamp": "2019-07-23T15:28:56.782Z", "conditions" : [], "juryPool" : "ghi1234", "challengeStake" : 5, "audience" : []}
~~~

### Counter Offer (sent from taker as seller)
Previous hash is to proposal
~~~
counterOffer { "requestId" : "cde1234", "makerId" : "GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3", "offerAsset" : "native", "offerAmount" : 200, "requestAsset" : "peanuts", "requestAmount" : 80, "timeStamp": "2019-07-23T15:28:56.782Z", "conditions" : [], "juryPool" : "ghi1234", "challengeStake" : 5, "audience" : [], "takerId" : "GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV", "message" : "countered", "previousHash" : "61e000d3d2733a5982c3a7ffe944480829302b193d6747f3a545c8e752278e76"}
~~~

### AcceptOffer (sent from maker as buyer)
Previous hash is to counter offer
~~~
accept { "requestId" : "cde1234", "makerId" : "GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3", "offerAsset" : "native", "offerAmount" : 200, "requestAsset" : "peanuts", "requestAmount" : 80, "timeStamp": "2019-07-23T15:28:56.782Z", "conditions" : [], "juryPool" : "ghi1234", "challengeStake" : 5, "audience" : [], "takerId" : "GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV", "message" : "accepted", "previousHash" : "534309e0e155bbf01442fde4e23b236bacfcd83c2dcd93775fa4306009ad9f8e"}
~~~

### ProposalResolved (sent from maker as buyer)
Previous hash is to proposal (Remember that you can resolve without taking an acceptance)
~~~
resolve { "requestId" : "cde1234", "makerId" : "GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3", "takerId" : "GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV", "message" : "resolved", "timeStamp": "2019-07-23T15:28:56.782Z", "previousHash" : "61e000d3d2733a5982c3a7ffe944480829302b193d6747f3a545c8e752278e76"}
~~~

### Settlement (sent from maker as buyer)
The settlementInitiated message is generated and has a previous hash to the resolved acceptance
~~~
settle { "requestId" : "cde1234", "timeStamp": "2019-07-23T15:28:56.782Z", "secret" : "SAQEACFGGCOY46GR5ZNVNGX53COWMEOTXEFZSM5RNBIJ4LPKHIFIDWUH"}
~~~

### Fulfillment  (optionally sent from maker as buyer and or taker as seller)
Previous hash is to resolved acceptance
~~~
fulfillment { "requestId" : "cde1234", "makerId" : "GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3", "takerId" : "GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV", "message" : "fulfillment", "timeStamp": "2019-07-23T15:28:56.782Z", "fulfillment" : "account transfer", "previousHash" : "bbbca0262627e4438f676134b9e633dd599f53bce26890e872041977f91a63db"}
~~~

### Disburse (from maker buyer)
SignatureRequired message is generated and its previous hash is to the resolved acceptance
~~~
disburse { "requestId" : "cde1234", "timeStamp": "2019-07-23T15:28:56.782Z", "secret" : "SAQEACFGGCOY46GR5ZNVNGX53COWMEOTXEFZSM5RNBIJ4LPKHIFIDWUH"}
~~~

### Seller (from taker seller) 
disbursed message is generated and its previous hash is to the resolved acceptance
~~~
disburse { "requestId" : "cde1234", "timeStamp": "2019-07-23T15:28:56.782Z", "secret" : "SDN5W3B2RSO4ZHVCY3EXUIZQD32JDWHVDBAO5A3FBUF4BPQBZZ3ST6IT"}
~~~

## Adjudication
---

### Adjudicate
~~~
adjudicate { "requestId" : "cde1234", "timeStamp": "2019-07-23T15:28:56.782Z" } 
~~~

### Validate agreement on an adjudication
~~~
validateAgreement {"requestId" : "abc1234", "agreementIndex" : 0}
~~~

### Ruling
~~~
ruling { "secret" : "SC5LFR4I5NEYXAWIPUD5C5NWLIK65BLG2DYRWHIBP7JMVQ3D3BIUU46J", "requestId" : "abc1234", "timeStamp": "2019-07-23T15:28:56.782Z", adjudicationIndex" : 0, "favor" : "buyer", "justification" : "for the fact" }
~~~