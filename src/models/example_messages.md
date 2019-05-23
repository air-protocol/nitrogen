### Proposal
~~~
{ "requestId" : "abc1234", "makerId" : "lucy", "offerAsset" : "walnuts", "offerAmount" : 200, "requestAsset" : "peanuts", "requestAmount" : 1000, "conditions" : [], "juryPool" : "ghi1234", "challengeStake" : 100, "audience" : []}
~~~

### CounterOffer
~~~
{ "requestId" : "abc1234", "makerId" : "lucy", "offerAsset" : "walnuts", "offerAmount" : 300, "requestAsset" : "peanuts", "requestAmount" : 600, "conditions" : [], "juryPool" : "ghi1234", "challengeStake" : 100, "audience" : [], "takerId": "ricky", "previousHash":{"type":"Buffer","data":[139,133,222,29,209,223,183,108,242,41,97,234,80,191,245,24,83,163,42,239,102,173,66,251,43,236,104,34,188,171,68,187]}}
~~~

### CounterCounterOffer
~~~
{ "requestId" : "abc1234", "makerId" : "lucy", "offerAsset" : "walnuts", "offerAmount" : 300, "requestAsset" : "peanuts", "requestAmount" : 800, "conditions" : [], "juryPool" : "ghi1234", "challengeStake" : 100, "audience" : [], "takerId": "ricky", "previousHash":{"type":"Buffer","data":[93,106,202,53,13,64,149,86,30,111,212,150,178,203,4,181,208,67,211,147,88,146,127,3,9,214,231,241,154,128,178,205]}}
~~~