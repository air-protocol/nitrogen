## Maker as Buyer
---

### Proposal
~~~
proposal { "requestId" : "abc1234", "makerId" : "GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3", "offerAsset" : "native", "offerAmount" : 200, "requestAsset" : "peanuts", "requestAmount" : 100, "conditions" : [], "juryPool" : "ghi1234", "challengeStake" : 100, "audience" : []}
~~~

### AcceptOffer
~~~
accept { "requestId" : "abc1234", "makerId" : "GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3", "offerAsset" : "native", "offerAmount" : 200, "requestAsset" : "peanuts", "requestAmount" : 100, "conditions" : [], "juryPool" : "ghi1234", "challengeStake" : 100, "audience" : [], "takerId" : "GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV", "message" : "accepted", "previousHash" : {"type" : "Buffer","data" : [34,130,49,216,182,133,186,114,78,19,47,203,148,197,250,191,52,81,194,209,91,18,36,173,16,22,75,187,130,52,250,85]}}
~~~

### ProposalResolved
~~~
resolve { "requestId" : "abc1234", "makerId" : "GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3", "takerId" : "GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV", "message" : "resolved", "previousHash" : {"type" : "Buffer","data" : [34,130,49,216,182,133,186,114,78,19,47,203,148,197,250,191,52,81,194,209,91,18,36,173,16,22,75,187,130,52,250,85]}}
~~~

### Settlement
~~~
settle { "requestId" : "abc1234", "secret" : "SAQEACFGGCOY46GR5ZNVNGX53COWMEOTXEFZSM5RNBIJ4LPKHIFIDWUH"}
~~~

### Fulfillment 
~~~
fulfillment { "requestId" : "abc1234", "makerId" : "GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3", "takerId" : "GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV", "message" : "fulfillment", "fulfilment" : "account transfer", "previousHash" : {"type" : "Buffer","data":[225,115,25,35,101,215,158,46,73,95,216,210,123,67,52,231,17,190,51,145,198,195,135,142,219,77,187,26,204,252,49,101]}}
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
accept { "requestId" : "abc1234", "makerId" : "GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3", "offerAsset" : "peanuts", "offerAmount" : 100, "requestAsset" : "native", "requestAmount" : 200, "conditions" : [], "juryPool" : "ghi1234", "challengeStake" : 100, "audience" : [], "takerId" : "GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV", "message" : "accepted", "previousHash" : {"type" : "Buffer","data" : [179,199,67,231,45,106,180,114,169,154,50,66,84,185,248,159,86,155,186,130,99,208,115,21,47,85,96,126,208,18,240,74]}}
~~~

### ProposalResolved
~~~
resolve { "requestId" : "abc1234", "makerId" : "GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3", "takerId" : "GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV", "message" : "resolved", "previousHash" : {"type" : "Buffer","data" : [179,199,67,231,45,106,180,114,169,154,50,66,84,185,248,159,86,155,186,130,99,208,115,21,47,85,96,126,208,18,240,74]}}
~~~

### Settlement
~~~
settle { "requestId" : "abc1234", "secret" : "SDN5W3B2RSO4ZHVCY3EXUIZQD32JDWHVDBAO5A3FBUF4BPQBZZ3ST6IT"}
~~~

### ViewEscrow
~~~
viewEscrow GABKVQSC3AMSBWLS2QLDXIDMYW2WSHIQIHZIVCLQLFAUU2XQ3G7RVGQB
~~~

### Fulfillment 
~~~
fulfillment { "requestId" : "abc1234", "makerId" : "GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3", "takerId" : "GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV", "message" : "fulfillment", "fulfilment" : "account transfer", "previousHash" : {"type" : "Buffer","data":[225,115,25,35,101,215,158,46,73,95,216,210,123,67,52,231,17,190,51,145,198,195,135,142,219,77,187,26,204,252,49,101]}}
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
counterOffer { "requestId" : "cde1234", "makerId" : "GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3", "offerAsset" : "native", "offerAmount" : 200, "requestAsset" : "peanuts", "requestAmount" : 80, "conditions" : [], "juryPool" : "ghi1234", "challengeStake" : 5, "audience" : [], "takerId" : "GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV", "message" : "countered", "previousHash" : {"type":"Buffer","data":[169,121,127,185,226,16,85,133,214,24,166,106,173,48,218,41,59,25,126,143,195,187,213,171,124,83,233,115,7,227,74,13]}}
~~~

### AcceptOffer (sent from maker as buyer)
Previous hash is to counter offer
~~~
accept { "requestId" : "cde1234", "makerId" : "GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3", "offerAsset" : "native", "offerAmount" : 200, "requestAsset" : "peanuts", "requestAmount" : 80, "conditions" : [], "juryPool" : "ghi1234", "challengeStake" : 5, "audience" : [], "takerId" : "GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV", "message" : "accepted", "previousHash" : {"type":"Buffer","data":[6,93,208,121,252,179,154,65,17,239,85,200,23,221,98,195,8,71,41,248,229,170,166,21,218,125,192,2,120,53,192,200]}}
~~~

### ProposalResolved (sent from maker as buyer)
Previous hash is to proposal (Remember that you can resolve without taking an acceptance)
~~~
resolve { "requestId" : "cde1234", "makerId" : "GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3", "takerId" : "GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV", "message" : "resolved", "previousHash" : {"type":"Buffer","data":[169,121,127,185,226,16,85,133,214,24,166,106,173,48,218,41,59,25,126,143,195,187,213,171,124,83,233,115,7,227,74,13]}}
~~~

### Settlement (sent from maker as buyer)
The settlementInitiated message is generated and has a previous hash to the resolved acceptance
~~~
settle { "requestId" : "cde1234", "secret" : "SAQEACFGGCOY46GR5ZNVNGX53COWMEOTXEFZSM5RNBIJ4LPKHIFIDWUH"}
~~~

### Fulfillment  (optionally sent from maker as buyer and or taker as seller)
Previous hash is to resolved acceptance
~~~
fulfillment { "requestId" : "cde1234", "makerId" : "GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3", "takerId" : "GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV", "message" : "fulfillment", "fulfilment" : "account transfer", "previousHash" : {"type":"Buffer","data":[194,152,32,225,100,152,210,8,6,65,105,118,81,69,20,35,224,216,224,183,216,172,80,162,143,112,75,150,91,157,173,34]}}
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
