## Maker as Buyer
---

### Proposal
~~~
proposal { "requestId" : "abc1234", "makerId" : "GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3", "offerAsset" : "native", "offerAmount" : 200, "requestAsset" : "peanuts", "requestAmount" : 100, "conditions" : [], "juryPool" : "ghi1234", "challengeStake" : 100, "audience" : []}
~~~

### AcceptOffer
~~~
accept { "requestId" : "abc1234", "makerId" : "GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3", "offerAsset" : "native", "offerAmount" : 200, "requestAsset" : "peanuts", "requestAmount" : 100, "conditions" : [], "juryPool" : "ghi1234", "challengeStake" : 100, "audience" : [], "takerId" : "GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV", "message" : "accepted", "previousHash" : "228231d8b685ba724e132fcb94c5fabf3451c2d15b1224ad10164bbb8234fa55"}
~~~

### ProposalResolved
~~~
resolve { "requestId" : "abc1234", "makerId" : "GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3", "takerId" : "GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV", "message" : "resolved", "previousHash" : "228231d8b685ba724e132fcb94c5fabf3451c2d15b1224ad10164bbb8234fa55"}
~~~

### Settlement
~~~
settle { "requestId" : "abc1234", "secret" : "SAQEACFGGCOY46GR5ZNVNGX53COWMEOTXEFZSM5RNBIJ4LPKHIFIDWUH"}
~~~

### Fulfillment 
~~~
fulfillment { "requestId" : "abc1234", "makerId" : "GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3", "takerId" : "GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV", "message" : "fulfillment", "fulfillment" : "account transfer", "previousHash" : "93b5e4e59d588cb4c2af502a937f5f18986031c7947ea0f4df3d18b4e2584426"}
~~~

### Buyer Disburse
~~~
disburse { "requestId" : "abc1234", "secret" : "SAQEACFGGCOY46GR5ZNVNGX53COWMEOTXEFZSM5RNBIJ4LPKHIFIDWUH"}
~~~

### Seller Disburse
~~~
disburse { "requestId" : "abc1234", "secret" : "SDN5W3B2RSO4ZHVCY3EXUIZQD32JDWHVDBAO5A3FBUF4BPQBZZ3ST6IT"}
~~~


## Taker as Buyer
---

### Proposal
~~~
proposal { "requestId" : "abc1234", "makerId" : "GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3", "offerAsset" : "peanuts", "offerAmount" : 100, "requestAsset" : "native", "requestAmount" : 200, "conditions" : [], "juryPool" : "ghi1234", "challengeStake" : 100, "audience" : []}
~~~

### AcceptOffer
~~~
accept { "requestId" : "abc1234", "makerId" : "GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3", "offerAsset" : "peanuts", "offerAmount" : 100, "requestAsset" : "native", "requestAmount" : 200, "conditions" : [], "juryPool" : "ghi1234", "challengeStake" : 100, "audience" : [], "takerId" : "GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV", "message" : "accepted", "previousHash" : "b3c743e72d6ab472a99a324254b9f89f569bba8263d073152f55607ed012f04a"}
~~~

### ProposalResolved
~~~
resolve { "requestId" : "abc1234", "makerId" : "GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3", "takerId" : "GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV", "message" : "resolved", "previousHash" : "b3c743e72d6ab472a99a324254b9f89f569bba8263d073152f55607ed012f04a"}
~~~

### Settlement
~~~
settle { "requestId" : "abc1234", "secret" : "SDN5W3B2RSO4ZHVCY3EXUIZQD32JDWHVDBAO5A3FBUF4BPQBZZ3ST6IT"}
~~~

### ViewEscrow
~~~
viewEscrow abc1234
~~~

### Fulfillment 
~~~
fulfillment { "requestId" : "abc1234", "makerId" : "GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3", "takerId" : "GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV", "message" : "fulfillment", "fulfillment" : "account transfer", "previousHash" : "12708c2b91133312b5d6c5e04a19fbf5443986dfc07c5c9ed8bb8f8d9554b72c"}
~~~

### Buyer Disburse
~~~
disburse { "requestId" : "abc1234", "secret" : "SDN5W3B2RSO4ZHVCY3EXUIZQD32JDWHVDBAO5A3FBUF4BPQBZZ3ST6IT"}
~~~

### Seller Disburse
~~~
disburse { "requestId" : "abc1234", "secret" : "SAQEACFGGCOY46GR5ZNVNGX53COWMEOTXEFZSM5RNBIJ4LPKHIFIDWUH"}
~~~

## Alternate flow (maker is buyer with a counter offer that they accept)
---

### Proposal (sent from maker as buyer)
~~~
proposal { "requestId" : "cde1234", "makerId" : "GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3", "offerAsset" : "native", "offerAmount" : 200, "requestAsset" : "peanuts", "requestAmount" : 100, "conditions" : [], "juryPool" : "ghi1234", "challengeStake" : 5, "audience" : []}
~~~

### Counter Offer (sent from taker as seller)
Previous hash is to proposal
~~~
counterOffer { "requestId" : "cde1234", "makerId" : "GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3", "offerAsset" : "native", "offerAmount" : 200, "requestAsset" : "peanuts", "requestAmount" : 80, "conditions" : [], "juryPool" : "ghi1234", "challengeStake" : 5, "audience" : [], "takerId" : "GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV", "message" : "countered", "previousHash" : "a9797fb9e2105585d618a66aad30da293b197e8fc3bbd5ab7c53e97307e34a0d"}
~~~

### AcceptOffer (sent from maker as buyer)
Previous hash is to counter offer
~~~
accept { "requestId" : "cde1234", "makerId" : "GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3", "offerAsset" : "native", "offerAmount" : 200, "requestAsset" : "peanuts", "requestAmount" : 80, "conditions" : [], "juryPool" : "ghi1234", "challengeStake" : 5, "audience" : [], "takerId" : "GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV", "message" : "accepted", "previousHash" : "2c9afe76bfb3c86765742a984afaf28b4232ec2292c6ac179323c09d2dc9bdc7"}
~~~

### ProposalResolved (sent from maker as buyer)
Previous hash is to proposal (Remember that you can resolve without taking an acceptance)
~~~
resolve { "requestId" : "cde1234", "makerId" : "GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3", "takerId" : "GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV", "message" : "resolved", "previousHash" : "a9797fb9e2105585d618a66aad30da293b197e8fc3bbd5ab7c53e97307e34a0d"}
~~~

### Settlement (sent from maker as buyer)
The settlementInitiated message is generated and has a previous hash to the resolved acceptance
~~~
settle { "requestId" : "cde1234", "secret" : "SAQEACFGGCOY46GR5ZNVNGX53COWMEOTXEFZSM5RNBIJ4LPKHIFIDWUH"}
~~~

### Fulfillment  (optionally sent from maker as buyer and or taker as seller)
Previous hash is to resolved acceptance
~~~
fulfillment { "requestId" : "cde1234", "makerId" : "GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3", "takerId" : "GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV", "message" : "fulfillment", "fulfillment" : "account transfer", "previousHash" : "d3e192b7db6578c39e89dfb380fe003c06ac89d9beeed41e21b09314c82c1d79"}
~~~

### Disburse (from maker buyer)
SignatureRequired message is generated and its previous hash is to the resolved acceptance
~~~
disburse { "requestId" : "cde1234", "secret" : "SAQEACFGGCOY46GR5ZNVNGX53COWMEOTXEFZSM5RNBIJ4LPKHIFIDWUH"}
~~~

### Seller (from taker seller) 
disbursed message is generated and its previous hash is to the resolved acceptance
~~~
disburse { "requestId" : "cde1234", "secret" : "SDN5W3B2RSO4ZHVCY3EXUIZQD32JDWHVDBAO5A3FBUF4BPQBZZ3ST6IT"}
~~~

## Adjudication
---

### Adjudicate
~~~
adjudicate cde1234
~~~

### Ruling
~~~
ruling { "requestId" : "cde1234", "adjudicationIndex" : 1, "favor" : "buyer" }
~~~