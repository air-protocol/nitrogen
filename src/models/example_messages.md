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
{ "requestId" : "abc1234", "makerId" : "lucy", "offerAsset" : "walnuts", "offerAmount" : 300, "requestAsset" : "peanuts", "requestAmount" : 800, "conditions" : [], "juryPool" : "ghi1234", "challengeStake" : 100, "audience" : [], "takerId": "ricky", "previousHash":{"type":"Buffer","data":[125,155,166,58,33,34,105,149,77,162,117,210,91,208,253,205,68,139,243,205,24,227,37,169,181,96,97,4,249,146,239,133]}}
~~~