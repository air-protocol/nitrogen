### Proposal
~~~
{ "requestId" : "abc1234", "makerId" : "GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3", "offerAsset" : "native", "offerAmount" : 200, "requestAsset" : "peanuts", "requestAmount" : 100, "conditions" : [], "juryPool" : "ghi1234", "challengeStake" : 100, "audience" : []}
~~~

### AcceptOffer
~~~
{ "requestId" : "abc1234", "makerId" : "GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3", "offerAsset" : "native", "offerAmount" : 200, "requestAsset" : "peanuts", "requestAmount" : 100, "conditions" : [], "juryPool" : "ghi1234", "challengeStake" : 100, "audience" : [], "takerId" : "GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV", "message" : "accepted", "previousHash" : {"type" : "Buffer","data" : [34,130,49,216,182,133,186,114,78,19,47,203,148,197,250,191,52,81,194,209,91,18,36,173,16,22,75,187,130,52,250,85]}}
~~~

### ProposalResolved
~~~
{ "requestId" : "abc1234", "makerId" : "GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3", "takerId" : "GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV", "message" : "resolved", "previousHash" : {"type" : "Buffer","data" : [34,130,49,216,182,133,186,114,78,19,47,203,148,197,250,191,52,81,194,209,91,18,36,173,16,22,75,187,130,52,250,85]}}
~~~

### Settlement
~~~
{ "requestId" : "abc1234", "makerId" : "GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3", "secret" : "SAQEACFGGCOY46GR5ZNVNGX53COWMEOTXEFZSM5RNBIJ4LPKHIFIDWUH"}