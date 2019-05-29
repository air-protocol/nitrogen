### Proposal
~~~
{ "requestId" : "abc1234", "makerId" : "lucy", "offerAsset" : "walnuts", "offerAmount" : 200, "requestAsset" : "peanuts", "requestAmount" : 1000, "conditions" : [], "juryPool" : "ghi1234", "challengeStake" : 100, "audience" : []}
~~~

### CounterOffer
~~~
{ "requestId" : "abc1234", "makerId" : "lucy", "offerAsset" : "walnuts", "offerAmount" : 300, "requestAsset" : "peanuts", "requestAmount" : 600, "conditions" : [], "juryPool" : "ghi1234", "challengeStake" : 100, "audience" : [], "takerId": "ricky", "message": "countered", "previousHash":{"type":"Buffer","data":[139,133,222,29,209,223,183,108,242,41,97,234,80,191,245,24,83,163,42,239,102,173,66,251,43,236,104,34,188,171,68,187]}}
~~~

### CounterCounterOffer
~~~
{ "requestId" : "abc1234", "makerId" : "lucy", "offerAsset" : "walnuts", "offerAmount" : 300, "requestAsset" : "peanuts", "requestAmount" : 800, "conditions" : [], "juryPool" : "ghi1234", "challengeStake" : 100, "audience" : [], "takerId": "ricky", "previousHash":{"type":"Buffer","data":[103,151,204,176,164,116,231,143,75,168,57,118,179,193,82,163,156,112,218,54,188,11,49,56,22,7,122,25,190,47,180,28]}}
~~~

### RejectOffer
~~~
{ "requestId" : "abc1234", "makerId" : "lucy", "offerAsset" : "walnuts", "offerAmount" : 300, "requestAsset" : "peanuts", "requestAmount" : 600, "conditions" : [], "juryPool" : "ghi1234", "challengeStake" : 100, "audience" : [], "takerId": "ricky", "message": "refused", "previousHash":{"type":"Buffer","data":[69,185,53,22,0,104,213,140,177,218,85,247,190,191,177,113,222,234,68,232,248,18,236,152,52,78,26,6,113,244,163,187]}}
~~~

### AcceptOffer
~~~
{ "requestId" : "abc1234", "makerId" : "lucy", "offerAsset" : "walnuts", "offerAmount" : 300, "requestAsset" : "peanuts", "requestAmount" : 600, "conditions" : [], "juryPool" : "ghi1234", "challengeStake" : 100, "audience" : [], "takerId": "ricky", "message": "accepted", "previousHash":{"type":"Buffer","data":[69,185,53,22,0,104,213,140,177,218,85,247,190,191,177,113,222,234,68,232,248,18,236,152,52,78,26,6,113,244,163,187]}}
~~~

### ProposalResolved
~~~
{ "requestId" : "abc1234", "makerId" : "lucy", "takerId": "ricky", "message": "resolved", "previousHash":{"type":"Buffer","data":[139,133,222,29,209,223,183,108,242,41,97,234,80,191,245,24,83,163,42,239,102,173,66,251,43,236,104,34,188,171,68,187]}}
~~~