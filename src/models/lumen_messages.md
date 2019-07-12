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