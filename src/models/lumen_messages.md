## Maker as Buyer
---

### Proposal
~~~
proposal { "requestId" : "abc1234", "makerId" : "GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3", "offerAsset" : "native", "offerAmount" : 200, "requestAsset" : "peanuts", "requestAmount" : 100, "conditions" : [], "juryPool" : "ghi1234", "challengeStake" : 100, "audience" : []}
~~~

### AcceptOffer
~~~
accept { "requestId" : "abc1234", "makerId" : "GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3", "offerAsset" : "native", "offerAmount" : 200, "requestAsset" : "peanuts", "requestAmount" : 100, "conditions" : [], "juryPool" : "ghi1234", "challengeStake" : 100, "audience" : [], "takerId" : "GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV", "message" : "accepted", "previousHash" : {"type":"Buffer","data":"base64:IoIx2LaFunJOEy/LlMX6vzRRwtFbEiStEBZLu4I0+lU="}}
~~~

### ProposalResolved
~~~
resolve { "requestId" : "abc1234", "makerId" : "GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3", "takerId" : "GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV", "message" : "resolved", "previousHash" : {"type":"Buffer","data":"base64:IoIx2LaFunJOEy/LlMX6vzRRwtFbEiStEBZLu4I0+lU="}}
~~~

### Settlement
~~~
settle { "requestId" : "abc1234", "secret" : "SAQEACFGGCOY46GR5ZNVNGX53COWMEOTXEFZSM5RNBIJ4LPKHIFIDWUH"}
~~~

### Fulfillment 
~~~
fulfillment { "requestId" : "abc1234", "makerId" : "GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3", "takerId" : "GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV", "message" : "fulfillment", "fulfillment" : "account transfer", "previousHash" : {"type":"Buffer","data":"base64:4XMZI2XXni5JX9jSe0M05xG+M5HGw4eO2027Gsz8MWU="}}
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
accept { "requestId" : "abc1234", "makerId" : "GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3", "offerAsset" : "peanuts", "offerAmount" : 100, "requestAsset" : "native", "requestAmount" : 200, "conditions" : [], "juryPool" : "ghi1234", "challengeStake" : 100, "audience" : [], "takerId" : "GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV", "message" : "accepted", "previousHash" : {"type":"Buffer","data":"base64:s8dD5y1qtHKpmjJCVLn4n1abuoJj0HMVL1VgftAS8Eo="}}
~~~

### ProposalResolved
~~~
resolve { "requestId" : "abc1234", "makerId" : "GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3", "takerId" : "GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV", "message" : "resolved", "previousHash" : {"type":"Buffer","data":"base64:s8dD5y1qtHKpmjJCVLn4n1abuoJj0HMVL1VgftAS8Eo="}}
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
fulfillment { "requestId" : "abc1234", "makerId" : "GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3", "takerId" : "GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV", "message" : "fulfillment", "fulfillment" : "account transfer", "previousHash" : {"type":"Buffer","data":"base64:byDoV0dzGcp44okeWnvkiF4dz0u7kPoiaeiKClFNy70="}}
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
counterOffer { "requestId" : "cde1234", "makerId" : "GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3", "offerAsset" : "native", "offerAmount" : 200, "requestAsset" : "peanuts", "requestAmount" : 80, "conditions" : [], "juryPool" : "ghi1234", "challengeStake" : 5, "audience" : [], "takerId" : "GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV", "message" : "countered", "previousHash" : {"type":"Buffer","data":"base64:qXl/ueIQVYXWGKZqrTDaKTsZfo/Du9WrfFPpcwfjSg0="}}
~~~

### AcceptOffer (sent from maker as buyer)
Previous hash is to counter offer
~~~
accept { "requestId" : "cde1234", "makerId" : "GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3", "offerAsset" : "native", "offerAmount" : 200, "requestAsset" : "peanuts", "requestAmount" : 80, "conditions" : [], "juryPool" : "ghi1234", "challengeStake" : 5, "audience" : [], "takerId" : "GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV", "message" : "accepted", "previousHash" : {"type":"Buffer","data":"base64:Bl3QefyzmkER71XIF91iwwhHKfjlqqYV2n3AAng1wMg="}}
~~~

### ProposalResolved (sent from maker as buyer)
Previous hash is to proposal (Remember that you can resolve without taking an acceptance)
~~~
resolve { "requestId" : "cde1234", "makerId" : "GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3", "takerId" : "GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV", "message" : "resolved", "previousHash" : {"type":"Buffer","data":"base64:Bl3QefyzmkER71XIF91iwwhHKfjlqqYV2n3AAng1wMg="}}
~~~

### Settlement (sent from maker as buyer)
The settlementInitiated message is generated and has a previous hash to the resolved acceptance
~~~
settle { "requestId" : "cde1234", "secret" : "SAQEACFGGCOY46GR5ZNVNGX53COWMEOTXEFZSM5RNBIJ4LPKHIFIDWUH"}
~~~

### Fulfillment  (optionally sent from maker as buyer and or taker as seller)
Previous hash is to resolved acceptance
~~~
fulfillment { "requestId" : "cde1234", "makerId" : "GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3", "takerId" : "GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV", "message" : "fulfillment", "fulfillment" : "account transfer", "previousHash" : {"type":"Buffer","data":"base64:wpgg4WSY0ggGQWl2UUUUI+DY4LfYrFCij3BLlludrSI="}}
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
